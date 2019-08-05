const path = require('path');
const express = require('express');
const bodyParser = require('body-parser')
const { check, validationResult } = require('express-validator/check');
const session = require('express-session')
const favicon = require('serve-favicon')
const _ = require('lodash')
const expressLayouts = require('express-ejs-layouts')
const flash = require('connect-flash');
const fileUpload = require('express-fileupload');


const Middlewares = require('./middlewares')
const Errors = require('./constants').errors;
const { UserManager, StripeManager } = require('./managers')
const { Log, Pack, Post, User } = require('./models')

const PATH_TO_PUBLIC_LAYOUT = 'layouts/layoutPublic';

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

app.use('/pronos-uploads', [ Middlewares.isLogged, Middlewares.hasRightsToSeeProno,  express.static(__dirname + '/uploads')]);
app.use(flash());
app.use(Middlewares.addLocals)
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(function(req, res, next){
  let flashes = req.flash();
  res.locals.flashMessages = flashes;
  res.locals.title = 'Youenn YA - Pronostics sportifs',
  res.locals.description = 'Site de pronostics de paris sportifs',
  res.locals.user = req.session.user ? req.session.user : null;
  res.locals.isNullOrUndefined = function(data){
    var result = typeof data === 'undefined' || data === null;
    return result;
  }
  next();
})
app.use(fileUpload());



//DEV ROUTES
app.get('/dev/connexion', function (req, res) {
  let email = 'emailTest@test.fr';
  let password = 'passwordTest';
  // let email = req.body.email;
  // let password = req.body.password;

  UserManager.connexion(email, password)
  .then(user => {
    if(user) {
      req.session.user = user;
      res.redirect('/')
    }
    if(!user) {
      res.redirect('/')
    }
  })
  .catch(err => {
    throw new Error(Errors.types.INTERNAL_ERROR);
  })
})

//PUBLIC ROUTES
app.get(['/', '/accueil'], function (req, res) {
  res.locals.title = 'Youenn YA - Accueil';
  res.render('homepage')
})

app.get('/inscription', function (req, res) {
  res.locals.title = 'Youenn YA - Inscription';
  var redirectTo = '';
  if(req.get('Referrer') && req.get('Referrer').indexOf('inscription')== -1 && req.get('Referrer').indexOf('connexion')== -1) { //Si on vient pas de /connexion ou /inscription, il faut rediriger après inscription
    redirectTo = req.get('Referrer');
  }
  res.render('inscription', {redirectTo})
})
app.post('/inscription', function (req, res, next) {
  let email = req.body.email;
  let password = req.body.password;
  let passwordconfirm = req.body.passwordconfirm;
  let pseudo = req.body.pseudo;
  let redirectTo = req.body.redirectTo;
  if(password.length == 0 || password !== passwordconfirm){
    req.flash('warning', 'Vous devez entrer 2 mot de passe identiques');
    res.redirect('/inscription');
  }

  UserManager.register(pseudo, email, password)
  .then(user => {
    req.flash('success', 'Votre inscription a bien été validée')
    UserManager.login(email, password)
    .then(user => {
      if(user) {
        req.session.user = user;
        if(redirectTo != ''){
          res.redirect(redirectTo)
        } else {
          res.redirect('/')
        }
      }
    })
  })
  .catch(err => {
    if(err.name === 'SequelizeValidationError'){
      let errors = err.errors;
      errors.forEach(function(err){
        switch(err.path){
          case 'pseudo':
          req.flash('warning', 'Votre pseudo doit contenir entre 2 et 30 charactères alphanumériques');
          break;
          case 'email':
          req.flash('warning', 'Vous avez entrer une mauvaise adresse mail ou bien elle est déjà utilisée');
          break;
          case 'password':
          req.flash('Vous devez entrer un pseudo valide');
          break;
          default:
          console.log(err.message);
          console.log(err.path);
          req.flash('warning', 'Une erreur est survenue pendant votre inscription, veuillez réessayer')
        }
      })
      res.redirect('/inscription');
    } else {
      next(err)
    }
  })
})

app.get('/connexion', function (req, res) {
  res.locals.title = 'Youenn YA - Connexion'
  res.render('connexion')
})
app.post('/connexion', function (req, res) {
  let email = req.body.email;
  let password = req.body.password;

  UserManager.login(email, password)
  .then(user => {
    if(user) {
      req.session.user = user;
      res.redirect('/')
    }
    else {
      req.flash('danger', 'Bad Credentials!');
      res.redirect('/connexion')
    }
  })
  .catch(err => {
    throw new Error(Errors.types.INTERNAL_ERROR);
  })
})

app.get('/deconnexion', function (req, res) {
  if(req.session.user) delete req.session.user
  req.flash('success', 'Vous avez bien été déconnecté')
  res.redirect('/');
})


