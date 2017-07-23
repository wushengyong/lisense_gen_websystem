var express = require('express');
var router = express.Router();
var _ = require('lodash');

router.post('/lisense', function(req, res, next) {
    console.log(req.body);
    res.end("OK");
});

module.exports = router;
