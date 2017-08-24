var config = require('./config');
var table = require('../data/table');
var async = require('async');
var MongoClient = require('mongodb').MongoClient;
var db_connect_str = require('../data/config').db_connect_str;
var Promise = require('bluebird');
var get_default = require('../tools/tools').get;
var sqlite3_cipher = require('../third_party/sqlite3-cipher');
var KEY = require('./config').key;
var resolve_path = require('path').resolve;
var fs = require('fs');
var util = require('util');
var child_process = require('child_process');

function getGenes(callback){
    // �������ݿ�,ͬʱ��ȡ�����Ϣ
    var db_inst = null;
    var promise = new Promise(function (resolve, reject){
        MongoClient.connect(db_connect_str,function(err, db){
            if (err)reject(err);
            else {
                db_inst = db;
                resolve(db);
            }
        });
    });

    promise.then(function (db){
        // �Ȳ�ѯgene_param_mappings
        var genes_mapping_collection = db.collection(table.genes_param_mapping_table);
        var gene_param_mappings_promise = new Promise(function (resolve, reject){
            genes_mapping_collection.find().toArray(function (err, results){
                if (err)reject(err);
                else resolve(results);
            });
        });
        gene_param_mappings_promise.then(function (results){
            var links = {};
            var param_ids = [];
            results.forEach(function (result,index){
                var id = results[index].param_id;
                param_ids.push({_id:id});
                links[id] = index;
            })
            var param_collection = db.collection(table.params_table);
            if (!param_ids){
                db.close();
                return;
            }
            console.log('param_ids' + param_ids);

            param_collection.find({$or:param_ids}).toArray(function (err, items){
                db.close();
                if (err)callback(err);
                items.forEach(function (item,index,arr){
                    if (item._id in links){
                        arr[index].gene = results[links[item._id]].gene;
                    }
                });
                callback(null, items);
            });
        });
        return gene_param_mappings_promise;
    }).catch(function (err){
        if (db_inst){
            db_inst.close();
            db_inst = null;
        }
        callback(err);
    });
}
function getUsers(users)
{
    return function (callback)
    {
        // �������ݿ�,ͬʱ��ȡ�����Ϣ
        var db_inst = null;
        var promise = new Promise(function (resolve, reject){
            MongoClient.connect(db_connect_str,function(err, db){
                if (err)reject(err);
                else {
                    db_inst = db;
                    resolve(db);
                }
            });
        });

        promise.then(function (db){
            // �Ȳ�ѯgene_param_mappings
            var usernames = users.map(function (username){return {username:username};});
            if (usernames.length == 0){
                return [];
            }
            var users_collection = db.collection(table.users_table);
            var users_promise = new Promise(function (resolve, reject){
                users_collection.find({$or:usernames}).toArray(function (err,results){
                    if (err)reject(err);
                    else resolve(results);
                });
            });
            return users_promise;
        }).then(function(results){
            if (db_inst){
                db_inst.close();
                db_inst = null;
            }
            callback(null,results);
        }).catch(function (err){
            if (db_inst){
                db_inst.close();
                db_inst = null;
            }
            callback(err);
        });
    }
}

