var express = require('express');
var router = express.Router();
var resolve_path = require('path').resolve;

router.get('/',function (req, res, next){
    res.render('download',{ title : 'Download', download : true});
});
router.get('/file/lisense/:filename',function (req, res, next){
    res.download(resolve_path('public/lisense',req.params.filename), req.params.filename);
})

module.exports = router;