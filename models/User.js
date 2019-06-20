var Sequelize = require('sequelize');
var sequelize = require('./config');


module.exports = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  pseudo: {
    type: Sequelize.STRING,
    allowNull: false,
    validate:{
      len: [1,30]
    }
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate:{
      isEmail: true
    }
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    notEmpty: true
  },
  isAdmin: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  isVip: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  paymentDate: {
    type: Sequelize.DATE
  },
  stripeId: {
    type: Sequelize.STRING
  },
  ghost: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});
