const { default: axios } = require("axios");
var express = require("express");
var router = express.Router();
var supabaseInstance = require("../../services/supabaseClient").supabase;


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
      active:restaurentData.data.status ,
      details: {
        menusharingcode: "xxxxxx",
        currency_html: "₹",
        country: "India",
        images: [

        ],
        restaurantname:restaurentData.data.restaurantName ,
        address:"pune" ,
        contact:restaurentData.data.mobile ,
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
      attributes: [ ],
      discounts: [],
      taxes: [],
      serverdatetime: "2022-01-1811:33:13",
      db_version: "1.0",
      application_version: "4.0",
      http_code: 200
    }

  let parentCategoryQuery ;
    if (restaurantId && outletId) {
      parentCategoryQuery = await supabaseInstance.from("Menu_Parent_Categories").select("*").eq("restaurantId",restaurantId).eq("outletId", outletId);
    } else if (restaurantId) {
      parentCategoryQuery =  await supabaseInstance.from("Menu_Parent_Categories").select("*").eq("restaurantId",restaurantId).is("outletId", null);
    }
    const parentCategoryData =await parentCategoryQuery;
    for(let data of parentCategoryData.data){
      payload.parentcategories.push(data)
    }

  const  attributeQuery = await supabaseInstance.from("Menu_Item_Attributes").select("*");
    for(let data of attributeQuery.data){
      payload.attributes.push(data)
    }

    let menucategoryQuery;
    if (restaurantId && outletId) {
      menucategoryQuery = await supabaseInstance.from("Menu_Categories").select("*").eq("restaurantId",restaurantId).eq("outletId", outletId);
    } else if (restaurantId) {
      menucategoryQuery =  await supabaseInstance.from("Menu_Categories").select("*").eq("restaurantId",restaurantId).is("outletId", null);
    }
    const categoryData = await menucategoryQuery;
  for(let data of categoryData.data){
    let petpoojaObj ={
      categoryid:data.categoryid,
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
      itemQuery = await supabaseInstance.from("Menu_Item").select("*").eq("restaurantId",restaurantId).eq("outletId", outletId);
    } else if (restaurantId) {
      itemQuery =  await supabaseInstance.from("Menu_Item").select("*").eq("restaurantId",restaurantId).is("outletId", null);
    }
    const itemData = await itemQuery;
      for(let data of itemData.data){
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
          cuisine : [],
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
          gst_type : "services",
          nutrition: {}
        }
        payload.items.push(petpoojaObj)

       }

      const taxQuery =supabaseInstance.from("Tax").select("*");
      if (restaurantId && outletId) {
        taxDataQuery = taxQuery.eq("restaurantId", restaurantId).eq("outletId", outletId);
      } else if (restaurantId) {
        taxDataQuery = taxQuery.eq("restaurantId", restaurantId).is("outletId", null);  
      }
      const taxData = await taxDataQuery;
      for(let data of taxData.data){
        let petpoojaObj ={
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

module.exports = router;
