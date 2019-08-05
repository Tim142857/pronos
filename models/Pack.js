var Sequelize = require('sequelize');
var sequelize = require('./config');


module.exports = sequelize.define('pack', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  price: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  stripeId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  productStripeId: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});
