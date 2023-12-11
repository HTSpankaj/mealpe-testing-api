var express = require("express");
var router = express.Router();
var supabaseInstance = require("../../services/supabaseClient").supabase;

router.post("/createOffer", async (req, res) => {

    const { title, code, description, percentage, outletId } = req.body;

    if (title && code && description && percentage && outletId) {
        try {

            const checkCodeResponse = await supabaseInstance.from("offer").select("*").eq("code", code).limit(1).maybeSingle();

            if (checkCodeResponse?.data) {
                let _json = { message: "Code already used for another offer." };
                throw _json;
            } else if (!checkCodeResponse?.data && !checkCodeResponse?.error) {

                const offerResponse = await supabaseInstance.from("offer").insert({ title, code, description, percentage, outletId }).select("*").maybeSingle();

                if (offerResponse?.data) {
                    res.status(200).json({
                        success: true,
                        data: offerResponse?.data,
                    });
                } else {
                    throw offerResponse?.error;
                }
            } else {
                throw checkCodeResponse?.error;
            }
        } catch (error) {
            console.error("error => ", error);
            res.status(500).json({ success: false, error: error });
        }
    } else {
        res.status(500).json({ success: false, error: { message: "Invalid Post Body" } });
    }
});

router.post("/updateOffer", async (req, res) => {

    const { title, code, description, percentage, isActive, isDelete, offerId } = req.body;

    if ((title || code || description || percentage || (isActive === true || isActive === false) || (isDelete === true || isDelete === false)) && offerId) {
        try {
            const checkCodeResponse = await supabaseInstance.from("offer").select("*").eq("code", code).limit(1).maybeSingle();

            if ((!checkCodeResponse?.data && !checkCodeResponse?.error) || checkCodeResponse?.data?.offerId === offerId) {

                let postBody = {};
                if (title) {
                    postBody.title = title;
                }
                if (code) {
                    postBody.code = code;
                }
                if (description) {
                    postBody.description = description;
                }
                if (percentage) {
                    postBody.percentage = percentage;
                }
                if (isActive === true || isActive === false) {
                    postBody.isActive = isActive;
                }
                if (isDelete === true || isDelete === false) {
                    postBody.isDelete = isDelete;
                }

                const offerResponse = await supabaseInstance.from("offer").update(postBody).eq("offerId", offerId).select("*").maybeSingle();

                if (offerResponse?.data) {
                    res.status(200).json({
                        success: true,
                        data: offerResponse?.data,
                    });
                } else {
                    throw offerResponse?.error;
                }
            } else if (checkCodeResponse?.data) {
                let _json = { message: "Code already used for another offer." };
                throw _json;
            } else {
                throw checkCodeResponse?.error;
            }
        } catch (error) {
            console.error("error => ", error);
            res.status(500).json({ success: false, error: error });
        }
    } else {
        res.status(500).json({ success: false, error: { message: "Invalid Post Body" } });
    }
});

router.get("/getOfferByOutletId", async (req, res, next) => {

    const { outletId } = req.query;

    if (outletId) {
        try {
            const offerResponse = await supabaseInstance.from("offer").select("*", { count: "exact" }).eq("outletId", outletId).eq("isDelete", false);
            if (offerResponse?.data) {
                res.status(200).json({
                    success: true,
                    data: offerResponse?.data,
                });
            } else {
                throw offerResponse?.error;
            }
        } catch (error) {
            console.error("error => ", error);
            res.status(500).json({ success: false, error: error });
        }
    } else {
        res.status(500).json({ success: false, error: { message: "Please pass outletId in query." } });
    }

})

module.exports = router;