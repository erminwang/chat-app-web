const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "User email is required"],
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: (value) => {
                return validator.isEmail(value);
            },
            message: '{VALUE} is not a valid email!'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

//Override
UserSchema.methods.toJSON = function(){
    var user = this; // this equals to the instance because this is UserSchema.methods
    var userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']);
};

/**
 * change the plain text password in the database to a hashed one and save, returning a  hashed token
 * @returns {Promise|*|PromiseLike<T>|Promise<T>}
 */
UserSchema.methods.generateAuthToken = function() {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString()}, 'e3R0m1I2n5W7a7N4g1').toString();

  user.tokens.push({
      access,
      token
  });

  return user.save().then(() => {
      return token;
  });
};

UserSchema.statics.findByToken = function(token) {
    var User = this;   // this equals to the User model because this is UserSchema.statics
    var decoded;

    try {
        decoded = jwt.verify(token, 'e3R0m1I2n5W7a7N4g1');
    } catch (e) {
        return new Promise((resolve, reject) => {
            reject();
        });

        // or use: return Promise.reject();
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

var User = mongoose.model('User', UserSchema);

module.exports = {User};