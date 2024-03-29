const axios = require("axios").default;
var express = require("express");
const moment = require("moment-timezone");
var router = express.Router();
var supabaseInstance = require("../../services/supabaseClient").supabase;
var petpoojaconfig = require("../../configs/petpoojaConfig");

router.post("/pushData", async (req, res) => {
  const { outletId } = req.body;
  try {

    let restaurentDataQuery = await supabaseInstance.from("Outlet").select("*").eq("outletId", outletId);
    // if (restaurantId) {
    //   restaurentDataQuery = supabaseInstance.from("Restaurant").select("*").eq("restaurantId", restaurantId);
    // } else if (restaurantId && outletId) {
    //   restaurentDataQuery = supabaseInstance.from("Outlet").select("*").eq("restaurantId", restaurantId).eq("outletId", outletId);
    // }

    const restaurentData = await restaurentDataQuery;

    let payload = {
      success: 1,
      restaurants: [
        {
          restaurantid: outletId,
          active: restaurentData.data.status,
          details: {
            menusharingcode: "xxxxxx",
            currency_html: "₹",
            country: "India",
            images: [

            ],
            restaurantname: restaurentData.data.restaurantName,
            address: "pune",
            contact: restaurentData.data.mobile,
            latitude: "23.190394",
            longitude: "72.610591",
            landmark: "",
            city3: restaurentData.data.address,
            state: "Gujarat",
            minimumorderamount: "0",
            minimumdeliverytime: "60Minutes",
            deliverycharge: "50",
            deliveryhoursfrom1: "",
            deliveryhoursto1: "",
            deliveryhoursfrom2: "",
            deliveryhoursto2: "",
            sc_applicable_on: "H,P,D",
            sc_type: "2",
            sc_calculate_on: "2",
            sc_value: "5",
            tax_on_sc: "1",
            calculatetaxonpacking: 1,
            pc_taxes_id: "11213,20375",
            calculatetaxondelivery: 1,
            dc_taxes_id: "11213,20375",
            packaging_applicable_on: "ORDER",
            packaging_charge: restaurentData.packaging_charge,
            packaging_charge_type: ""
          }
        }
      ],
      ordertypes: [
        {
          ordertypeid: 1,
          ordertype: "Delivery"
        },
        {
          ordertypeid: 2,
          ordertype: "PickUp"
        },
        {
          ordertypeid: 3,
          ordertype: "DineIn"
        }
      ],
      categories: [],
      parentcategories: [],
      items: [],
      variations: [],
      addongroups: [],
      attributes: [],
      discounts: [],
      taxes: [],
      serverdatetime: "2022-01-1811:33:13",
      db_version: "1.0",
      application_version: "4.0",
      http_code: 200
    }

    let parentCategoryQuery = await supabaseInstance.from("Menu_Parent_Categories").select("*").eq("outletId", outletId);
    // if (restaurantId && outletId) {
    //   parentCategoryQuery = await supabaseInstance.from("Menu_Parent_Categories").select("*").eq("restaurantId", restaurantId).eq("outletId", outletId);
    // } else if (restaurantId) {
    //   parentCategoryQuery = await supabaseInstance.from("Menu_Parent_Categories").select("*").eq("restaurantId", restaurantId).is("outletId", null);
    // }
    const parentCategoryData = await parentCategoryQuery;
    for (let data of parentCategoryData.data) {
      payload.parentcategories.push(data)
    }

    const attributeQuery = await supabaseInstance.from("Menu_Item_Attributes").select("*");
    for (let data of attributeQuery.data) {
      payload.attributes.push(data)
    }

    let menucategoryQuery = await supabaseInstance.from("Menu_Categories").select("*").eq("outletId", outletId)
    // if (restaurantId && outletId) {
    //   menucategoryQuery = await supabaseInstance.from("Menu_Categories").select("*").eq("restaurantId", restaurantId).eq("outletId", outletId);
    // } else if (restaurantId) {
    //   menucategoryQuery = await supabaseInstance.from("Menu_Categories").select("*").eq("restaurantId", restaurantId).is("outletId", null);
    // }
    const categoryData = await menucategoryQuery;
    for (let data of categoryData.data) {
      let petpoojaObj = {
        categoryid: data.categoryid,
        active: data.status,
        categoryrank: "16",
        parent_category_id: data.parent_category_id,
        categoryname: data.categoryname,
        categorytimings: "",
        category_image_url: data.category_image_url
      }
      payload.categories.push(petpoojaObj)
    }

    let itemQuery = await supabaseInstance.from("Menu_Item").select("*").eq("outletId", outletId);
    // if (restaurantId && outletId) {
    //   itemQuery = await supabaseInstance.from("Menu_Item").select("*").eq("restaurantId", restaurantId).eq("outletId", outletId);
    // } else if (restaurantId) {
    //   itemQuery = await supabaseInstance.from("Menu_Item").select("*").eq("restaurantId", restaurantId).is("outletId", null);
    // }
    const itemData = await itemQuery;
    for (let data of itemData.data) {
      let petpoojaObj = {
        itemid: data.itemid,
        itemallowvariation: "0",
        itemrank: "52",
        item_categoryid: data.item_categoryid,
        item_ordertype: "1,2,3",
        item_packingcharges: "",
        itemallowaddon: "1",
        itemaddonbasedon: "0",
        item_favorite: "0",
        ignore_taxes: "0",
        ignore_discounts: "0",
        in_stock: "2",
        cuisine: [],
        variation_groupname: "",
        variation: [],
        addon: [],
        itemname: data.itemname,
        item_attributeid: data.attributeid,
        itemdescription: data.itemdescription,
        minimumpreparationtime: data.minimumpreparationtime,
        price: data.price,
        active: data.status,
        item_image_url: data.item_image_url,
        item_tax: "sgst,cgst",
        gst_type: "services",
        nutrition: {}
      }
      payload.items.push(petpoojaObj)

    }

    // const taxQuery = supabaseInstance.from("Tax").select("*");
    // if (restaurantId && outletId) {
    //   taxDataQuery = taxQuery.eq("restaurantId", restaurantId).eq("outletId", outletId);
    // } else if (restaurantId) {
    //   taxDataQuery = taxQuery.eq("restaurantId", restaurantId).is("outletId", null);
    // }
    // const taxData = await taxDataQuery;
    // for (let data of taxData.data) {
    //   let petpoojaObj = {
    //     taxid: data.taxid,
    //     taxname: data.taxname,
    //     tax: data.tax,
    //     taxtype: "1",
    //     tax_ordertype: "",
    //     active: "1",
    //     tax_coreortotal: "2",
    //     tax_taxtype: "1",
    //     rank: "1",
    //     consider_in_core_amount: "0",
    //     description: ""
    //   }
    //   payload.taxes.push(petpoojaObj)
    // }

    const payloadData = await axios.post(petpoojaconfig.config.push_menu_api, payload);

    if (restaurentData) {
      res.status(200).json({
        success: true,
        data: payload,
        petpooja: payloadData?.data
      });
    } else {
      throw error;
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: error });
  }
});

