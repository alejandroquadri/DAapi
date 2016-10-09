var secreto;

if (process.env.NODE_ENV === 'production'){
  secreto = 'secret';
}

module.exports = {
  secret: secreto
};

// module.exports = {
//   //secret: process.env.NODE_ENV === 'production' ? process.env.SECRET : 'secret'
//   secret: 'secret'
// };
