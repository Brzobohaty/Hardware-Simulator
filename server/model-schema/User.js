var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
  username: String,
  password: String,
  surname: String,
  firstname: String,
  token: String
});

module.exports = mongoose.model('User', User);