function getEfirms(efirms_sncodes)
{
    return function (callback)
    {
        // �������ݿ�,ͬʱ��ȡ�����Ϣ
        var db_inst = null;
        var promise = new Promise(function (resolve, reject){
            MongoClient.connect(db_connect_str,function(err, db){
                if (err)reject(err);
                else {
                    db_inst = db;
                    resolve(db);
                }
            });
        });

        promise.then(function (db){
            // �Ȳ�ѯgene_param_mappings
            var efirms = efirms_sncodes.map(function (efirm){return {sn_code:efirm};});
            if (efirms.length == 0){
                return [];
            }
            var efirms_collection = db.collection(table.efirms_table);
            var efirms_promise = new Promise(function (resolve, reject){
                efirms_collection.find({$or:efirms}).toArray(function (err,results){
                    if (err)reject(err);
                    else resolve(results);
                });
            });
            return efirms_promise;
        }).then(function(results){
            if (db_inst){
                db_inst.close();
                db_inst = null;
            }
            callback(null,results);
        }).catch(function (err){
            if (db_inst){
                db_inst.close();
                db_inst = null;
            }
            callback(err);
        });
    }
}
function getEplateTypes(eplate_types){
    return function (callback)
    {
        // �������ݿ�,ͬʱ��ȡ�����Ϣ
        var db_inst = null;
        var promise = new Promise(function (resolve, reject){
            MongoClient.connect(db_connect_str,function(err, db){
                if (err)reject(err);
                else {
                    db_inst = db;
                    resolve(db);
                }
            });
        });

        promise.then(function (db){
            // �Ȳ�ѯgene_param_mappings
            var types = eplate_types.map(function(eplate_type){return {type:eplate_type};});
            if (types.length == 0)return [];

            var eplate_types_collection = db.collection(table.eplate_types_table);
            var eplate_types_promise = new Promise(function (resolve, reject){
                eplate_types_collection.find({$or:types}).toArray(function (err,results){
                    if (err)reject(err);
                    else resolve(results);
                });
            });
            return eplate_types_promise;
        }).then(function(results){
            if (db_inst){
                db_inst.close();
                db_inst = null;
            }
            callback(null,results);
        }).catch(function (err){
            if (db_inst){
                db_inst.close();
                db_inst = null;
            }
            callback(err);
        });
    }
}
function genLisense(lisenses, callback)
{
    // ����lisenses�����ݣ��ж���Ҫ��ȥ���û������豸��eplate_types.
    var usernames = [];
    var efirms = [];
    var eplate_types = [];

    var user_to_efirms_lisense = {}; // { 'wushengyong' : []}
    var efirms_to_user = {} ; // { 'yihuobio_efirm_v1' : []}
    var eplates_to_user = {}; // {'' : {'users' : []} , �ڵ�Ϊeplate.eplate_type + ":" + eplate.barcode_min + "-" + eplate.barcode_max;

    lisenses.forEach(function (lisense){
        if (lisense.isDevice){
            var _users = lisense.users;
            var _efirms = lisense.info;
            _users.forEach(function (current_user){
                if (!(current_user in usernames)){
                    usernames.push(current_user);
                }
                user_to_efirms_lisense[current_user] = get_default(user_to_efirms_lisense,current_user,[]).concat(_efirms);
            });
            _efirms.forEach(function (current_efirm){
                if (!(current_efirm in efirms)){
                    efirms.push(current_efirm);
                }
                efirms_to_user[current_efirm] = get_default(efirms_to_user, current_efirm, []).concat(_users);
            });
        } else {
            var _users = lisense.users;
            var _eplates = lisense.info;
            _users.forEach(function (current_user){
                if (!(current_user in usernames)) {
                    usernames.push(current_user);
                }
            });
            _eplates.forEach(function (eplate){
                if (!(eplate in eplates_to_user)){
                    var _split0 = eplate.split(':');
                    var _split1 = _split0[1].split('-');
                    var _eplate_type = _split0[0];
                    var _eplate_sncode_min = _split1[0];
                    var _eplate_sncode_max = _split1[1];
                    eplates_to_user[eplate] = {
                        eplate_sncode_min: _eplate_sncode_min,
                        eplate_sncode_max: _eplate_sncode_max,
                        eplate_type: _eplate_type,
                        users: []
                    };
                    if (!(_eplate_type in eplate_types)) {
                        eplate_types.push(_eplate_type);
                    }
                }
                eplates_to_user[eplate].users = eplates_to_user[eplate].users.concat(_users);
            });
        }
    });

    async.auto({
        genes : getGenes,
        users : getUsers(usernames),
        efirms : getEfirms(efirms),
        eplate_type : getEplateTypes(eplate_types)
    },function (err, results){
        if (err){
            callback(err);
            return;
        }
        var users_id_mapping = {};
        var users = results.users.map(function (user){
            var current_user = {
                username : user.username,
                passwd : user.password,
                uid : user._id,
                organization : user.organization,
                is_admin : user.is_admin,
                roles : user.roles,
                efirms : user_to_efirms_lisense[user.username],
                privileges : []
            };
            users_id_mapping[current_user.username] = user._id;
            for (var privilege in user.privileges){
                current_user.privileges.push(privilege);
            }
            return current_user;
        });
        var efirms = results.efirms.map(function (efirm){
            var current_efirm = {
                name : efirm.sn_code,
                organization : efirm.organization,
                users : efirms_to_user[efirm.sn_code].map(function (username){
                    if (username in users_id_mapping){
                        return users_id_mapping[username];
                    }
                    return username;
                })
            };
            return current_efirm;
        });

        var eplate_type = results.eplate_type.map(function (type){
            var current_type = {
                eplate_type_name : type.type,
                layout : type.layout
            };
            return current_type;
        });
        var eplates = [];
        for (var eplate in eplates_to_user){
            eplates_to_user[eplate].users = eplates_to_user[eplate].users.map(function (username){
                if (username in users_id_mapping){
                    return users_id_mapping[username];
                }
                return username;
            });
            eplates.push(eplates_to_user[eplate]);
        }

        var lisense = {
            version : '1.0',
            genes : results.genes,
            users : users,
            efirms : efirms,
            eplate_type : eplate_type,
            eplates : eplates
        }
        callback(null,lisense);
    });
}

