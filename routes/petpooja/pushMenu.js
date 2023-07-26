var express = require("express");
var router = express.Router();
var supabaseInstance = require("../../services/supabaseClient").supabase;


router.post("/pushData", async (req, res) => {
  const { restaurantId, outletId } = req.body;
    try {

      let restaurentDataQuery;
      if (restaurantId) {
        restaurentDataQuery = supabaseInstance.from("Restaurant").select("*").eq("restaurantId", restaurantId)
      } else if (restaurantId && outletId) {
        restaurentDataQuery = supabaseInstance.from("Outlet").select("*").eq("restaurantId", restaurantId).eq("outletId", outletId)
      }
      const restaurentData = await restaurentDataQuery.maybeSingle();

      if (restaurantId) {
        menuDataQuery = supabaseInstance.from("Menu_Categories").select("*").eq("restaurantId", restaurantId)
      } else if (restaurantId && outletId) {
        menuDataQuery = supabaseInstance.from("Menu_Categories").select("*").eq("restaurantId", restaurantId).eq("outletId", outletId)
      }
      const categoryData = await menuDataQuery;  
  
      if (restaurantId) {
        taxDataQuery = supabaseInstance.from("Tax").select("*").eq("restaurantId", restaurantId)
      } else if (restaurantId && outletId) {
        taxDataQuery = supabaseInstance.from("Tax").select("*").eq("restaurantId", restaurantId).eq("outletId", outletId)
      }
      const taxData = await taxDataQuery

      const attributeData  = await supabaseInstance
      .from("Menu_Item_Attributes")
      .select("*")
      let attribute =[]
      for( let i=0;i<attributeData.data.length;i++){

        attribute.push(attributeData.data)

      }
      console.log(attribute)

      
      const itemData  = await supabaseInstance
      .from("Menu_Item")
      .select("*")
      console.log(itemData)

  

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
  // ordertypes: [
  //   {
  //     ordertypeid: 1,
  //     ordertype: "Delivery"
  //   },
  //   {
  //     ordertypeid: 2,
  //     ordertype: "PickUp"
  //   },
  //   {
  //     ordertypeid: 3,
  //     ordertype: "DineIn"
  //   }
  // ],
  categories: [
    {
      categoryid: categoryData.data[0].categoryid,
      active: categoryData.data[0].status,
      categoryrank: "16",
      parent_category_id: categoryData.data[0].parent_category_id,
      categoryname: categoryData.data[0].categoryname,
      categorytimings: "",
      category_image_url: categoryData.data[0].category_image_url
    }
  ],
  parentcategories: [

  ],
  items: [
    {
      itemid: "118829149",
      itemallowvariation: "0",
      itemrank: "52",
      item_categoryid: "500773",
      item_ordertype: "1,2,3",
      item_packingcharges: "",
      itemallowaddon: "1",
      itemaddonbasedon: "0",
      item_favorite: "0",
      ignore_taxes: "0",
      ignore_discounts: "0",
      in_stock: "2",
      "cuisine" : [],
      variation_groupname: "",
      variation: [],
      addon: [],
      itemname: "Veg Loaded Pizza",
      item_attributeid: "1",
      itemdescription: "",
      minimumpreparationtime: "",
      price: "100",
      active: "1",
      item_image_url: "",
      item_tax: "sgst,cgst",
      "gst_type" : "services",
      nutrition: {}
    }
  ],
      variations: [],
      addongroups: [],
      attributes: [
        {
          attributeid: attribute.attributeid,
          attribute: attribute.attribute,
          active: attribute.data.active
        }
      ],
      discounts: [],
      taxes: [
        {
          taxid: taxData.data[0].taxid,
          taxname: taxData.data[0].taxname,
          tax: taxData.data[0].tax,
          taxtype: "1",
          tax_ordertype: "",
          active: "1",
          tax_coreortotal: "2",
          tax_taxtype: "1",
          rank: "1",
          consider_in_core_amount: "0",
          description: ""
        }
      ],
      serverdatetime: "2022-01-1811:33:13",
      db_version: "1.0",
      application_version: "4.0",
      http_code: 200
    }

    
  const   payloadData = JSON.stringify(payload)

    res.send(payload)
       
      // if (data) {
      //   res.status(200).json({
      //     success: true,
      //     data: payload
      //   });
      // } else {
      //   throw error;
      // }
    } catch (error) {
      console.log(error)

      res.status(500).json({ success: false, error: error });
    }
  });








module.exports = router;
