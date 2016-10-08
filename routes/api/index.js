var router = require('express').Router();

router.use('/', require('./users'));

// ## Lo de abajo es un error handler para las rutas

// When a middleware is defined with 4 arguments, it will be treated as an error
// handler (the first argument is always the error object). This error handler
// sits after all of our API routes and is used for catching ValidationErrors
// thrown by mongoose. The error handler then parses the error into something our
// front-end can understand, then responds with a 422 status code.

router.use(function(err, req, res, next){
  if(err.name === 'ValidationError'){
    return res.status(422)
    .json({
      errors: Object.keys(err.errors)
      .reduce(function(errors,key){
        errors[key] = err.errors[key].message;
        return errors;
      }, {})
    });
  }
  return next(err);
});

module.exports = router;
