var express = require('express');
var router = express.Router();
var authenticate = require('../middlewares/authenticate');

/* GET home page. */
router.get('/', authenticate, function(req, res, next) {
  res.render('index', { title: 'Ecomm API' });
});

module.exports = router;
