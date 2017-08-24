var express = require('express');
var router = express.Router();
var genLisense = require('../lisense/lisense').genLisense;
var saveLisense = require('../lisense/lisense').saveLisense;
var Promise = require('bluebird');

var is_generating = false;
router.post('/lisense', function(req, res, next) {
    if (is_generating){
        res.status(200).json({msg : "BUSY"});
        return;
    }
    is_generating = true;
    var promise = new Promise(function (resolve, reject){
        genLisense(req.body.lisenses,function(err,lisense){
            if (err)reject(err);
            else resolve(lisense);
        });
    });
    promise.then(function (lisense){
        var save_promise = new Promise(function (resolve, reject){
            saveLisense(lisense,req.body.name, req.body.date,function (err){
                if (err)reject(err);
                else resolve();
            }, JSON.stringify(req.body.lisenses.map(function (lisense) { console.log(lisense);return {users:lisense.users, auth_to : lisense.info}})));
        });
        return save_promise;
    }).then(function (){
        res.status(200).json({msg : "SUCCESS"});
        is_generating = false;
    }).catch(function (err){
        res.status(200).json({msg : err});
        console.log(err);
        is_generating = false;
    });
});

module.exports = router;
