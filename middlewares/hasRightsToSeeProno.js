const { Pack} = require('../models')
const { UserManager } = require('../managers')
const Errors = require('../constants').errors;

module.exports = function (req, res, next) {
  if(req.session.user.isVip){
    next()
  } else {
    let arr = req.url.split('/');
    let packName = arr[1];
    Pack.findOne({ where: { name: packName } })
    .then(pack => {
      if(!pack){
        throw new Error(Errors.types.FORBIDDEN);
      } else {
        UserManager.getSubscriptions(req.session.user, pack)
        .then(objectList => {
          if(objectList.data.length > 0){
            next();
          } else {
            throw new Error(Errors.types.FORBIDDEN);
          }
        })
        .catch(e => {
          throw new Error(e)
        })
      }
    })
  }
}