router.post("/orderStatus", async (req, res) => {
  const { restaurantId, orderId } = req.body;
  try {

    const { data, error } = await supabaseInstance.from("Order").select("*").eq("restaurantId", restaurantId).eq("orderId", orderId).maybeSingle()
    let payload = {
      restID: restaurantId,
      orderID: orderId,
      status: data.orderStatusId,
      cancel_reason: "",
      minimum_prep_time: 20,
      minimum_delivery_time: "",
      rider_name: "",
      rider_phone_number: "",
      is_modified: "No"
    }

    //  const payloadData = await axios.post(petpoojaconfig.config.order_status_api, payload);

    if (data) {
      res.status(200).json({
        success: true,
        data: payload,
        petpooja: payloadData?.data
      });
    } else {
      throw error;
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: error });
  }
});

router.post("/fetchMenu", async (req, res) => {
  const { outletId } = req.body;
  try {
    let catgoryData = [];
    let taxData = [];
    let itemData = [];
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'app-key': petpoojaconfig.config.app_key,
        'app-secret': petpoojaconfig.config.app_secret,
        'access-token': petpoojaconfig.config.access_token
      },
    };

    const categoryid = await supabaseInstance.from("Menu_Categories").select("categoryid").eq("outletId", outletId);
    const taxid = await supabaseInstance.from("Tax").select("taxid").eq("outletId", outletId);
    const itemid = await supabaseInstance.from("Menu_Item").select("itemid").eq("outletId", outletId);
    const parentcategoryid = await supabaseInstance.from("Menu_Parent_Categories").select("parent_category_id").eq("outletId", outletId);


    const categoryId = categoryid.data.map(c => c.categoryid);
    const taxId = taxid.data.map(t => t.taxid);
    const itemId = itemid.data.map(i => i.itemid);
    const parentcategoryId = parentcategoryid.data.map(c => c.parent_category_id);

    // const menuCategoryDataRemove = await supabaseInstance.from("Menu_Categories").delete().in("categoryid", categoryId);
    // const menuItemDataRemove = await supabaseInstance.from("Menu_Item").delete().in("itemid", itemId);
    // const parentDataRemove = await supabaseInstance.from("Menu_Parent_Categories").delete().in("parent_category_id", parentcategoryId);
    // const taxDataRemove = await supabaseInstance.from("Tax").delete().in("taxid", taxId);

    const data = {
      "restID": outletId
    };
    const payloadData = await axios.post(petpoojaconfig.config.fetch_menu_api, data);

    // for (let data of payloadData?.data?.taxes) {
    //   taxQuery = await supabaseInstance.from("Tax").insert({ taxid: data.taxid, taxname: data.taxname, tax: data.tax, outletId: outletId }).select("*");
    //   taxData.push(taxQuery.data[0])
    // }

    for (let data of payloadData?.data?.categories) {
      categoryQuery = await supabaseInstance.from("Menu_Categories")
        .insert({
          outletId: outletId,
          categoryid: data.categoryid,
          categoryname: data.categoryname,
          status: data.active,
          //  parent_category_id:data.parent_category_id,
          category_image_url: data.category_image_url
        }).select("*");
      catgoryData.push(categoryQuery.data[0])
    }

    for (let data of payloadData?.data?.items) {

      let price = Number(data.price);
      let minimumpreparationtime = Number(data.minimumpreparationtime);
      itemQuery = await supabaseInstance.from("Menu_Item")
        .insert({
          itemid: data.itemid,
          // item_categoryid:data.item_categoryid,
          itemname: data.itemname,
          outletId: outletId,
          itemdescription: data.itemdescription,
          minimumpreparationtime: minimumpreparationtime,
          price: price,
          status: data.active,
          item_image_url: data.item_image_url,
          attributeid: data.item_attributeid,
          itemdescription: data.itemdescription,
        }).select("*")
      itemData.push(itemQuery.data[0])
    }

    for (let data of payloadData?.data?.parentcategories) {
      parentcategoryQuery = await supabaseInstance.from("Menu_Parent_Categories")
        .insert({
          outletId: outletId,
          parent_category_id: data.id,
          parentCategoryName: data.name,
          status: data.active,
          parent_category_image_url: data.image_url
        }).select("*");
    }

    if (payloadData?.data) {
      res.status(200).json({
        success: true,
        data: {
          categories: catgoryData,
          items: itemData,
          taxes: taxData,
          // parentcategory:parentcategoryQuery.data
        }
      });
    } else {
      throw error;
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: error });
  }
});

