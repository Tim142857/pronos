const { User, Pack } = require('../models')
const { SK } = require('conf').stripe;
const stripe = require('stripe')(SK);
const to = require('await-to-js')
const sequelize = require('models/config')
const Sequelize = require('sequelize')
const Op = Sequelize.Op;

module.exports = {
  register: function(pseudo, email, password){
    return User.create({ pseudo, email, password })
    .then(user => {
      return stripe.customers.create({
        email: user.email,
      })
      .then(stripeCustomer => {
        return user.update({
          stripeId: stripeCustomer.id
        })
      })
    })
    .catch(e => {
      throw e;
    })
  },
  login: function(email, password){
    return User.findOne({ where: { email, password } })
    .catch(e => {
      throw e;
    })
  },
  addSource: async function(user, srcId){
    var user = await User.findByPk(user.id)
    user.defaultSource = srcId;
    return Promise.all([
      stripe.customers.createSource(user.stripeId, { source: srcId }),
      stripe.customers.update(user.stripeId, { default_source: srcId }),
      user.save()
    ])
    .catch(e => {
      throw e;
    })
  },
  getSubscriptions: function(user, pack = undefined){
    var options = {};
    options.customer = user.stripeId;
    if(pack) options.plan = pack.stripeId;
    return stripe.subscriptions.list(options);
  },
  suscribe: async function(user, packStripeId){
    var pack = await Pack.findOne({ where: { stripeId: packStripeId } })
    var subscriptions = await module.exports.getSubscriptions(user, pack);
    if(subscriptions.data.length > 0){ //already subscribed
      return Promise.reject(new Error('Dejà abonné!'))
    } else {
      return stripe.subscriptions.create({
        customer: user.stripeId,
        items: [
          {
            plan: pack.stripeId,
          },
        ],
      });
    }
  },
  checkIfSubscribe: async function(user, pack){
    if(user.isVip){
      return true;
    } else {
      return module.exports.getSubscriptions(user, pack)
      .then(subscriptions => {
        if(subscriptions.data && subscriptions.data.length > 0){
          return Promise.resolve(true)
        } else {
          return Promise.resolve(false);
        }
      })
    }
  },
  searchMembers: function(val){
    return User.findAll({
      where: {
        [Op.or]: {
          pseudo: { [Op.like]: '%' + val + '%'},
          email: { [Op.like]: '%' + val + '%' },
        }
      }
    })
  },
  changeVipStatus: async function(userId){
    return User.findByPk(userId)
    .then(async(user) => {
      user.isVip = !user.isVip;
      user = await user.save()
      return user;
    })
  },
  getPacksSuscribed: function(user){
    return module.exports.getSubscriptions(user)
    .then(async (subscriptions) => {
      let packs = [];
      for(var i = 0; i < subscriptions.data.length; i++){
        let stripeId = subscriptions.data[i].plan.id
        let pack = await Pack.findOne({ where: { stripeId } })
        packs.push(pack)
      }
      return Promise.resolve(packs)
    })
  }
}
