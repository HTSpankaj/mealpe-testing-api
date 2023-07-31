const { default: axios } = require("axios");
var express = require("express");
var router = express.Router();
var supabaseInstance = require("../../services/supabaseClient").supabase;
var petpoojaconfig = require("../../configs/petpoojaConfig");


router.post("/pushData", async (req, res) => {
  const { restaurantId, outletId } = req.body;
  try {

    let restaurentDataQuery;
    if (restaurantId) {
      restaurentDataQuery = supabaseInstance.from("Restaurant").select("*").eq("restaurantId", restaurantId);
    } else if (restaurantId && outletId) {
      restaurentDataQuery = supabaseInstance.from("Outlet").select("*").eq("restaurantId", restaurantId).eq("outletId", outletId);
    }
    const restaurentData = await restaurentDataQuery;

    let payload = {
      success: 1,
      restaurants: [
        {
          restaurantid: restaurantId,
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

    let parentCategoryQuery;
    if (restaurantId && outletId) {
      parentCategoryQuery = await supabaseInstance.from("Menu_Parent_Categories").select("*").eq("restaurantId", restaurantId).eq("outletId", outletId);
    } else if (restaurantId) {
      parentCategoryQuery = await supabaseInstance.from("Menu_Parent_Categories").select("*").eq("restaurantId", restaurantId).is("outletId", null);
    }
    const parentCategoryData = await parentCategoryQuery;
    for (let data of parentCategoryData.data) {
      payload.parentcategories.push(data)
    }

    const attributeQuery = await supabaseInstance.from("Menu_Item_Attributes").select("*");
    for (let data of attributeQuery.data) {
      payload.attributes.push(data)
    }

    let menucategoryQuery;
    if (restaurantId && outletId) {
      menucategoryQuery = await supabaseInstance.from("Menu_Categories").select("*").eq("restaurantId", restaurantId).eq("outletId", outletId);
    } else if (restaurantId) {
      menucategoryQuery = await supabaseInstance.from("Menu_Categories").select("*").eq("restaurantId", restaurantId).is("outletId", null);
    }
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

    let itemQuery;
    if (restaurantId && outletId) {
      itemQuery = await supabaseInstance.from("Menu_Item").select("*").eq("restaurantId", restaurantId).eq("outletId", outletId);
    } else if (restaurantId) {
      itemQuery = await supabaseInstance.from("Menu_Item").select("*").eq("restaurantId", restaurantId).is("outletId", null);
    }
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

    const taxQuery = supabaseInstance.from("Tax").select("*");
    if (restaurantId && outletId) {
      taxDataQuery = taxQuery.eq("restaurantId", restaurantId).eq("outletId", outletId);
    } else if (restaurantId) {
      taxDataQuery = taxQuery.eq("restaurantId", restaurantId).is("outletId", null);
    }
    const taxData = await taxDataQuery;
    for (let data of taxData.data) {
      let petpoojaObj = {
        taxid: data.taxid,
        taxname: data.taxname,
        tax: data.tax,
        taxtype: "1",
        tax_ordertype: "",
        active: "1",
        tax_coreortotal: "2",
        tax_taxtype: "1",
        rank: "1",
        consider_in_core_amount: "0",
        description: ""
      }
      payload.taxes.push(petpoojaObj)
    }

    const payloadData = await axios.post("https://private-anon-e8405b2d6a-onlineorderingapisv210.apiary-mock.com/pushmenu_endpoint", payload);

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

function saveOrderToPetpooja (restaurantId) {
  return new Promise((resolve, reject) => {
    try {


      let restaurentDataQuery;
      if (restaurantId) {
        restaurentDataQuery = supabaseInstance.from("Restaurant").select("*").eq("restaurantId", restaurantId);
      } else if (restaurantId && outletId) {
        restaurentDataQuery = supabaseInstance.from("Outlet").select("*").eq("restaurantId", restaurantId).eq("outletId", outletId);
      }
      const restaurentData =  restaurentDataQuery;

      console.log("restaurentData===>",restaurentData)


      let orderQuery;
      if (outletId && restaurantId) {
        orderQuery = supabaseInstance.from("Order").select("*,Order_Item(*),Order_Schedule(*)").eq("outletId", outletId).eq("restaurantId", restaurantId);
      } else if (restaurantId) {
        orderQuery = supabaseInstance.from("Order").select("*,Order_Item(*),Order_Schedule(*)").eq("restaurantId", restaurantId);
      }
      const orderData =  orderQuery;

      let payload = {
        app_key: app_key,
        app_secret: app_secret,
        access_token: access_token,
        orderinfo: {
            OrderInfo: {
                Restaurant: {
                    details: {
                        res_name: restaurentData.data.restaurantname,
                        address: restaurentData.data.address,
                        contact_information: restaurentData.data.mobile,
                        restID: restaurentData.data.restaurantId
                    }
                },
                Customer: {
                    details: {
                        email: "xxx@yahoo.com",
                        name: "Advait",
                        address: "2, Amin Society, Naranpura",
                        phone: "9090909090",
                        latitude: "34.11752681212772",
                        longitude: "74.72949172653219"
                    }
                },
                Order: {
                    details: {
                        orderID: orderData.data.orderId,
                        preorder_date: "2022-01-01",
                        preorder_time: "15:50:00",
                        service_charge: "0",
                        sc_tax_amount: "0",
                        delivery_charges: "50",
                        dc_tax_amount: "2.5",
                        dc_gst_details: [
                            {
                                gst_liable: "vendor",
                                amount: "2.5"
                            },
                            {
                                gst_liable: "restaurant",
                                amount: "0"
                            }
                        ],
                        packing_charges: "20",
                        pc_tax_amount: "1",
                        pc_gst_details: [
                            {
                                gst_liable: "vendor",
                                amount: "1"
                            },
                            {
                                gst_liable: "restaurant",
                                amount: "0"
                            }
                        ],
                        order_type: "H",
                        ondc_bap: "buyerAppName",
                        advanced_order: "N",
                        payment_type: "COD",
                        table_no: "",
                        no_of_persons: "0",
                        discount_total: "45",
                        tax_total: "65.52",
                        discount_type: "F",
                        total: "560",
                        description: "",
                        created_on: "2022-01-01 15:49:00",
                        enable_delivery: 1,
                        min_prep_time: 20,
                        callback_url: "https.xyz.abc"
                    }
                },
                OrderItem: {
                    details: [
                        {
                            id: "7765862",
                            name: "Garlic Bread (3Pieces)",
                            gst_liability: "vendor",
                            item_tax: [
                                {
                                    id: "11213",
                                    name: "CGST",
                                    amount: "3.15"
                                },
                                {
                                    id: "20375",
                                    name: "SGST",
                                    amount: "3.15"
                                }
                            ],
                            item_discount: "14",
                            price: "140.00",
                            final_price: "126",
                            quantity: "1",
                            description: "",
                            variation_name: "3Pieces",
                            variation_id: "89058",
                            AddonItem: {
                                details: []
                            }
                        }
                    ]
                },
                Tax: {
                    details: [
                        {
                            id: "11213",
                            title: "CGST",
                            type: "P",
                            price: "2.5",
                            tax: "5.9",
                            restaurant_liable_amt: "0.00"
                        },
                        {
                            id: "20375",
                            title: "SGST",
                            type: "P",
                            price: "2.5",
                            tax: "5.9",
                            restaurant_liable_amt: "0.00"
                        }
                    ]
                },
                Discount: {}
            },
            udid: "",
            device_type: "Web"
        }
    }
      

      resolve({
        success: true,
        message: ""
      })
    } catch (error) {
      reject({
        success: false,
        error: error?.message || error
      })
    }
  })
}

module.exports = {router, saveOrderToPetpooja};