router.post("/fetchMenuCard", async (req, res) => {
  const { outletId } = req.body;
  const fetchMenuCardResponse = await fetchMenuCard(outletId);
  res.status(fetchMenuCardResponse?.status).json(fetchMenuCardResponse);
})

async function fetchMenuCard(outletId) {
  return new Promise(async (resolve, reject) => {
    try {

      const petPoojaQuery = await supabaseInstance.from("Outlet").select("*").eq("outletId", outletId).maybeSingle();

      if (petPoojaQuery?.data) {
        const options = {
          headers: {
            'Content-Type': 'application/json',
            'app-key': petPoojaQuery.data?.petPoojaAppKey,
            'app-secret': petPoojaQuery.data?.petPoojaAppSecret,
            'access-token': petPoojaQuery.data?.petPoojaApAccessToken
          },
        };

        const data = {
          "restID": petPoojaQuery.data?.petPoojaRestId
        };
        const payloadData = await axios.post(petpoojaconfig.config.fetch_menu_api, data, options);

        if (payloadData?.data) {

          if (!petPoojaQuery?.data?.petpoojaMenuBackup && payloadData?.data?.success === '1') {
            const petpoojaMenuBackup = await supabaseInstance.from("Outlet").update({ petpoojaMenuBackup: payloadData?.data }).select("*").eq("outletId", outletId).maybeSingle();
          }

          resolve({
            status: 200,
            success: true,
            data: payloadData.data,
            op: { fetch_menu_api: petpoojaconfig.config.fetch_menu_api, data, options }
          });
        } else {
          throw error;
        }
      } else {
        reolve({ status: 500, success: false, error: "Outlet not found." });
      }

    } catch (error) {
      console.error(error)
      reolve({ status: 500, success: false, error: error });
    }
  })
}

