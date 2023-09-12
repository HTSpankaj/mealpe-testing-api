const moment = require("moment-timezone");
const momentIndianTimeZone = (a,b) => {
    let _moment = moment();
    if(a && b) {
        console.log("====> a , b");
        _moment = moment(a, b);
    } else if(a) {
        console.log("====> a");
        _moment = moment(a);
    }
    return _moment.tz("Asia/Kolkata")
};

exports.momentIndianTimeZone = momentIndianTimeZone;
