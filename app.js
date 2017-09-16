const express = require('express'); //deklarasi express framework
const path = require('path'); //path
const favicon = require('serve-favicon'); 
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const session = require('express-session');
const passport = require('passport');
const expressValidator = require('express-validator');
const LocalStrategy = require('passport-local').Strategy;
const morgan = require('morgan')

//Handling File Upload
const multer = require('multer');
const upload = (multer({dest: './uploads'}));

//flash message
const flash = require('connect-flash');

//koneksi database nosql
const mongo = require('mongodb');
const mongoose = require('mongoose');
const db = mongoose.connection; //koneksi ORM Mongoose

//module dari router
const index = require('./routes/index');
const users = require('./routes/users');

//init expressJS
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//setting express-messages dan flash message
app.use((req,res,next)=>{
  res.locals.messages = require('express-messages')(req,res);
  next();
});
app.use(flash());

//handle session
app.use(session({
  secret: 'keyboard cat',
  saveUninitialized: true,
  resave: true
}));

//Passport Authenticate
app.use(passport.initialize());
app.use(passport.session());

//setting Express Validator
app.use(expressValidator({
  errorFormater: (param, msg,value)=>{
    var namespace = param.split('.'),
    root = namespace.shift(),
    formParam = root;

    while(namespace.length){
      formParam += '[' + namespace.shift() + ']';
    }

    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

//ketika route ke semua alamat endpoint
//kita membuat variabel user dari user yang sudah login
//jika tidak ada user yang valid / login makan akan bernilai null
app.get('*',(req,res,next)=>{
  res.locals.user = req.user || null;
  next();//untuk melewatkan response
});

//menggunakan routes
app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//listening server
app.listen('8081', ()=>{
  console.log("SERVER IS RUNNING");
});

//export module
module.exports = app;
