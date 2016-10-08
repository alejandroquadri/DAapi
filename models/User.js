var mongoose = require('mongoose');
// esto es una libreria para poder chequear que la propiedad sea unica
var uniqueValidator = require('mongoose-unique-validator');
// esto es para validar los passwords
var crypto = require('crypto');
// esto es para generar Jason web Tokens
var jwt = require('jsonwebtoken');
// aca estoy trayendo el secret
var secret = require('../config').secret;

var UserSchema = new mongoose.Schema({
  username: { // lo que sigue son validaciones extra para usuario
    type: String,
    lowercase: true,
    unique: true, //este campo es el que hace que username sea unique
    required: [true, "can't be blank"],
    match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
    index: true
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, "can't be blank"],
    match: [/\S+@\S+\.\S+/, 'is invalid'],
    index: true
  },
  bio: String,
  image: String,
  hash: String,
  salt: String
}, {timestamps: true});

// esto es para configurar el plugin de uniqueValidator
UserSchema.plugin(uniqueValidator, { message: 'is already taken'});

// creo un metodo para el usuario para setear un password. Para eso crea una salt
// una salt es un password con un poco de sal (letras y caracteres agregados)
// junto a eso asocia un hash

UserSchema.methods.setPassword = function(password){
  // primero creo una salt aleatoria
  // usa el modulo crytpo, pide 16 letras aletorias
  this.salt = crypto.randomBytes(16).toString('hex');
  // ahora creo el salt
  // pbkdf2Sync es un standard para encriptar palabras para passwords
  // este estandard crea un hash basado en el password y el salt y dsps lo modifica basado en el
  // algoritmo (ultimo termino) x cantidad de veces.
  // 5 parameters: The password to hash, the salt, the iteration (number of times to hash the password), the length (how long the hash should be), and the algorithm.
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.validPassword = function (password){
  // chequeo en funcion del password que me dan si es igual al hash que tengo guradado
  var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

//We need a secret in order to sign and validate JWT's. This secret should be a
// random string that is remembered for your application, it's essentially the password to your JWT's.
// In config/index.js there's a secret value which is set to "secret" in development, and reads from an environment variable in production.
UserSchema.methods.generateJWT = function(){
  // esto es para crear un metodo que genere el JWT que va a validar el cliente
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);
  // lo de arriba da una expiracion del token de 60 dias

  return jwt.sign({
    id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime()/1000)
  }, secret);
};

// Lastly, we'll need a method on the user model to get the JSON representation of the user that will be passed to the front-end during authentication. This JSON format should only be returned to that specific user, since it contains sensitive information like the JWT.
UserSchema.methods.toAuthJSON = function() {
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT()
  };
};

mongoose.model('User', UserSchema);
