var express = require('express');
var router = express.Router();
var conv = require('iconv-lite');

/* GET home page. */
router.get('/', function(req, res, next) {
  var context = {
    title : "Lisense Generator"
  }
  res.render('index', context);
});

module.exports = router;
