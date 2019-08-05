var Sequelize = require('sequelize');
var sequelize = require('./config');


module.exports = sequelize.define('log', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  message: { type: Sequelize.STRING },
  user: { type: Sequelize.STRING },
  userAgent: { type: Sequelize.STRING },
  type: { type: Sequelize.STRING },
  code: { type: Sequelize.STRING },
}, {
  timestamps: true,
});
