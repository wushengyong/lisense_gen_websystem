var config = {
    server : "",
    port : 27017,
    db : "",
    username : "",
    passwd : ""
};

module.exports = config;
module.exports.db_connect_str =  "mongodb://" + config.username + ":" + config.passwd + "@" +
    config.server + ":" + config.port + "/" + config.db;