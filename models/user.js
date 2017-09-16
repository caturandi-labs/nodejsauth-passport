// require mongoose 
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/nodeauth');
const db = mongoose.connection;
const bcrypt = require('bcryptjs'); //include bcryptjs

//User Schema / Skema database dari collections user
const UserSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    password: {
        type:String
    },
    email: {
        type: String
    },
    name:{
        type: String
    },
    profileImage: {
        type: String
    }
});

//export global variabel User dari mongoose model dan skema db yang ditentukan
const User = module.exports = mongoose.model('User', UserSchema);

//buat dan export method createUser
module.exports.createUser = (newUser,callback) =>{
    bcrypt.genSalt(10, (err,salt)=>{
        bcrypt.hash(newUser.password, salt, (err,hash)=>{
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

//buat method dan export untuk menangani findById
module.exports.getUserById = (id,callback) =>{
    User.findById(id,callback);
};

//buat dan export method untuk menangani find by username
module.exports.getUserByUsername = (username, callback) =>{
    const query = {username: username};
    User.findOne(query, callback);
};

//buat dan export method untuk compare password
/**
 * params candidatePassword : password plain dari form
 * hash : password yang sudah di hashing
 */
module.exports.comparePassword = (candidatePassword,hash,callback)=>{
    bcrypt.compare(candidatePassword,hash,(err,isMatch)=>{
        callback(null,isMatch);
    });
};