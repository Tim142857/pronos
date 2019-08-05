var express = require('express');
var router = express.Router();

const PATH_TO_PUBLIC_LAYOUT = 'layouts/layoutPublic';

const EXAMPLE_USER = {
  name: "DuBouchon",
  firstName: 'Toto',
  email: 'toto@gmail.com',
  password: 'Pa$$w0rd',
  paymentDate: "25/07"
}

router.get('/', function (req, res) {
  res.render('homepage', { user: EXAMPLE_USER })
})

router.get('/register', function (req, res) {
  let pseudo = 'df';
  let email = 'toto@gmail.com';
  let password = 'totoPassword';

  // let pseudo = req.body.pseudo;
  // let email = req.body.email;
  // let password = req.body.password;

  Models.User.create({ pseudo, email, password
  })
  .then(user => {
    res.redirect('/')
  })
  .catch(err => {
    if(err.name === 'SequelizeValidationError'){

    } else {
      throw new Error(Errors.types.INTERNAL_ERROR);
    }
  })
})

module.exports = router;