function savelisense(lisenses_content, lisense_name, lisenses_date,callback, info)
{
    var lisenses_content_str = JSON.stringify(lisenses_content);
    var promise = new Promise(function (resolve, reject){
        var lisense_path  = resolve_path('third_party','lisense','Lisense',"Lisense");
        if (fs.existsSync(lisense_path)){
            fs.unlinkSync(lisense_path); // ɾ�����ļ�
        }
        sqlite3_cipher.connect(lisense_path, KEY, function (err, db){
            if (err)reject(err);
            else resolve(db);
        });
    });
    promise.then(function (db){
        var db_promise = new Promise(function (resolve, reject){
            var sql = util.format("CREATE TABLE [Lisense] (JsonStr TEXT);INSERT INTO [Lisense] (JsonStr) VALUES ('%s');", lisenses_content_str);
            db.exec(sql, function (err){
                if (err)reject(err);
                else resolve(db);
            });
        });
        return db_promise;
    }).then(function (db){
        var db_close = new Promise(function (resolve, reject){
            db.close(function (err){
                if(err)reject(err);
                else resolve();
            })
        });
        return db_close;
    }).then(function (){
            var cmd_str = util.format('"%s" "%s" /DBASEDIR=".\\Lisense\\" /DOutExeName="%s"',resolve_path('third_party\\Inno Setup 5\\ISCC.exe'), resolve_path('third_party\\lisense\\lisense.iss'),lisense_name);
            var output = child_process.execSync(cmd_str);
    }).then(function (){
        var lisense_info_path = resolve_path('public','lisense',lisense_name + '.json');
        var fs_promise = new Promise(function (resolve, reject){
            fs.writeFile(lisense_info_path,lisenses_content_str,'utf-8',function(err){
                if (err)reject(err);
                else resolve();
            });
        });
        return fs_promise;
    }).then(function (){
        return savelisense_history(lisense_name, lisenses_date, info);
    }).then(function (){
        callback(null);
    }).catch(function(err){
        callback(err);
    });
}
function savelisense_history(lisense_name, lisenses_date, info)
{
    var promise = new Promise(function (resolve, reject){
        sqlite3_cipher.connect(resolve_path("lisense","info.dat"),"",function (err, db){
            if (err){
                reject(err);
            } else {
                db.exec("CREATE TABLE lisenses_info (_id INTEGER PRIMARY KEY  AUTOINCREMENT,name TEXT, info TEXT, date DATETIME)",function (err){
                    db.table("lisenses_info").insert({name:lisense_name,date: lisenses_date, info : info},function (err){
                        db.close(function (){
                            if (err){
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    });
                });
            }
        })
    });
    return promise;
}



module.exports.genLisense = genLisense;
module.exports.saveLisense = savelisense;