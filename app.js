const path = require('path');
const express = require('express');
const bodyParser = require('body-parser')
const { check, validationResult } = require('express-validator/check');
const session = require('express-session')
const favicon = require('serve-favicon')
const _ = require('lodash')
const expressLayouts = require('express-ejs-layouts')


const Middlewares = require('./middlewares')
const Errors = require('./constants').errors;
const { UserManager, StripeManager } = require('./managers')

const PATH_TO_PUBLIC_LAYOUT = 'layouts/layoutPublic';

const EXAMPLE_USER = {
  name: "DuBouchon",
  firstName: 'Toto',
  email: 'toto@gmail.com',
  password: 'Pa$$w0rd',
  paymentDate: "25/07"
}


var app = express();
app.use(express.static('public'));
app.use(favicon(path.join(__dirname, 'favicon.ico')))
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))
app.use(Middlewares.addLocals)
// app.use(function (req, res, next) {
//   res.locals.user = req.user
//   res.locals.authenticated = !req.user.anonymous
//   next()
// })

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


//DEV ROUTES
app.get('/dev/login', function (req, res) {
  let email = 'emailTest@test.fr';
  let password = 'passwordTest';
  // let email = req.body.email;
  // let password = req.body.password;

  UserManager.login(email, password)
  .then(user => {
    if(user) {
      console.log('user found')
      req.session.user = user;
      console.log(req.session);
      res.redirect('/')
    }
    if(!user) {
      console.log('bad credentials')
      res.redirect('/')
    }
  })
  .catch(err => {
    throw new Error(Errors.types.INTERNAL_ERROR);
  })
})

app.get('/dev/espace-perso', function (req, res) {
  res.render('espace-perso')
})

//PUBLIC ROUTES
app.get('/', function (req, res) {
  var locals = {
    title: 'Youenn TA - Accueil',
    description: 'Page Description',
    header: 'Page Header',
    // user: EXAMPLE_USER
  };
  res.render('homepage', locals)
})

app.get('/register', function (req, res) {
  res.render('register')
})
app.post('/register', function (req, res) {
  let pseudo = 'df';
  let email = 'toto@gmail.com';
  let password = '1234';
  // let pseudo = req.body.pseudo;
  // let email = req.body.email;
  // let password = req.body.password;

  UserManager.register(pseudo, email, password)
  .then(user => {
    console.log('user created')
    res.redirect('/')
  })
  .catch(err => {
    console.log(err)
    if(err.name === 'SequelizeValidationError'){
      res.render('homepage', { form: req.body, error: err })
    } else {
      throw new Error(Errors.types.INTERNAL_ERROR);
    }
  })
})

app.get('/login', function (req, res) {
  var locals = {
    title: 'Youenn TA - Accueil',
    description: 'Page Description',
    header: 'Page Header',
    // user: EXAMPLE_USER
  };
  res.render('connexion', locals)
  // res.redirect('/');
  // res.render('login')
})
app.post('/login', function (req, res) {
  let email = 'emailTest@test.fr';
  let password = 'passwordTest';
  // let email = req.body.email;
  // let password = req.body.password;

  UserManager.login(email, password)
  .then(user => {
    if(user) {
      console.log('user found')
      req.session.user = user;
      console.log(req.session);
      res.redirect('/')
    }
    if(!user) {
      console.log('bad credentials')
      res.redirect('/')
    }
  })
  .catch(err => {
    throw new Error(Errors.types.INTERNAL_ERROR);
  })
})


//LOGGED ROUTES
app.get('/test', Middlewares.isLogged, function (req, res) {
  res.render('paymentTest', { user: EXAMPLE_USER })
})

//VIP ROUTES


//ADMIN routes




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.send('404')
});


// error handler
app.use(function(err, req, res, next) {
  console.log('###############    ERROR HANDLER    ##################')
  let formatedError;

  switch(err.message){
    case 'FORBIDDEN':
    formatedError = {
      code: Errors.codes.HTTP_403,
      type: Errors.types.FORBIDDEN,
      message: Errors.messages.NOT_ENOUGH_RIGHTS
    }
    break;
    default:
    console.log(err)
    formatedError = {
      code: Errors.codes.HTTP_500,
      type: Errors.types.INTERNAL_ERROR,
      message: Errors.messages.TRY_AGAIN
    }
    break;
  }
  res.send(formatedError)
  // // set locals, only providing error in development
  // res.locals.title = 'Error';
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};
  //
  // // render the error page
  // res.status(err.status || 500);
  // res.render('error');
});
let port = 3003;
app.listen(process.env.PORT || port, function () {
  console.log('Example app listening on port ' + port)
})
