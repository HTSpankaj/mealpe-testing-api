var express = require("express");
var router = express.Router();

var pushMenuRouter = require("./pushMenu").router;
var webhookRouter = require("./webhook");

router.use('/pushMenu', pushMenuRouter);
router.use('/webhook', webhookRouter);


router.get('/', (req, res, next) => {
    res.send({ success: true, message: "Response from petpooja/index.js" });
})

module.exports = router;