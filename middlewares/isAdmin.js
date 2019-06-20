module.exports = function (req, res, next) {
  if(req.session.user.isAdmin) next()
  res.status(403).send("You don't have the right to process this action!");
}
