var express = require("express");
var router = express.Router();
var easebuzzConfig = require("../../configs/easebuzzConfig").config;

const axios = require('axios').default;
const { URLSearchParams } = require('url');
const SHA512 = require("crypto-js").SHA512;

router.get('/', (req, res, next) => {
    res.send({ success: true, message: "Response from payment/customerPayment.js" });
})

// console.log(new RegExp(/^[a-zA-Z0-9_\|\-\/]{1,40}$/).test(''))

router.post('/initiate-payment', async (req, res, next) => {

    const txnid = 'EBZTestTxn0005';
    const amount = '2.1';
    const productinfo = 'sample productinfo';
    const firstname = 'Pankaj';
    const phone = '9966338855';
    const email = 'pankaj@gmail.com';
    const surl = 'http://localhost:8000/payment/customer/success-payment';
    const furl = 'http://localhost:8000/payment/customer/failure-payment';

    const _generateHash = generateHash(txnid, amount, productinfo, firstname, email, "", "", "", "", "", "", "", "", "", "");
    console.log("_generateHash => ", _generateHash);

    const encodedParams = new URLSearchParams();
    encodedParams.set('key', easebuzzConfig.key);
    encodedParams.set('txnid', txnid);
    encodedParams.set('amount', amount);
    encodedParams.set('productinfo', productinfo);
    encodedParams.set('firstname', firstname);
    encodedParams.set('phone', phone);
    encodedParams.set('email', email);
    encodedParams.set('surl', surl);
    encodedParams.set('furl', furl);
    encodedParams.set('hash', _generateHash);
    encodedParams.set('udf1', '');
    encodedParams.set('udf2', '');
    encodedParams.set('udf3', '');
    encodedParams.set('udf4', '');
    encodedParams.set('udf5', '');
    encodedParams.set('udf6', '');
    encodedParams.set('udf7', '');
    encodedParams.set('address1', '');
    encodedParams.set('address2', '');
    encodedParams.set('city', '');
    encodedParams.set('state', '');
    encodedParams.set('country', '');
    encodedParams.set('zipcode', '');
    // encodedParams.set('show_payment_mode', '');
    // encodedParams.set('split_payments', '');
    // encodedParams.set('request_flow', '');
    // encodedParams.set('sub_merchant_id', '');
    // encodedParams.set('payment category', '');
    // encodedParams.set('account_no', '');

    // console.log(encodedParams);

    const options = {
        method: 'POST',
        url: `${easebuzzConfig.easebuzzBaseUrl}/payment/initiateLink`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json'
        },
        data: encodedParams,
    };

    
    console.log("initiateLink URL => ", `${easebuzzConfig.easebuzzBaseUrl}/payment/initiateLink`);
    try {
        const { data } = await axios.request(options);
        if (data.status) {
            console.log("data => ", data);
            res.send({ success: true, data })
        } else {
            throw data;
        }
    } catch (error) {
        console.error("error => ", error);
        res.send({ success: false, error })
    }
})

router.post('/success-payment', (req, res, next) => {
    const postBody = req.body;
    const query = req.query;
    const params = req.params;

    console.log("s-postBody => ", postBody);
    console.log("s-query =>    ", query);
    console.log("s-params =>   ", params);

    res.send({ success: true, message: "Response from payment/customerPayment.js" });
})

router.post('/failure-payment', (req, res, next) => {
    const postBody = req.body;
    const query = req.query;
    const params = req.params;

    console.log("f-postBody => ", postBody);
    console.log("f-query =>    ", query);
    console.log("f-params =>   ", params);

    res.send({ success: true, message: "Response from payment/customerPayment.js" });
})

module.exports = router;

const generateHash = (txnid, amount, productinfo, name, email, udf1, udf2, udf3, udf4, udf5, udf6, udf7, udf8, udf9, udf10)  => {
    // key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt

    var hashstring = easebuzzConfig.key + "|" + txnid + "|" + amount + "|" + productinfo + "|" + name + "|" + email +
    "|" + udf1 + "|" + udf2 + "|" + udf3 + "|" + udf4 + "|" + udf5 + "|" + udf6 + "|" + udf7 + "|" + udf8 + "|" + udf9 + "|" + udf10 + "|" + easebuzzConfig.salt
    
    // (amount*100).toFixed(2)

    console.log("hashstring => ", hashstring);

    return SHA512(hashstring).toString();
}
