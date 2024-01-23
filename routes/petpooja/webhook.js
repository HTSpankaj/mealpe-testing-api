var express = require("express");
const moment = require("moment-timezone");
var router = express.Router();
var supabaseInstance = require("../../services/supabaseClient").supabase;

router.post("/get-store-status-webhook", async (req, res) => {
    const { restID } = req.body;
    // { restID: 'IDIDIDIDID' }
    // {"http_code":200,"status":"success","store_status":"1","message":"Store Delivery Status fetched successfully"}
    console.log("req.body => ", req.body);

    if (restID) {

        try {
            const outletQuery = await supabaseInstance.from("Outlet").select("outletId,outletName,petPoojaRestId").eq("petPoojaRestId", restID);

            if (outletQuery?.data?.length > 0) {
                const outletQueryData = outletQuery.data[0];
                const store_status = outletQueryData.isOutletOpen ? 1 : 0;

                console.log("Store Delivery Status send successfully from mealpe to petpooja.");
                console.log("outlet name  => ", outletQueryData?.outletName);
                console.log("outlet ID    => ", outletQueryData?.outletId);
                console.log("Store Statos => ", store_status);

                res.status(200).json({
                    http_code: 200,
                    status: "success",
                    store_status: String(store_status),
                    message: "Store Delivery Status fetched successfully."
                });
            } else {
                if (outletQuery?.data?.length === 0) {
                    res.status(500).json({ success: false, error: "Outlet not found in mealpe system." });
                } else {
                    throw outletQuery?.error;
                }
            }
        } catch (error) {
            console.err("get-store-status-webhook => ", error);
            res.status(500).json({ success: false, error: error?.message || error || JSON.stringify(error) });
        }
    } else {
        res.status(500).json({ success: false, error: "Please pass restID." });
    }
})

router.post("/update-store-status-webhook", async (req, res) => {
    const { restID, store_status, reason, turn_on_time } = req.body;
    // {
    //   restID: 'bq69dxai',
    //   store_status: 0,
    //   reason: 'try',
    //   turn_on_time: '2024-01-12 13:00:00'
    // }

    // {"success":true,"http_code":200,"error":""}

    console.log("req.body => ", req.body);

    if (restID) {

        try {
            const outletQuery = await supabaseInstance.from("Outlet").select("outletId,outletName,petPoojaRestId").eq("petPoojaRestId", restID);

            if (outletQuery?.data?.length > 0) {
                const outletQueryData = outletQuery.data[0];
                const isOutletOpenTimestamp = moment().tz("Asia/Kolkata");
                const isOutletOpen = Boolean(store_status === "1" || store_status === 1) ? true : false;

                const outletUpdateQuery = await supabaseInstance.from("Outlet").update({ isOutletOpen, isOutletOpenTimestamp }).eq("outletId", outletQueryData?.outletId).select("outletId").maybeSingle();

                if (outletUpdateQuery?.data) {
                    console.log("Store Delivery Status update successfully from petpooja to mealpe.");
                    console.log("outlet name  => ", outletQueryData?.outletName);
                    console.log("outlet ID    => ", outletQueryData?.outletId);
                    console.log("update body => ", { isOutletOpen, isOutletOpenTimestamp });

                    res.status(200).json({
                        http_code: 200,
                        success: true,
                        error: ""
                    });
                } else {
                    throw outletUpdateQuery?.error;
                }
            } else {
                if (outletQuery?.data?.length === 0) {
                    res.status(500).json({ success: false, error: "Outlet not found in mealpe system." });
                } else {
                    throw outletQuery?.error;
                }
            }
        } catch (error) {
            console.err("update-store-status-webhook => ", error);
            res.status(500).json({ success: false, error: error?.message || error || JSON.stringify(error) });
        }
    } else {
        res.status(500).json({ success: false, error: "Please pass restID." });
    }
})

