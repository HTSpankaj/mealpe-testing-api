var express = require("express");
var router = express.Router();
var supabaseInstance = require("../../services/supabaseClient").supabase;
var easebuzzConfig = require("../../configs/easebuzzConfig").config;
const axios = require('axios').default;
const SHA512 = require("crypto-js").SHA512;

router.post('/refundWebhook', async (req, res, next) => {
    const postBody = req.body;
    console.log("RefundWebhook PostBody => ", postBody);

    if (postBody?.status === "1" && postBody?.data?.refund_status && postBody?.data?.txnid) {
        // const refundResponse = await supabaseInstance.from("Refund").select("refundId, txnid").eq("txnid", postBody?.data?.txnid).maybeSingle();
        const refundResponse = await supabaseInstance.from("Refund").update({refund_status: postBody?.data?.refund_status}).select("refundId, txnid").eq("txnid", postBody?.data?.txnid).maybeSingle();
        if (refundResponse.data) {
            let postObjectForRefundWebhook = {
                responseBody: postBody,
                refund_status: postBody?.data?.refund_status,
                refundId: refundResponse.data?.refundId
            }
            await supabaseInstance.from("RefundWebhook").insert(postObjectForRefundWebhook).select("refundWebhookId").maybeSingle();
            res.status(200).json({success: true});
        } else {
            console.error("Error while update Refund[refund_status].");
            res.status(500).json({success: false});
        }
    } else {
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

            const orderResponse = await supabaseInstance.from("Order").select("*,customerAuthUID(*),outletId(*)").eq("orderId", orderId).maybeSingle();

            if (orderResponse?.data) {

                var hashstring_transactionAPI = easebuzzConfig.key + "|" + orderResponse?.data?.txnid + "|" + orderResponse?.data?.totalPrice + "|"  + orderResponse?.data?.customerAuthUID?.email + "|" + orderResponse?.data?.customerAuthUID?.mobile + "|" + easebuzzConfig.salt;
                const _generatetransactionAPIHash = generateHash(hashstring_transactionAPI);

                console.log("hashstring_transactionAPI==>",hashstring_transactionAPI);
                const encodedParams = {
                    'txnid': orderResponse.data.txnid,
                    'key': easebuzzConfig.key,
                    'amount': orderResponse.data.totalPrice,
                    'email': orderResponse.data.customerAuthUID.email,
                    'phone': orderResponse.data.customerAuthUID.mobile + "",
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
                axios.request(transactionAPI).then(async transactionAPIResponse =>{
                    console.log("transactionAPIResponse===>",transactionAPIResponse?.data);
                    const easepayid = transactionAPIResponse?.data?.msg?.easepayid;

                    if (transactionAPIResponse?.data?.status === true && easepayid) {
                        const refundResponse = await supabaseInstance.from('Refund').insert({ txnid: orderResponse.data.txnid, customerAuthUID: orderResponse.data.customerAuthUID.customerAuthUID, orderId }).select("*").maybeSingle();
                        var hashstring = easebuzzConfig.key + "|" + easepayid + "|" + orderResponse?.data?.totalPrice + "|" + Number(orderResponse.data.totalPrice) + "|" + orderResponse?.data?.customerAuthUID?.email + "|" + orderResponse?.data?.customerAuthUID?.mobile + "|" + easebuzzConfig.salt;
        
                        const _generateHash = generateHash(hashstring);
                        console.log("_generateHash => ", _generateHash);
                        const options = {
                            method: 'POST',
                            url: `${easebuzzConfig.refund_easebuzzBaseUrl}/transaction/v1/refund`,
                            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                            data: {
                                key: easebuzzConfig.key,
                                txnid: easepayid,
                                refund_amount: Number(orderResponse.data.totalPrice),
                                phone: orderResponse.data.customerAuthUID.mobile + "",
                                email: orderResponse.data.customerAuthUID.email,
                                amount: orderResponse.data.totalPrice,
                                hash: _generateHash
                            }
                        };

                        axios.post(options.url, options.data, { headers: options.headers }).then(async (response) => {
                            const refundUpdateResponse = await supabaseInstance.from('Refund').update({ refund_post_body: options?.data, refund_response: response?.data,refund_amount: response?.data?.refund_amount}).eq("refundId", refundResponse?.data?.refundId).select("*").maybeSingle();
                            console.log("refund Response in then =>", response.data);
                            resolve({ success: true, response: response?.data })
                        }).catch(async (error) => {
                            const refundUpdateResponse = await supabaseInstance.from('Refund').update({ refund_post_body: options?.data, refund_error: error }).eq("refundId", refundResponse?.data?.refundId).select("*").maybeSingle();
                            console.error("Error => ", error?.response?.data?.additional?.validation || error?.response || error);
                            resolve({ success: false, response: error?.response?.data || error?.response || error })
                        })
                    }
                }).catch(err => {
                    throw err?.request?.data;
                })
            } else {
                throw orderResponse.error
            }
            
        } catch (error) {
            console.error("error => ", error);
            resolve({
                success: false,
                error: error?.message || error
            })
        }
    })
};

module.exports = {router, requestRefund};

const generateHash = (hashstring) => {
    return SHA512(hashstring).toString();
}
