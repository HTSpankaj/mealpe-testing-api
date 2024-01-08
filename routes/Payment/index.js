var express = require("express");
var router = express.Router();
const SHA512 = require("crypto-js").SHA512;

var customerPaymentRouter = require("./customerPayment").router;
var refundRouter = require("./refund");

router.use('/customer', customerPaymentRouter);
router.use('/refund', refundRouter);


router.get('/', (req, res, next) => {
    res.send({ success: true, message: "Response from payment/index.js" });
})

module.exports = router;