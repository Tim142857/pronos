const Errors = require('../constants').errors;
module.exports = function (req, res, next) {
  if(req.session.user && req.session.user.isAdmin){
    next()
  } else {
    throw new Error(Errors.types.FORBIDDEN);
  }
}
