var express = require("express");
var router = express.Router();
var supabaseInstance = require("../../services/supabaseClient").supabase;
var easebuzzConfig = require("../../configs/easebuzzConfig").config;
const axios = require('axios').default;
const SHA512 = require("crypto-js").SHA512;

router.post('/refundWebhook', async (req, res, next) => {

    console.log("req?.body?.status => ", req?.body?.status);
    console.log("typeof req?.body?.data => ",typeof req?.body?.data);
    
    let postBody = req.body;
    const postBodyData = JSON.parse(req?.body?.data);
    
    // console.log("RefundWebhook PostBody => ", postBody);
    // console.log("RefundWebhook postBodyData => ", postBodyData);
    // console.log("typeof postBodyData => ",typeof postBodyData);

    if (postBody?.status === "1" && postBodyData?.refund_status && postBodyData?.txnid) {
        // const refundResponse = await supabaseInstance.from("Refund").select("refundId, txnid").eq("txnid", postBodyData?.txnid).maybeSingle();
        const refundResponse = await supabaseInstance.from("Refund").update({refund_status: postBodyData?.refund_status}).select("refundId, txnid").eq("txnid", postBodyData?.txnid).maybeSingle();
        if (refundResponse.data) {
            let postObjectForRefundWebhook = {
                responseBody: postBody,
                refund_status: postBodyData?.refund_status,
                refundId: refundResponse.data?.refundId
            }
            await supabaseInstance.from("RefundWebhook").insert(postObjectForRefundWebhook).select("refundWebhookId").maybeSingle();
            res.status(200).json({success: true});
        } else {
            console.error("Error while update Refund[refund_status].");
            res.status(500).json({success: false});
        }
    } else {
        console.error("If condition fail");

        console.log("postBody?.status => ", postBody?.status);
        console.log("postBodyData?.refund_status => ", postBodyData?.refund_status);
        console.log("postBodyData?.txnid => ", postBodyData?.txnid);

        console.log(postBody?.status === "1" && postBodyData?.refund_status && postBodyData?.txnid);
        res.status(500).json({success: false});
    }
})

router.post('/request-refund-Webhook', async (req, res, next) => {
    const postBody = req.body;
    try {
        const {orderResponse, error } = await supabaseInstance.from("Order").select("*").eq("txnid",postBody.data.txnid).maybeSingle();
        if (orderResponse.data) {
            const updateRefund = await supabaseInstance.from("Refund").update({refund_status:postBody.data.refund_status}).select("*")
            
        } else {
            throw error
        }

    } catch (error) {
        res.status(500).json({ success: false, error: error });
    }
})

router.post('/request-refund', async (req, res, next) => {
    const { orderId } = req.body;
    try {
        const requestRefundResponse = await requestRefund(orderId);
        console.log("requestRefundResponse => ", requestRefundResponse);
        res.status(200).json({ success: true, ...requestRefundResponse });
    } catch (error) {
        res.status(500).json({ success: false, error: error });
    }
})

