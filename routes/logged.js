var express = require('express');
var router = express.Router();
const Middlewares = require('../middlewares')
const PATH_TO_PUBLIC_LAYOUT = 'layouts/layoutPublic';

const EXAMPLE_USER = {
  name: "DuBouchon",
  firstName: 'Toto',
  email: 'toto@gmail.com',
  password: 'Pa$$w0rd',
  paymentDate: "25/07"
}

router.use(Middlewares.isLogged);
router.get('/test', function (req, res) {
  res.send({toto:'toto'})
})


module.exports = router;
