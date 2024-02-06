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

    // console.log("postBody => ", postBody);
    console.log("postBody?.restaurants?.[0]?.details?.menusharingcode => ", postBody?.restaurants?.[0]?.details?.menusharingcode);

    if (postBody?.success === "1" && postBody?.restaurants?.[0]?.details?.menusharingcode) {
        try {
            const outletQuery = await supabaseInstance.from("Outlet").select(
                `outletId,outletName,petPoojaRestId,
                Menu_Parent_Categories!left(parent_category_id,parentCategoryName,outletId,parent_category_image_url,status,petpoojaParentCategoryId),
                Menu_Categories!left(categoryid,status,parent_category_id,categoryname,category_image_url,petpoojaCategoryId),
                Menu_Item!left(*)`
            ).eq("petPoojaRestId", postBody?.restaurants?.[0]?.details?.menusharingcode).limit(1);

            //          Petpooja                |           Mealpe
            // -----------------------------------------------
            // -----------------------------------------------
            // parentcategories                 |   Menu_Parent_Categories
            //  -id                             |       - parent_category_id
            //  -name                           |       - parentCategoryName
            //                                  |       - outletId
            //                                  |       - parent_category_image_url
            //  -status                         |       - status
            //                                  |       - petpoojaParentCategoryId
            // -----------------------------------------------
            // categories                       |   Menu_Categories
            //  -categoryid                     |       -categoryid
            //  -active                         |       -status
            //  -parent_category_id             |       -parent_category_id
            //  -categoryname                   |       -categoryname
            //  -category_image_url             |       -category_image_url
            //  -                               |       -petpoojaCategoryId
            //  
            // -----------------------------------------------
            // items                            |   Menu_Item
            //  -itemid                         |       -itemid
            //  -item_categoryid                |       -item_categoryid
            //  -itemname                       |       -itemname
            //  -itemdescription                |       -itemdescription
            //  -price                          |       -price
            //  -active                         |       -status
            //  -minimumpreparationtime         |       -minimumpreparationtime
            //  -item_image_url                 |       -item_image_url
            //  -                               |       -outletId
            //  -                               |       -petpoojaItemId
            //  -                               |       -

            if (outletQuery?.data?.length > 0) {
                const outletQueryData = outletQuery.data[0];
                const parentcategoriesData = postBody.parentcategories;
                const menuCategoriesData = postBody.categories;
                const itemsData = postBody.items;

                if (parentcategoriesData?.length > 0) {
                    for (let petpoojaParentCategoryObject of parentcategoriesData) {
                        const mealpeParentCategoryObject = outletQueryData?.Menu_Parent_Categories?.find(f => f.petpoojaParentCategoryId === petpoojaParentCategoryObject.id);

                        let p_c_body = {
                            status: petpoojaParentCategoryObject?.status === "1" ? true : false,
                            parentCategoryName: petpoojaParentCategoryObject?.name,
                            petpoojaParentCategoryId: petpoojaParentCategoryObject?.id
                        }

                        if (!mealpeParentCategoryObject) {
                            p_c_body.outletId = outletQueryData.outletId;
                            const parentcategoriesResponse = await supabaseInstance.from("Menu_Parent_Categories").insert(p_c_body).select("*").maybeSingle();
                            if (parentcategoriesResponse?.data) {
                                petpoojaParentCategoryObject.mealpeResponse = parentcategoriesResponse?.data;
                            }
                        } else {
                            const parentcategoriesResponse = await supabaseInstance.from("Menu_Parent_Categories").update({ parentCategoryName: p_c_body.parentCategoryName, status: p_c_body.status }).eq("parent_category_id", mealpeParentCategoryObject?.parent_category_id).select("*").maybeSingle();
                            if (parentcategoriesResponse?.data) {
                                petpoojaParentCategoryObject.mealpeResponse = parentcategoriesResponse?.data;
                            }
                        }
                    }
                }

                if (menuCategoriesData?.length > 0) {
                    for (let petpoojaCategoryObject of menuCategoriesData) {
                        const mealpeCategoryObject = outletQueryData.Menu_Categories.find(f => f.petpoojaCategoryId === petpoojaCategoryObject.categoryid);

                        let c_body = {
                            status: petpoojaCategoryObject?.active === "1" ? true : false,
                            categoryname: petpoojaCategoryObject?.categoryname,
                            category_image_url: petpoojaCategoryObject?.category_image_url,
                            petpoojaCategoryId: petpoojaCategoryObject?.categoryid
                        }

                        if (petpoojaCategoryObject?.parent_category_id && petpoojaCategoryObject?.parent_category_id !== "0") {
                            c_body.parent_category_id = parentcategoriesData.find(f => f.id === petpoojaCategoryObject?.parent_category_id)?.mealpeResponse?.parent_category_id || null;
                        }

                        if (!mealpeCategoryObject) {
                            c_body.outletId = outletQueryData.outletId;
                            const menuCategoriesResponse = await supabaseInstance.from("Menu_Categories").insert(c_body).select("*").maybeSingle();

                            if (menuCategoriesResponse?.data) {
                                petpoojaCategoryObject.mealpeResponse = menuCategoriesResponse?.data;
                            }
                        } else {
                            const menuCategoriesResponse = await supabaseInstance
                                .from("Menu_Categories")
                                .update({ status: c_body.active, parent_category_id: c_body.parent_category_id, categoryname: c_body.categoryname, category_image_url: c_body.category_image_url })
                                .eq("categoryid", mealpeCategoryObject.categoryid)
                                .select("*")
                                .maybeSingle();
                            if (menuCategoriesResponse?.data) {
                                petpoojaCategoryObject.mealpeResponse = menuCategoriesResponse?.data;
                            }
                        }
                    }
                }

                if (itemsData?.length > 0) {
                    for (let petpoojaItemObject of itemsData) {
                        const mealpeItemObject = outletQueryData.Menu_Item.find(f => f.petpoojaItemId === petpoojaItemObject.itemid);
                        let i_body = {
                            itemname: petpoojaItemObject?.itemname,
                            itemdescription: petpoojaItemObject?.itemdescription,
                            price: parseFloat(petpoojaItemObject?.price),
                            status: petpoojaItemObject?.active === "1" ? true : false,
                            minimumpreparationtime: parseFloat(petpoojaItemObject?.minimumpreparationtime),
                            item_image_url: petpoojaItemObject?.item_image_url,
                            petpoojaItemId: petpoojaItemObject?.itemid
                        }

                        if (petpoojaItemObject?.item_categoryid) {
                            i_body.item_categoryid = menuCategoriesData.find(f => f.categoryid === petpoojaItemObject?.item_categoryid)?.mealpeResponse?.categoryid || null;
                        }

                        if (!mealpeItemObject) {
                            i_body.outletId = outletQueryData.outletId;
                            const itemResponse = await supabaseInstance.from("Menu_Item").insert(i_body).select("*").maybeSingle();
                            if (itemResponse?.data) {
                                petpoojaItemObject.mealpeResponse = itemResponse?.data;
                            }
                        } else {
                            const itemResponse = await supabaseInstance
                                .from("Menu_Item")
                                .update({ itemname: i_body.itemname, price: i_body.price, itemdescription: i_body.itemdescription, item_image_url: i_body.item_image_url, status: i_body.status, minimumpreparationtime: i_body.minimumpreparationtime, item_categoryid: i_body.item_categoryid })
                                .select("*")
                                .eq("itemid", mealpeItemObject.itemid)
                                .maybeSingle();
                            if (itemResponse?.data) {
                                petpoojaItemObject.mealpeResponse = itemResponse?.data;
                            }
                        }
                    }
                }

                res.status(200).json({
                    http_code: 200,
                    success: true,
                    error: "",
                    // outletQueryData
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