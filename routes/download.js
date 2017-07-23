var express = require('express');
var router = express.Router();
var _ = require('lodash');

router.get('/',function (req, res, next){
    var context = {
        title : 'download'
    }
    res.render('download', context);
});

module.exports = router;