//? ref => https://onlineorderingapisv210.docs.apiary.io/#/reference/0/save-order?mc=reference%2F0%2Fsave-order%2Fsave-order%2F200
function saveOrderToPetpooja(request, orderId) {
  return new Promise(async (resolve, reject) => {
    try {
      const orderData = await supabaseInstance.from("Order").select("*, outletId(*), customerAuthUID(*), txnid(*), Order_Schedule!left(*), Order_Item!left(*, itemId(*)), DeliveryAddress!left(*)").eq("orderId", orderId).maybeSingle();
      // console.log("orderData => ", orderData);
      // console.log("orderData Order_Schedule => ", orderData.data?.Order_Schedule[0]);
      // console.log("orderData Order_Item => ", orderData.data?.Order_Item);
      // console.log("orderData outletId => ", orderData.data?.outletId);

      if (orderData.data?.outletId?.isOrderHandlingFromPetpooja && orderData.data?.outletId?.petPoojaAppKey && orderData.data?.outletId?.petPoojaAppSecret && orderData.data?.outletId?.petPoojaApAccessToken && orderData.data?.outletId?.petPoojaRestId) {

        let payload = {
          app_key: orderData.data?.outletId?.petPoojaAppKey,
          app_secret: orderData.data?.outletId?.petPoojaAppSecret,
          access_token: orderData.data?.outletId?.petPoojaApAccessToken,
          orderinfo: {
            OrderInfo: {

              //* Done
              Restaurant: {
                details: {
                  res_name: orderData.data?.outletId?.outletName,
                  address: orderData.data?.outletId?.address,
                  contact_information: String(orderData.data?.outletId?.mobile),
                  restID: orderData.data?.outletId?.petPoojaRestId
                }
              },

              //* Done
              Customer: {
                details: {
                  email: orderData.data?.customerAuthUID?.email,
                  name: orderData.data?.customerAuthUID?.customerName,
                  address: orderData.data?.DeliveryAddress?.[0]?.address || '',
                  phone: String(orderData.data?.customerAuthUID?.mobile),
                  latitude: "",
                  longitude: ""
                }
              },

              //* Done
              Order: {
                details: {
                  orderID: String(orderData?.data?.orderSequenceId),
                  created_on: moment(new Date(orderData.data?.created_at)).format("YYYY-MM-DD HH:mm:ss"),
                  preorder_date: orderData.data?.Order_Schedule?.[0]?.scheduleDate,
                  preorder_time: orderData.data?.Order_Schedule?.[0]?.scheduleTime,

                  order_type: orderData.data?.isDelivery ? 'H' : orderData.data?.isPickUp ? 'P' : 'D',

                  payment_type: "ONLINE",
                  // total: String((orderData.data?.txnid?.amount - Number(Number(orderData.data?.txnid?.foodGST) - Number(orderData.data?.txnid?.convenienceTotalAmount)).toFixed(2)) || ""), //todo add charge
                  total: String(Number(orderData.data?.txnid?.itemTotalPrice).toFixed(2) || ""), //todo add charge
                  tax_total: String(Number(Number(orderData.data?.txnid?.foodGST) + Number(orderData.data?.txnid?.convenienceTotalAmount)).toFixed(2) || ""),
                  packing_charges: String(orderData.data?.txnid?.packagingCharge || ""),
                  pc_tax_amount: "", //* Tax amount calculated on packing charge
                  pc_gst_details: [], //* Packing Charge GST liability with amount. It will be there in Order object (Required for Ecomm platform)
                  delivery_charges: String(orderData.data?.txnid?.deliveryCharge || ""), //todo add delivery charge
                  dc_tax_amount: "", //* Tax amount calculated on delivery charge
                  dc_gst_details: [], //* Delivery Charge GST liability with amount. It will be there in Order object (Required for Ecomm platform)
                  service_charge: "", //* Service charge applicable at order level.
                  sc_tax_amount: "",  //* Tax calculated on service charge
                  discount_total: "",
                  discount_type: "F",

                  description: "",
                  // min_prep_time: orderData.data?.isScheduleNow ? orderData.data?.preparationTime : 0,
                  callback_url: `https://${request.get('host')}/petpooja/pushMenu/petpooja-status-change/${orderId}`,
                  // callback_url: `https://mealpe-testing-api.onrender.com/petpooja/pushMenu/petpooja-status-change/${orderId}`,
                  enable_delivery: 1, //*Values can be 0 or 1 where 0 means Rider from thirdparty side will come and 1 means Rider from Restaurant i.e. self delivery order.

                  ondc_bap: "MealPe", //*An identifier to indicate if the order is from ONDC by passing the buyer app name.
                  advanced_order: "N", //* Flag which says that placed order is advance or not.Value is Boolean either Y or N.

                  table_no: "",
                  no_of_persons: "0",
                }
              },

              //* Done
              OrderItem: {
                details: []
              },

              Tax: {
                details: [
                  {
                    "id": "01",
                    "title": "CGST",
                    "type": "P",
                    "price": "2.5",
                    "tax": String(Number(orderData.data?.txnid?.foodGST / 2)?.toFixed(2) || ""),
                    "restaurant_liable_amt": ""
                  },
                  {
                    "id": "02",
                    "title": "SGST",
                    "type": "P",
                    "price": "2.5",
                    "tax": String(Number(orderData.data?.txnid?.foodGST / 2)?.toFixed(2) || ""),
                    "restaurant_liable_amt": ""
                  },
                  {
                    "id": "03",
                    "title": "Convenience Fee",
                    "type": "F",
                    // "tax": String(orderData.data?.txnid?.convenienceTotalAmount + orderData.data?.txnid?.commissionTotalAmount) || ''
                    "tax": String(orderData.data?.txnid?.convenienceTotalAmount || ""),
                    "restaurant_liable_amt": ""
                  },
                  // {
                  //   "id": "03",
                  //   "title": "Convenience Amount",
                  //   "type": "F",
                  //   // "price": "2.5",
                  //   "tax": String(orderData.data?.txnid?.convenienceTotalAmount) || ''
                  // },
                  // {
                  //   "id": "04",
                  //   "title": "Commission Amount",
                  //   "type": "F",
                  //   // "price": "2.5",
                  //   "tax": String(orderData.data?.txnid?.commissionTotalAmount) || ''
                  // }
                ]
              },
              // Discount: {}
            },
            udid: "",
            device_type: "Web"
          }
        }

        for (let itemData of orderData.data?.Order_Item) {

          let _itemPrice = itemData.itemPrice;
          // if (orderData?.data?.txnid?.isGSTApplied === false) {
          //   // _itemPrice = itemData.itemPrice - Number((5*itemData.itemPrice)/100).toFixed(2);
          //   _itemPrice = Number(((itemData.itemPrice * 100) / 105).toFixed(2));
          // }

          let petpoojaOrderObj = {
            id: itemData?.itemId?.petpoojaItemId ? itemData?.itemId?.petpoojaItemId : itemData?.itemId?.itemid,
            name: itemData?.itemId?.itemname,
            description: "",

            gst_liability: "vendor", //* Required for Ecomm platform and Optional for others.GST liability ownership. It will be there in the item object (vendor/restaurant)
            item_tax: [], //* Tax calculated at item level after discount
            item_discount: "0",
            final_price: _itemPrice, //* Item price after discount. If there is no discount, Price and finalPrice objects will have the same value.
            price: _itemPrice, //* Unit price of item.(This price includes addonitems price and if variations then includes variation price.)
            // price: itemData.calculatedPrice,
            quantity: itemData.quantity,

            variation_name: "",
            variation_id: "",
            AddonItem: {
              details: []
            }
          }
          payload.orderinfo.OrderInfo.OrderItem.details.push(petpoojaOrderObj);
        }

        // const payloadData = await axios.post(petpoojaconfig.config.save_order_api, payload);

        let saveOrderReaponse = null;
        let saveOrderError = null;
        axios.post(petpoojaconfig.config.save_order_api, payload).then((_saveOrderReaponse) => {
          if (_saveOrderReaponse.data?.success === '1') {
            saveOrderReaponse = _saveOrderReaponse.data;
          } else {
            saveOrderError = _saveOrderReaponse.data;
          }
        }).catch((_saveOrderError) => {
          let _err = _saveOrderError?.response?.data || _saveOrderError?.response || _saveOrderError;
          saveOrderError = _err;
        }).finally(async () => {
          let _postObject = {
            orderId: orderId,
            postBody: payload
          }
          if (saveOrderReaponse) {
            _postObject.success = saveOrderReaponse;
          }
          if (saveOrderError) {
            _postObject.error = saveOrderError;
          }

          const insertResponse = await supabaseInstance.from('Order_Save_Petpooja').insert(_postObject).select('*').maybeSingle();
          console.log("insertResponse => ", insertResponse);
          resolve({
            success: Boolean(saveOrderReaponse),
            Order_Save_Petpooja: insertResponse?.data || null
          })
        })
      } else {
        resolve({ success: false, error: "Petpooja config not found." });
      }
    } catch (error) {
      console.log(error);
      resolve({
        success: false,
        error: error?.message || error
      })
    }
  })
};

