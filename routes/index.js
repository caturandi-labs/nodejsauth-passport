var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/',(req,res,next) => {
	if(req.isAuthenticated()){
		res.render('index', {title: 'Members'});
		return next;
	}else{
		res.redirect('/users/login');
	}
});

module.exports = router;
