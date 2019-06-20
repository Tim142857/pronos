const Errors = require('../constants').errors;
module.exports = function (req, res, next) {
  if(req.session.user) next()
  throw new Error(Errors.types.FORBIDDEN);
  // res.status(403).send("You don't have the right to process this action!");
}