router.post("/saveOrderToPetpoojaTest", async (req, res) => {
  saveOrderToPetpooja(req, 'b131e7ea-b5b0-4c38-90e1-c8acfe6e2a03').then(response => {
    res.send(response);
  }).catch(err => {
    res.send(err);
  })
})

router.post("/petpooja-status-change/:orderId", async (req, res) => {
  // const postBody = req.body;
  // const query = req.query;
  // const params = req.params;

  // console.log("petpooja-status-change-[POST]-postBody => ", postBody);
  // console.log("petpooja-status-change-[POST]-query =>    ", query);
  // console.log("petpooja-status-change-[POST]-params =>   ", params);

  const { orderID, status, minimum_prep_time } = req.body;
  const { orderId } = req.params;
  let _status = status;

  if (status && orderId) {
    try {
      if (_status === '-1') {
        _status = '-2';
      }
      console.log("_status => ", { orderStatusId: _status });
      const orderResponse = await supabaseInstance.from("Order").update({ orderStatusId: _status, preparationTime: minimum_prep_time }).eq("orderId", orderId).select("*").maybeSingle();
      if (orderResponse.data) {
        console.log("status change successfully");
        res.send({ success: true });
      } else {
        throw orderResponse.error;
      }
    } catch (error) {
      console.error(`petpooja-status-change error for ${orderId} => `, error);
      res.send({ success: false });
    }
  } else {
    console.error({ _status, orderId });
    res.send({ success: false });
  }
})

