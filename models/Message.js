var Sequelize = require('sequelize');
var sequelize = require('./config');
var dateFormat = require('dateformat');


const Message = sequelize.define('message', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  pseudo: {
    type: Sequelize.STRING,
    required: false
  },
  email: {
    type: Sequelize.STRING,
    required: false
  },
  message: {
    type: Sequelize.STRING,
    required: false
  },
  userId: {
    type: Sequelize.INTEGER,
    required: false
  },
}, {
  timestamps: true,
});

module.exports = Message;
