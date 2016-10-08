// se aceptan dos tipo de de verificacion
// Una verifica token y por tanto un usuario logueado y en consecuancia muesta algunas cosas
// si el usuario no esta logueado puede mostrar otras cosas, pero la acepta igual
// esto se refleja en que hayun auth required y el otro opcional

var jwt = require('express-jwt');
var secret = require('../config').secret;

// The getTokenFromHeader() function is a helper function that both middlewares use to
// extract the JWT token from the Authorization header. The only difference between the
// required and optional middlewares is that the optional middleware is configured with
// credentialsRequired: false so that requests without a token will still succeed.

function getTokenFromHeader(req){

  // esta funcion chequea en el objeto header, la propiedad authorization.
  // esta esperando que dicha propiedad contenga un string de la forma 'Token '+JWT
  // por tanto, primero digo si existe dicho objeto o la primer palabra es 'Token'
  // encontes que devuelva la segunda palabra, o sea el token.
  // si no te acordas como funcionaba la funcion split (http://www.w3schools.com/jsref/jsref_split.asp)

  if (req.headers.authorization && req.headers.authorization.split(' ')[0]==='Token'){
    return req.headers.authorization.split(' ')[1];
  }

  return null;
}

var auth = {
  required: jwt ({
    secret: secret,
    userProperty: 'payload',
    getToken: getTokenFromHeader
  }),
  optional: jwt({
    secret: secret,
    userProperty: 'payload',
    credentialsRequired: false,
    getToken: getTokenFromHeader
  })
};

module.exports = auth;