function updateOrderStatus(orderId, updatedOrderStatus) {
  return new Promise(async (resolve, reject) => {
    try {

      const orderQuery = await supabaseInstance.from("Order").select("*,outletId(*)").eq("orderId", orderId).maybeSingle();

      if (orderQuery?.data) {
        const orderData = orderQuery.data;
        if (
          orderData?.outletId?.petPoojaAppKey &&
          orderData?.outletId?.petPoojaAppSecret &&
          orderData?.outletId?.petPoojaApAccessToken &&
          orderData?.outletId?.petPoojaRestId
        ) {
          let payload = {
            app_key: orderData?.outletId?.petPoojaAppKey,
            app_secret: orderData?.outletId?.petPoojaAppSecret,
            access_token: orderData?.outletId?.petPoojaApAccessToken,
            restID: orderData?.outletId?.petPoojaRestId,
            orderID: orderId,
            clientorderID: orderData?.customerAuthUID,
            cancelReason: "",
            status: updatedOrderStatus
          }

          const petPoojaUpdateOrderStatus = await axios.post(petpoojaconfig.config.update_order_status_api, payload);

          if (petPoojaUpdateOrderStatus.data) {
            resolve({ success: true, data: petPoojaUpdateOrderStatus.data })
          }

        } else {
          resolve({ success: false, error: "Petpooja config not found." })
        }
      } else {
        resolve({ success: false, error: "Order not found." })
      }

    } catch (error) {
      resolve({
        success: false,
        error: error?.message || error
      })
    }
  })
};

// function getStoreStatus(outletId) {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const outletQuery = await supabaseInstance.from("Outlet").select("*").eq("outletId", outletId).maybeSingle();

//       if (outletQuery?.data) {
//         const restID = outletQuery.data.petPoojaRestId;

//         if (restID) {
//           const petPoojaUpStoreStatus = await axios.post('https://private-anon-947573d619-onlineorderingapisv210.apiary-mock.com/get_store_status', restID);

