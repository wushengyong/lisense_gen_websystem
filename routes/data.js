var express = require('express');
var router = express.Router();
var Promise = require('bluebird');
var MongoClient = require('mongodb').MongoClient;
var db_connect_str = require('../data/config').db_connect_str;
var tables = require('../data/table');
var sqlite3_cipher = require('../third_party/sqlite3-cipher')
var resolve_path = require('path').resolve;
var util = require('util');

function getTableInfo(tablename, colname, res)
{
    var db_inst = null;
    var promise = new Promise(function (resolve, reject){
        MongoClient.connect(db_connect_str, function (err, db){
            if (err)reject(err);
            else {
                db_inst = db;
                resolve(db);
            }
        })
    });
    promise.then(function(db){
        var table_promise = new Promise(function (resolve, reject){
            var collection = db.collection(tablename);
            collection.find().toArray(function (err, results){
                if (err)reject(err);
                else resolve(results);
            })
        });
        return table_promise;
    }).then(function (results){
        var infos = [];
        for (var index in results){
            infos.push(results[index][colname]);
        }
        res.status(200).json(infos);
    }).then(function (){
        if (db_inst){
            db_inst.close();
            db_inst = null;
        }
    }).catch(function(err){
        console.log(err);
        res.end();
        if (db_inst){
            db_inst.close();
            db_inst = null;
        }
    });
}
router.get('/users_list',function (req, res, next){
    getTableInfo(tables.users_table,'username',res);
});
router.get('/efirms_list',function (req, res, next){
    getTableInfo(tables.efirms_table,'sn_code',res);
});
router.get('/eplate_types',function (req, res, next){
    getTableInfo(tables.eplate_types_table,'type',res);
});
router.get('/download/lisense',function (req, res, next){
    var promise = new Promise(function (resolve, reject){
        sqlite3_cipher.connect(resolve_path('lisense','info.dat'),'',function (err,db){
            if (err)reject(err);
            else resolve(db);
        });
    });
    promise.then(function (db){
        var close_promise = new Promise(function (resolve, reject){
            db.table('lisenses_info').find({},function (err, items){
                db.close(function (){
                    if (err)reject(err);
                    else resolve(items);
                });
            });
        });
        return close_promise;
    }).then(function (items){
        var lisenses = items.map(function (item){
            console.log(item.name);
            console.log(item.date);
            console.log(item.info);
            return {
                exe_href: util.format('/download/file/lisense/%s.exe',item.name),
                json_href: util.format('/download/file/lisense/%s.json',item.name),
                info: item.info,
                date: new Date(item.date).toLocaleString(),
                name : item.name
            }});
        res.status(200).json(lisenses);
    }).catch (function (err){
        console.log(err);
        res.status(500).json(err);
    });
});
module.exports = router;