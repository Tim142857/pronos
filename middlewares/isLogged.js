const Errors = require('../constants').errors;
module.exports = function (req, res, next) {
  if(req.session && req.session.user){
    next()
  } else {
    throw new Error(Errors.types.FORBIDDEN);
  }
}
