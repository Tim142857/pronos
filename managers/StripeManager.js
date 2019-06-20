const stripe = require("stripe")("sk_test_4eC39HqLyjWDarjtT1zdp7dc");
const conf = require('conf');

module.exports = {
  createCustomer: async function(user) {
    const customer = await stripe.customers.create({
      email: user.email,
      source: 'src_18eYalAHEMiOZZp1l9ZTjSU0',
    });
    //Associate stripeId to user and save it

    //return user
  },
  suscribe: async function() {
    const subscription = await stripe.subscriptions.create({
      customer: 'cus_4fdAW5ftNQow1a',
      items: [{plan: conf.stripe.ID_PRODUCT}],
    });
  }
}
