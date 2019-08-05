const User = require('./User');
const Post = require('./Post');
const Log = require('./Log');
const Pack = require('./Pack');

var Models = {
  User,
  Post,
  Log,
  Pack
}

Post.belongsTo(Pack, { as: 'pack'});
module.exports = Models;