function requestRefund(orderId) {
    return new Promise(async (resolve, reject) => {
        try {

            const orderResponse = await supabaseInstance.from("Order").select("*,customerAuthUID(*),outletId(*),txnid(txnid,email,phone)").eq("orderId", orderId).maybeSingle();

            if (orderResponse?.data) {

                console.log("Number(orderResponse?.data?.totalPrice).toFixed(2) => ", Number(orderResponse?.data?.totalPrice).toFixed(2));

                var hashstring_transactionAPI = easebuzzConfig.key + "|" + orderResponse?.data?.txnid?.txnid + "|" + Number(orderResponse?.data?.totalPrice).toFixed(2) + "|"  + orderResponse?.data?.txnid?.email + "|" + orderResponse?.data?.txnid?.phone + "|" + easebuzzConfig.salt;
                const _generatetransactionAPIHash = generateHash(hashstring_transactionAPI);

                // console.log("hashstring_transactionAPI==>",hashstring_transactionAPI);
                const encodedParams = {
                    'txnid': orderResponse?.data?.txnid?.txnid,
                    'key': easebuzzConfig.key,
                    'amount': Number(orderResponse?.data?.totalPrice).toFixed(2),
                    'email': orderResponse.data.txnid.email,
                    'phone': orderResponse?.data?.txnid?.phone + "",
                    'hash': _generatetransactionAPIHash,
                }

                const transactionAPI = {
                    method: 'POST',
                    url: `${easebuzzConfig.transaction_API}/transaction/v1/retrieve`,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Accept: 'application/json'
                      },
                      data: encodedParams,
                };
                const transactionAPIResponse = await axios.request(transactionAPI)
                // console.log("transactionAPIResponse===>",transactionAPIResponse?.data);
                const easepayid = transactionAPIResponse?.data?.msg?.easepayid;

                if (transactionAPIResponse?.data?.status === true && easepayid) {
                    var hashstring = easebuzzConfig.key + "|" + easepayid + "|" + Number(orderResponse?.data?.totalPrice).toFixed(2) + "|" + Number(orderResponse.data.totalPrice).toFixed(2) + "|" + orderResponse?.data?.txnid?.email + "|" + orderResponse?.data?.txnid?.phone + "|" + easebuzzConfig.salt;
    
                    const _generateHash = generateHash(hashstring);
                    console.log("_generateHash => ", _generateHash);
                    const options = {
                        method: 'POST',
                        url: `${easebuzzConfig.refund_easebuzzBaseUrl}/transaction/v1/refund`,
                        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                        data: {
                            key: easebuzzConfig.key,
                            txnid: easepayid,
                            refund_amount: Number(orderResponse.data.totalPrice).toFixed(2),
                            phone: orderResponse?.data?.txnid?.phone + "",
                            email: orderResponse.data.txnid.email,
                            amount: Number(orderResponse.data.totalPrice).toFixed(2),
                            hash: _generateHash
                        }
                    };

                    const refundInitiateResponse = await axios.post(options.url, options.data, { headers: options.headers });
                    if (refundInitiateResponse?.data?.status === true && refundInitiateResponse?.data?.refund_id) {
                        // const refundUpdateResponse = await supabaseInstance.from('Refund').update({ refund_post_body: options?.data, refund_response: refundInitiateResponse?.data,refund_amount: refundInitiateResponse?.data?.refund_amount}).eq("refundId", refundResponse?.data?.refundId).select("*").maybeSingle();
                        const insert_refund_post_body = { 
                            txnid: orderResponse?.data?.txnid?.txnid,
                            customerAuthUID: orderResponse.data.customerAuthUID.customerAuthUID,
                            orderId,
                            refund_post_body: options?.data,
                            refund_response: refundInitiateResponse?.data,
                            refund_amount: refundInitiateResponse?.data?.refund_amount
                        }
                        const insert_refund_post_body_response = await supabaseInstance.from('Refund').insert(insert_refund_post_body).select("*").maybeSingle();
                        // console.log("refund Response in then =>", refundInitiateResponse.data);
                        resolve({ success: true, refundInitiateResponse: refundInitiateResponse?.data })
                    } else {
                        resolve({ success: false, refundInitiateResponse: refundInitiateResponse?.data, url: "transaction/v1/refund" })
                    }

                    // const refundUpdateResponse = await supabaseInstance.from('Refund').update({ refund_post_body: options?.data, refund_error: error }).eq("refundId", refundResponse?.data?.refundId).select("*").maybeSingle();
                    // console.error("Error => ", error?.response?.data?.additional?.validation || error?.response || error);
                    // resolve({ success: false, response: error?.response?.data || error?.response || error })
                        
                } else {
                    const _err = transactionAPIResponse?.data;
                    throw _err;
                }
            } else {
                throw orderResponse.error
            }
            
        } catch (error) {
            const _err = error?.response?.data || error?.message || error;
            console.error("error => ", _err);
            resolve({
                success: false,
                error: _err
            })
        }
    })
};

module.exports = {router, requestRefund};

const generateHash = (hashstring) => {
    return SHA512(hashstring).toString();
}
