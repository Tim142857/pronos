var Sequelize = require('sequelize');
var sequelize = require('./config');


module.exports = sequelize.define('post', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  img: {
    type: Sequelize.STRING
  },
  text: {
    type: Sequelize.STRING,
    required: true
  }
}, {
  timestamps: true,
});
