var express = require('express');
var router = express.Router();
var _ = require('lodash');

router.post('/lisense', function(req, res, next) {
    var lisenseInfo = JSON.parse(req.body.lisensesinfo);
    _.forEach(lisenseInfo,function (lisense){
        console.log(lisense);
    })
    res.end("OK");
});

module.exports = router;
