var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var User = mongoose.model('User');
var auth = require('../auth');

// ## Ruta para registracion

router.post('/users', function(req, res, next){
  var user = new User();
  console.log('llega');
  user.username = req.body.user.username;
  user.email = req.body.user.email;
  user.setPassword(req.body.user.password);

  user.save()
  .then(function(){
    return res.json({user: user.toAuthJSON()});
  }).catch(next);
});

// ## Ruta para login

router.use('/users/login', function(req, res, next){
  // primero me aseguro que esten completos usuario y contraseña
  if(!req.body.user.email){
    return res.status(422).json({errors: {email: "can't be blank"}});
  }

  if(!req.body.user.password){
    return res.status(422).json({errors: {email: "can't be blank"}});
  }
  // se usa 'local' porque es la palabra que se usa en passport.authenticate para
  // especificar la estrategia. (la cual esta configurada en config/passport.js)

  passport.authenticate('local', {session: false}, function(err, user, info){
    // aclaro session: false porque estoy usando JWT en lugar de sesiones.
    // la funcion que viene despues es la que corre como callback de la estrategia
    // es la funcion done que esta definida en config/passport.js
    if(err){return next(err);}

    if(user){
      user.token = user.generateJWT();
      return res.json({user: user.toAuthJSON()});
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

// ## Get Current User

// If the User.findById() promise doesn't get rejected, but the user we retrieved was
// a falsey value, that means the user id in the JWT payload is invalid, and we respond
// with a 401 status code. This only happens when you try to use a JWT of a user that's
// removed from the database, which should be an edge case since we won't be
// implementing how to delete a user.

router.get('/user', auth.required, function(req, res, next){
  User.findById(req.payload.id)
  .then(function(user){
    if(!user){ return res.sendStatus(401); }

    return res.json({user: user.toAuthJSON()});
  }).catch(next);
});

// ## esto para permitir que los usuarios actualicen su info

router.put('/user', auth.required, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    // only update fields that were actually passed...
    if(typeof req.body.user.username !== 'undefined'){
      user.username = req.body.user.username;
    }
    if(typeof req.body.user.email !== 'undefined'){
      user.email = req.body.user.email;
    }
    if(typeof req.body.user.bio !== 'undefined'){
      user.bio = req.body.user.bio;
    }
    if(typeof req.body.user.image !== 'undefined'){
      user.image = req.body.user.image;
    }
    if(typeof req.body.user.password !== 'undefined'){
      user.setPassword(req.body.user.password);
    }

    return user.save().then(function(){
      return res.json({user: user.toAuthJSON()});
    });
  }).catch(next);
});

module.exports = router;
