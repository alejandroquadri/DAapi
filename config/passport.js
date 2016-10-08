var passport = require('passport');
var Localstrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');

var User = mongoose.model('User');

passport.use(new Localstrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]'
  // aca se puede poner un objeto con opciones para la estrategia
  // defino que se va a tomar en el campo de username y password
  // en funcion del enpoint para user
  // {
  //   "user":{
  //     "email": "jake@jake.jake",
  //     "password": "jakejake"
  //   }
  // }
  // aca esta el git con la explicacion https://github.com/jaredhanson/passport-local
}, function(email,password,done){
  User.findOne({email:email})
  // find one busca el primer registra que coincida con la query. Aca los docs https://docs.mongodb.com/manual/reference/method/db.collection.findOne/
  .then(function(user) {
     if(!user || !user.validPassword(password)){
       return done(null, false, {errors: {'email or password': 'is invalid'}});
     }
     return done(null, user);
  })
  .catch(done);
}));
