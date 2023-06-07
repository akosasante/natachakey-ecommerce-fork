const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    unique: true, //checks for indexes, throws mongoose errors
    required: [true, 'Please provide email'],
    validate: {
      validator: validator.isEmail,
      message: 'Please provide valid email',
    },
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'user'], // acceptable values for the role property
    default: 'user',
  },
});

//before we save the document we hash password; this points to the user (this= user)
UserSchema.pre('save', async function () {
  //console.log(this.modifiedPaths()); //to see which properties were modified
  // console.log(this.isModified('name')); // in console we get false if we are not modifying name, and true if we do
  
  if (!this.isModified('password')) return; //if the password is not modified then stop, don´t apply lines 39, 40
  const salt = await bcrypt.genSalt(10); //but if we are creating a user or updating the password- yes, apply these two lines 39, 40
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch; //true
};

module.exports = mongoose.model('User', UserSchema);
