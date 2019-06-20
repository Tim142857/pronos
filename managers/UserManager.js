const { User } = require('../models')
module.exports = {
  register: function(pseudo, email, password){
    console.log('ici2')
    return User.create({ pseudo, email, password })
  },
  login: function(email, password){
    return User.findOne({ where: { email, password } })
  }
}