app.get('/pack/:packName', function (req, res) {
  if(req.session && req.session.user){
    Pack.findOne({ where: { name: req.params.packName } })
    .then(pack => {
      UserManager.getSubscriptions(req.session.user, pack)
      .then(objectList => {
        if(objectList.data.length > 0){
          res.redirect('/pronos/' + req.params.packName)
        } else {
          res.render('pack', { pack })
        }
      })
    })
  } else {
    Pack.findOne({ where: { name: req.params.packName } })
    .then(pack => {
      res.render('testpackdemerde', { pack })
    })
  }
})

//LOGGED ROUTES
app.get('/espace-perso', Middlewares.isLogged, function (req, res) {
  res.locals.title = 'Youenn YA - Espace personnel';
  User.scope('withPassword').findAll({ where: { id: req.session.user.id } })
  .then(users => {
    res.render('espace-perso', { user: users[0] })
  })
})


app.get('/pronos/:packName',function (req, res) {
  res.locals.title = 'Youenn YA - Espace personnel';
  if(!req.session || !req.session.user){
    res.redirect('/pack/' + req.params.packName)
  } else {
    //Check if user can access this pack
    Pack.findOne({ where: { name: req.params.packName }})
    .then(pack => {
      UserManager.checkIfSubscribe(req.session.user, pack)
      .then(enoughRights => {
        //if use rcan access, get last post from this pack
        if(enoughRights) {
          Post.findOne({
            include: [{
              model: Pack,
              as: 'pack',
              where: { name: req.params.packName }
            }],
            order: [ [ 'createdAt', 'DESC' ]]
          })
          .then(post => {
            if(post){
              res.render('pronos', { post })
            } else {
              req.flash('warning', "Pas encore de pronostic posté par Youenn pour ce pack")
              res.redirect('/');
            }
          })
        } else {
          //if user cant access this pack, redirect to subcription page of this pack
          res.render('pack', { pack: pack })
        }
      })
    })
  }
})

app.post('/suscribe', Middlewares.isLogged, function (req, res) {
  var packStripeId = req.body.packStripeId;
  UserManager.suscribe(req.session.user, packStripeId)
  .then(subscription => {
    req.flash('success', "L'abonnement s'est déroulé avec succès")
    res.redirect('/');
  })
  .catch(err => {
    req.flash('warning', "Vous êtes déjà abonné à ce pack")
    res.redirect('/');
  })
})

//ADMIN routes

app.get('/espace-admin', Middlewares.isAdmin, function (req, res) {
  res.locals.title = 'Youenn YA - Espace admin';
  Pack.findAll()
  .then(packs => {
    res.render('espace-admin', { packs })
  })
})

app.post('/create-prono', Middlewares.isAdmin, async function (req, res) {
  res.locals.title = 'Youenn YA - Espace admin';
  let packId = req.body.packId;
  let text = req.body.text;
  let file = req.files.img;

  let pack = await Pack.findByPk(packId);

  let path = __dirname + '/uploads/' + pack.name + '/' + file.name;
  //move the file to the good pack folder
  file.mv(path, function(err) {
    if(err)console.log(err);
  });
  Post.build({
    packId: packId,
    img: file.name,
    text
  })
  .save()
  .then(post => {
    req.flash('success', "le prono a bien été créé");
    res.redirect('espace-admin')
  })
  .catch(e => {
    req.flash('warning', "le prono n'a pu etre créé");
    res.redirect('espace-admin')
  })
})


//AJAX

app.post('/create-source', function (req, res, next) {
  var srcId = req.body.id;
  UserManager.addSource(req.session.user, srcId)
  .then(values => {
    // values = [src, stripeUser, user]
    var user = values[2];
    req.session.user = user;
    res.send({ success: true, src: user.defaultSource })
  })
  .catch(e => {
    console.log('source not created');
    console.log(e);
    let err = "Une erreur est survenue, veuillez réessayer ultérieurement"
    res.send({ success: false, err })
  })
})

app.post('/get-members', function(req, res, next){
  var val = req.body.val;
  return UserManager.searchMembers(val)
  .then(list => {
    res.send(list)
  })
})

app.post('/change-vip-status', function(req, res, next){
  return UserManager.changeVipStatus(req.body.userId)
  .then(newUser => {
    res.send(newUser)
  })
})

//VIP ROUTES





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.send('404')
});


// error handler
app.use(function(err, req, res, next) {
  console.log('###############    ERROR HANDLER    ##################')
  console.log('Original error without formating: ')
  console.log(err);
  let formatedError, message, user, userAgent, type, code;
  user = req.session && req.session.user ? req.session.user : null;
  Log.create({
    message: err.message,
    user,
    userAgent: req.get('user-agent'),
    type: err.type,
    code: err.statusCode
  })

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
let defaultPort = 3003;
let port = process.env.PORT || defaultPort;
app.listen(port, function () {
  console.log('Example app listening on port ' + port)
})
