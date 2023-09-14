var express = require("express");
var router = express.Router();

var customerPaymentRouter = require("./customerPayment");

router.use('/customer', customerPaymentRouter);


router.get('/', (req, res, next) => {
    res.send({success: true, message: "Response from payment/index.js"});
})


module.exports = router;