const User = require('./User');
const Post = require('./Post');
const Log = require('./Log');
const Pack = require('./Pack');
const Message = require('./Message');

var Models = {
  User,
  Post,
  Log,
  Pack,
  Message
}

Post.belongsTo(Pack, { as: 'pack'});
module.exports = Models;