router.post("/item-off-webhook", async (req, res) => {
    const { restID, inStock, itemID, type, autoTurnOnTime, customTurnOnTime } = req.body;
    // {
    //   restID: 'bq69dxai',
    //   inStock: false,
    //   itemID: [ '10505299', '10505300' ],
    //   type: 'item',
    //   autoTurnOnTime: 'custom',
    //   customTurnOnTime: '2024-01-12 15:06:00'
    // }
    // {"success":true,"http_code":200,"error":""}

    console.log("req.body => ", req.body);

    if (restID) {

        try {
            const outletQuery = await supabaseInstance.from("Outlet").select("outletId,outletName,petPoojaRestId").eq("petPoojaRestId", restID);

            if (outletQuery?.data?.length > 0) {
                const outletQueryData = outletQuery.data[0];
                let resultArr = [];

                for (const itemIdElement of itemID) {
                    let resultObj = {
                        petpoojaItemId: itemIdElement,
                        success: true
                    }
                    const menuItemUpdateResponse = await supabaseInstance.from("Menu_Item").update({ status: false }).eq("outletId", outletQueryData?.outletId).eq("petpoojaItemId", itemIdElement).select("itemid");
                    if (menuItemUpdateResponse?.data?.length > 0) {
                        resultObj.updateLength = menuItemUpdateResponse?.data?.length;
                        resultObj.success = true;
                    } else {
                        resultObj.success = false;
                        if (menuItemUpdateResponse?.data?.length === 0) {
                            resultObj.reson = "Not update any Item (menuItemUpdateResponse?.data?.length === 0)";
                        } else {
                            resultObj.reson = menuItemUpdateResponse?.error?.message;
                        }
                    }
                    resultArr.push(resultObj);
                }
                console.log("result Arr for [item-off-webhook] => ", resultArr);

                res.status(200).json({
                    http_code: 200,
                    success: true,
                    error: ""
                });
            } else {
                if (outletQuery?.data?.length === 0) {
                    res.status(500).json({ success: false, error: "Outlet not found in mealpe system." });
                } else {
                    throw outletQuery?.error;
                }
            }
        } catch (error) {
            console.error("update-store-status-webhook => ", error);
            res.status(500).json({ success: false, error: error?.message || error || JSON.stringify(error) });
        }
    } else {
        res.status(500).json({ success: false, error: "Please pass restID." });
    }
})

router.post("/item-on-webhook", async (req, res) => {
    const { restID, inStock, itemID, type } = req.body;
    // {
    //   restID: 'bq69dxai',
    //   inStock: true,
    //   itemID: [ '10505295', '10505296' ],
    //   type: 'item'
    // }
    // {"success":true,"http_code":200,"error":""}

    console.log("req.body => ", req.body);

    if (restID) {

        try {
            const outletQuery = await supabaseInstance.from("Outlet").select("outletId,outletName,petPoojaRestId").eq("petPoojaRestId", restID);

            if (outletQuery?.data?.length > 0) {
                const outletQueryData = outletQuery.data[0];
                let resultArr = [];

                for (const itemIdElement of itemID) {
                    let resultObj = {
                        petpoojaItemId: itemIdElement,
                        success: true
                    }
                    const menuItemUpdateResponse = await supabaseInstance.from("Menu_Item").update({ status: true }).eq("outletId", outletQueryData?.outletId).eq("petpoojaItemId", itemIdElement).select("itemid");
                    if (menuItemUpdateResponse?.data?.length > 0) {
                        resultObj.updateLength = menuItemUpdateResponse?.data?.length;
                        resultObj.success = true;
                    } else {
                        resultObj.success = false;
                        if (menuItemUpdateResponse?.data?.length === 0) {
                            resultObj.reson = "Not update any Item (menuItemUpdateResponse?.data?.length === 0)";
                        } else {
                            resultObj.reson = menuItemUpdateResponse?.error?.message;
                        }
                    }
                    resultArr.push(resultObj);
                }
                console.log("result Arr for [item-on-webhook] => ", resultArr);

                res.status(200).json({
                    http_code: 200,
                    success: true,
                    error: ""
                });
            } else {
                if (outletQuery?.data?.length === 0) {
                    res.status(500).json({ success: false, error: "Outlet not found in mealpe system." });
                } else {
                    throw outletQuery?.error;
                }
            }
        } catch (error) {
            console.error("update-store-status-webhook => ", error);
            res.status(500).json({ success: false, error: error?.message || error || JSON.stringify(error) });
        }
    } else {
        res.status(500).json({ success: false, error: "Please pass restID." });
    }
})

router.post("/menu-sharing-webhook", async (req, res) => {
    const postBody = req.body;

    console.log("postBody => ", postBody);
    console.log("postBody?.restaurants?.[0]?.details?.menusharingcode => ", postBody?.restaurants?.[0]?.details?.menusharingcode);

    if (postBody?.success === "1" && postBody?.restaurants?.[0]?.details?.menusharingcode) {
        try {
            const outletQuery = await supabaseInstance.from("Outlet").select("outletId,outletName,petPoojaRestId,Menu_Parent_Categories!left(*),Menu_Categories!left(*),Menu_Item!left(*)").eq("petPoojaRestId", postBody?.restaurants?.[0]?.details?.menusharingcode).limit(1);

            if (outletQuery?.data?.length > 0) {
                const outletQueryData = outletQuery.data[0];

                res.status(200).json({
                    http_code: 200,
                    success: true,
                    error: "",
                    outletQueryData
                });
            } else {
                if (outletQuery?.data?.length === 0) {
                    res.status(500).json({ success: false, error: "Outlet not found in mealpe system." });
                } else {
                    throw outletQuery?.error;
                }
            }
        } catch (error) {
            console.error("menu-sharing-webhook => ", error);
            res.status(500).json({ success: false, error: error?.message || error || JSON.stringify(error) });
        }
    } else {
        res.status(500).json({ success: false, error: "Please pass postBody?.restaurants?.[0]?.details?.menusharingcode." });
    }
})
module.exports = router;