//           if (petPoojaUpStoreStatus.data) {
//             resolve({ success: true, data: petPoojaUpStoreStatus.data })
//           } else {
//             console.log("Something Went Wrong.")
//             resolve({ success: false, error: "Something Went Wrong." })
//           }
//         } else {
//           console.log("restID not found.")
//           resolve({ success: false, error: "restID not found." })
//         }
//       } else {
//         console.log("Outlet not found.")
//         resolve({ success: false, error: "Outlet not found." })
//       }
//     } catch (error) {
//       resolve({ success: false, error: error?.message || error })
//     }
//   })
// };

function updateStoreStatus(outletId) {
  return new Promise(async (resolve, reject) => {
    try {
      const outletQuery = await supabaseInstance.from("Outlet").select("petPoojaRestId,isOutletOpen,Timing!left(openTime,dayId(day))").eq("outletId", outletId).maybeSingle();
      if (outletQuery?.data) {

        const restID = outletQuery.data.petPoojaRestId;
        const store_status = outletQuery.data.isOutletOpen ? 1 : 0;
        let turn_on_time = null;

        outletQuery.data?.Timing.forEach((_ele, _index) => {
          if (!turn_on_time) {
            const _day = moment().tz("Asia/Kolkata").add(_index + 1, 'days').format("dddd");
            const pickedDayObject = outletQuery.data?.Timing?.find(f => f.dayId?.day === _day);
            if (pickedDayObject.openTime) {
              turn_on_time = moment().tz("Asia/Kolkata").add(_index + 1, 'days').format(`YYYY-MM-DD ${pickedDayObject.openTime}`);
            }
          }
        })

        if (restID && (store_status === 0 || store_status === 1)  && turn_on_time) {
          try {
            let payload = {
              "restID": restID,
              "store_status": String(store_status),
              "reason": store_status ? "Store On" : "Store off"
            }
            if (store_status === 0) {
              payload["turn_on_time"] = turn_on_time;
            }
            const petPoojaUpUpdateStoreStatus = await axios.post(petpoojaconfig.config.update_store_status_api, payload);
            if (petPoojaUpUpdateStoreStatus.data) {
              console.log("petPoojaUpUpdateStoreStatus.data===>", petPoojaUpUpdateStoreStatus.data);
              resolve({ success: true, data: petPoojaUpUpdateStoreStatus.data })
            } else {
              console.log("Something Went Wrong.");
              resolve({ success: false, error: "Something Went Wrong.", petpoojaApiError: true })
            }
          } catch (axiosError) {
            console.log("update_store_status axiosError => ", axiosError?.response?.data);
            resolve({ success: false, error: axiosError?.response?.data, petpoojaApiError: true })
          }
        } else {
          console.log("restID not found.");
          resolve({ success: false, error: "restID not found.", petpoojaApiError: false })
        }
      } else {
        resolve({ success: false, error: "Restaurent Data Not Found.", petpoojaApiError: false })
      }
    } catch (error) {
      resolve({ success: false, error: error?.message || error, petpoojaApiError: false })
    }
  })
};

// updateStoreStatus("08d06cbe-27d1-4f4b-87e8-38e341622625")

// function updateItemAddon(outletId, itemID) {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const outletQuery = await supabaseInstance.from("Outlet").select("petPoojaRestId,Menu_Item!left(itemid,status)").eq("outletId", outletId).eq("Menu_Item.itemid", itemID).maybeSingle();

//       if (outletQuery?.data) {

//         const restID = outletQuery?.data?.petPoojaRestId;
//         const inStock = outletQuery?.data?.Menu_Item[0]?.status;

//         if (restID && inStock) {
//           let payload = {
//             "restID": restID,
//             "type": "item",
//             "inStock": inStock,
//             "itemID": [itemID],
//             "autoTurnOnTime": "custom",
//             "customTurnOnTime": "2020-02-24 18:00"
//           }

//           const petPoojaUpUpdateStoreStatus = await axios.post('https://private-anon-947573d619-onlineorderingapisv210.apiary-mock.com/item_stock_off', payload);

//           if (petPoojaUpUpdateStoreStatus.data) {
//             resolve({ success: true, data: petPoojaUpUpdateStoreStatus.data })
//           } else {
//             resolve({ success: false, error: "Something Went Wrong." })
//           }
//         } else {
//           resolve({ success: false, error: "restID not found." })
//         }
//       } else {
//         resolve({ success: false, error: "Restaurent Data Not Found." })
//       }
//     } catch (error) {
//       resolve({ success: false, error: error?.message || error })
//     }
//   })
// };

module.exports = { router, saveOrderToPetpooja, updateOrderStatus, fetchMenuCard, updateStoreStatus };