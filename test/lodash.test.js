/**
 * Created by Administrator on 2017/7/20 0020.
 */
var _ = require('lodash');

var array = require('lodash/array');

console.log(_.chunk([10,20,3,3,4,4,45,546,66],2));
console.log(_.compact([0, 1, false, 2, '', 3]));
console.log(_.difference([1,2,3],[3,'2']));
var aTest = [1,2,3,4,5,6];
console.log(_.drop(aTest,2));
console.log(aTest);
_.intersection()