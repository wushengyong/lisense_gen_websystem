/**
 * Created by Administrator on 2017/8/23.
 */
function get(obj, property, defaultval){
    if (property in obj)return obj[property];
    if (defaultval != null){
        obj[property] = defaultval;
        return obj[property];
    }
    return null;
}

module.exports.get = get;
