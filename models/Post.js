var Sequelize = require('sequelize');
var sequelize = require('./config');
var dateFormat = require('dateformat');


const Post = sequelize.define('post', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  text: {
    type: Sequelize.STRING,
    required: true
  },
  rating: {
    type: Sequelize.INTEGER,
    required: true,
    defaultValue: 5
  },
  img: {
    type: Sequelize.STRING,
    required: true
  }
}, {
  timestamps: true,
});

module.exports = Post;
