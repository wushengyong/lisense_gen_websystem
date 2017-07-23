var express = require('express');
var router = express.Router();
var _ = require('lodash');

router.get('/users_list',function (req, res, next){
    var users_list = ['wushengyong','macro','zhangzhao','yuanfen'];
    res.end(JSON.stringify(users_list));
});
router.get('/efirms_list',function (req, res, next){
    var efirms_list = ['efirm_v1','efirm_v2','efirm_v3'];
    res.end(JSON.stringify(efirms_list));
});
router.get('/eplate_types',function (req, res, next){
    var eplate_types = ["eplate_96wells","eplate_16wells"];
    res.end(JSON.stringify(eplate_types));
});

module.exports = router;