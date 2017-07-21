var express = require('express');
var router = express.Router();
var conv = require('iconv-lite');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express'});
});

module.exports = router;
