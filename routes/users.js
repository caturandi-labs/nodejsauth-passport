
var express = require('express');
var router = express.Router();

//Handling File Upload
const multer = require('multer');
const upload = (multer({dest: './uploads'}));

//passport auth
const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');

const flash = require('connect-flash');

//include model
const User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


//route untuk menampilkan halaman register
router.get('/register', function(req, res, next) {
  res.render('register', {
    title: 'Register'
  });
});

//route untuk menampilkan halaman login
router.get('/login',(req,res,next) => {
  res.render('login',{title: 'Login'});
});

//route post untuk login user
router.post('/login',
  passport.authenticate('local', {failureRedirect: '/users/login', failureFlash: 'Invalid Username or Password'})
    ,(req,res) =>{
    req.flash('success','You Are now Logged in');
    res.redirect('/');
  });

passport.serializeUser((user,done)=>{
  done(null,user.id);
});

passport.deserializeUser((id,done)=>{
  User.getUserById(id, (err,user)=>{
    done(err,user);
  });
});

passport.use(new LocalStrategy((username, password, done)=>{
  User.getUserByUsername(username, (err,user)=>{
    if(err) throw err;
    if(!user){
      return done(null,false,{message: 'User Tidak ada'});
    }

    User.comparePassword(password, user.password, (err,isMatch)=>{
      if(err) return done(err);
      if(isMatch){
        return done(null,user);
      }else{
        return done(null,false, {message: 'Password Tidak Benar'});
      }
    });

  })
}));

//route untuk registrasi user member
router.post('/register',upload.single('profile-image'),(req,res,next) => {
  //variabel yang mengambil request dari form
  const name = req.body.name;
  const email =  req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  let profileImage = '';
  //untuk mengecek apakah ada file yang diupload
  if(req.file){
    console.log('Uploading File ....');
    profileImage = req.file.filename;
  }else{
    console.log('No File Uploading');
    profileImage = 'noimage.jpg';
  }

  /*
    validator form dengan express-validator
    parameter pertama adalah nama field,parameter kedua pesan yang akan ditampilkan
    method .notEmpty(); u
  */ 
  req.checkBody('name','Nama Wajib Diisi !').notEmpty().len({min: 8});
  req.checkBody('email','Alamat E-Mail Wajib Diisi !').notEmpty();
  req.checkBody('username','Username Wajib Diisi !').notEmpty();
  req.checkBody('password','Password Wajib Diisi !').notEmpty();
  req.checkBody('password','Password Tidak Cocok').equals(req.body.password);

  var errors = req.validationErrors();

  if(errors){
    res.render('register', {
      errors: errors
    });
  }else{
    const newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileImage: profileImage
    });

    User.createUser(newUser, (err,user)=>{
      if(err) throw err;
      console.log(user);
    });

    //untuk flash message
    req.flash('success','Selamat, Anda Sudah Terdaftar Sebagai member');

    res.location('/');
    res.redirect('/');
  }
});

router.get('/logout',(req,res)=>{
  req.logout();
  req.flash('success', 'You are Now logged out');
  res.redirect('/users/login');
});

module.exports = router;
