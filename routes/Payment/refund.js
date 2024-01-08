var express = require("express");
var router = express.Router();
var supabaseInstance = require("../../services/supabaseClient").supabase;

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
            supabaseInstance.from("RefundWebhook").insert(postObjectForRefundWebhook).select("refundWebhookId").maybeSingle();
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

module.exports = router;
