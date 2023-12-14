var express = require("express");
var router = express.Router();

require('./outletSchedule');

router.get('/', (req, res, next) => {
    res.send({ success: true, message: "Response from scheduler/index.js" });
})

module.exports = router;