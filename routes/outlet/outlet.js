var express = require("express");
var router = express.Router();
var supabaseInstance = require("../../services/supabaseClient").supabase;
const multer = require("multer");
const upload = multer();

router.post("/createOutlet", async (req, res) => {
  const {
    outletName,
    email,
    isPrimaryOutlet,
    primaryOutletId,
    password,
    bankDetailsId,
    outletAdminId,
    cityId,
    restaurantName,
    mobile,
    GSTIN,
    campusId,
    address,
    openTime,
    closeTime,
    Restaurant_category,
    Timing,
    isGSTShow
  } = req.body;
  try {
    const { data, error } = await supabaseInstance.auth.signUp(
      {
        email: email,
        password: password,
        options: {
          data: {
            isRestaurant: false,
            isOutlet: true,
          }
        }
      })
    if (data?.user) {
      const outletId = data.user.id;


      const bankDetails = await supabaseInstance.from("BankDetails").insert({ accountNumber: bankDetailsId?.accountNumber || null, BankName: bankDetailsId?.BankName || null, IFSCCode: bankDetailsId?.IFSCCode || null }).select().maybeSingle();
      const _bankDetailsId = bankDetails.data.bankDetailsId;

      const outletDetails = await supabaseInstance.from("Outlet_Admin").insert({ name: outletAdminId?.name, mobile: outletAdminId?.mobile, email: outletAdminId?.email, address: outletAdminId?.address, pancard: outletAdminId?.pancard }).select().maybeSingle();
      const _outletAdminId = outletDetails.data.outletAdminId;

      let postObject = { 
        outletId,
        outletName,
        restaurantName,
        email,
        mobile,
        GSTIN,
        bankDetailsId: _bankDetailsId,
        outletAdminId: _outletAdminId,
        campusId,
        address,
        cityId,
        isPrimaryOutlet,
        primaryOutletId,
        isGSTShow
      }
      if (openTime) {
        postObject.openTime = openTime;
      }
      if (closeTime) {
        postObject.closeTime = closeTime;
      }

      if (!isPrimaryOutlet) {
       postObject.primaryOutletId = primaryOutletId;
      } else {
        postObject.primaryOutletId = null;
      }
      const inserRestaurentNewkDetails = await supabaseInstance.from("Outlet").insert(postObject).select("*").maybeSingle();

      const taxPostBody = [
        {outletId, taxname: "CGST"},
        {outletId, taxname: "SGST"}
      ]
      const taxResponse = await supabaseInstance.from("Tax").insert(taxPostBody).select();

      for (let outletItem of Restaurant_category) {
        const outletCategoryResponse = await supabaseInstance
          .from("Restaurant_category")
          .insert({ outletId, categoryId: outletItem })
          .select("*")
          .maybeSingle();
      }

      for (let data of Timing) {
        const outletTimeResponse = await supabaseInstance
          .from("Timing")
          .insert({ outletId, dayId: data.dayId, openTime: data.openTime, closeTime: data.closeTime })
          .select("*")
          .maybeSingle();
      }

      if (inserRestaurentNewkDetails.data) {
        res.send({
          success: true,
          message: "Outlet created successfully",
          data: inserRestaurentNewkDetails.data,

        });
      } else {
        throw inserRestaurentNewkDetails.error
      }
    } else {
      throw error;
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: error.message });
  }
})

router.post("/upsertFssaiLicensePhoto",upload.single('file'), async (req, res) => {
  const { outletId } = req.body;
  console.log("outletId--->",outletId)
  try {
    const { data, error } = await supabaseInstance
      .storage
      .from('fssai-license')
      .upload(outletId + ".webp", req.file.buffer, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/webp'
      })

    if (data?.path) {
      const publickUrlresponse = await supabaseInstance.storage.from('fssai-license').getPublicUrl(data?.path);
      if (publickUrlresponse?.data?.publicUrl) {
        const publicUrl = publickUrlresponse?.data?.publicUrl;
        const outletData = await supabaseInstance.from("Outlet").update({ FSSAI_License:`${publicUrl}?${new Date().getTime()}`}).eq("outletId", outletId).select("*, bankDetailsId(*), outletAdminId(*), Tax!left(*),Timing!left(*),Restaurant_category!left(*)").maybeSingle();
        res.status(200).json({
          success: true,
          data: outletData.data,
        });
      } else {
        throw publickUrlresponse.error || "Getting Error in PublicUrl"
      }
    } else {
      throw error
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  }
})

router.get("/getOutletList", async (req, res) => {
  const { page, perPage, searchText } = req.query;
  const pageNumber = parseInt(page) || 1;
  const itemsPerPage = parseInt(perPage) || 10;
  try {

    if(searchText){
      const { data, error, count } = await supabaseInstance
      .from("Outlet")
      .select("*, restaurantId(*), campusId(*),outletAdminId(*), bankDetailsId (*),cityId(*)), Tax!left(taxid, taxname, tax)", { count: "exact" })
      // .ilike(`outletName,${searchText}`)
      // .or(`address.ilike.${searchText},outletName.ilike.${searchText}`)
      .or(`address.ilike.%${searchText}%,outletName.ilike.%${searchText}%`)
      .range((pageNumber - 1) * itemsPerPage, pageNumber * itemsPerPage - 1)
      .order("outletName", { ascending: true });
      if (data) {
        const totalPages = Math.ceil(count / itemsPerPage);
        res.status(200).json({
          success: true,
          data,
          meta: {
            page: pageNumber,
            perPage: itemsPerPage,
            totalPages,
            totalCount: count,
          },
        });
      }else{
        throw error
      }
    }else{
      const { data, error, count } = await supabaseInstance
      .from("Outlet")
      .select("*, restaurantId(*), campusId(*),outletAdminId(*), bankDetailsId (*),cityId(*)), Tax!left(taxid, taxname, tax)", { count: "exact" })
      .range((pageNumber - 1) * itemsPerPage, pageNumber * itemsPerPage - 1)
      .order("outletName", { ascending: true });
      if (data) {
        const totalPages = Math.ceil(count / itemsPerPage);
        res.status(200).json({
          success: true,
          data,
          meta: {
            page: pageNumber,
            perPage: itemsPerPage,
            totalPages,
            totalCount: count,
          },
        });
      }else{
        throw error
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/getOutletListByRestaurantId/:outletId", async (req, res) => {
  const { outletId } = req.params;
  const { page, perPage, searchText } = req.query;
  const pageNumber = parseInt(page) || 1;
  const itemsPerPage = parseInt(perPage) || 10;
  try {
    let query = supabaseInstance
      .from("Outlet")
      .select("*, restaurantId(*), campusId(*),outletAdminId(*), bankDetailsId (*),cityId(*)), Tax!left(taxid, taxname, tax)", { count: "exact" })
      .range((pageNumber - 1) * itemsPerPage, pageNumber * itemsPerPage - 1)
      .order("outletName", { ascending: true })
      .eq("outletId", outletId)
      if(searchText) {
        query = query.or(`address.ilike.%${searchText}%,outletName.ilike.%${searchText}%`);
        // query = query.ilike('outletName', `%${searchText}%`);
      }
      const { data, error, count } = await query;

    if (data) {
      const totalPages = Math.ceil(count / itemsPerPage);
      res.status(200).json({
        success: true,
        data,
        meta: {
          page: pageNumber,
          perPage: itemsPerPage,
          totalPages,
          totalCount: count,
        },
      });
    } else {
      throw error
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/updateOutlet/:outletId", async (req, res) => {

  const { outletId } = req.params;
  const outletData = req.body;
  const bankDetailsData= outletData.bankDetailsId;
  const outletDetailsData = outletData.outletAdminId;
  const timeDetailsData = outletData.Timing;
  const categoryDetailsData = outletData.Restaurant_category;
  delete outletDetailsData?.email;
  delete  outletData?.bankDetailsId;
  delete  outletData?.outletAdminId;
  delete  outletData?.Restaurant_category;
  delete  outletData?.Timing;
  delete  outletData?.isBoth;
  delete  outletData?.isBothFood;
  delete  outletData?.password;
 
   try {
    const bankDetails = await supabaseInstance.from("BankDetails").update({...bankDetailsData }).eq("bankDetailsId",bankDetailsData.bankDetailsId).select("*");
    
    if (categoryDetailsData?.length > 0) {
      const categoryDataDelete =await  supabaseInstance.from("Restaurant_category").delete().eq("outletId",outletId);
    }
    for(let category of categoryDetailsData ) {
      const categoryData = await supabaseInstance.from("Restaurant_category").insert({categoryId:category,outletId}).select("*");
    }

    if (timeDetailsData?.length > 0) {
      const timingDataDelete = await supabaseInstance.from("Timing").delete().eq("outletId",outletId);
    }
    for(let data of timeDetailsData){
    const timingData = await supabaseInstance.from("Timing").insert({outletId, dayId: data.dayId, openTime: data.openTime, closeTime: data.closeTime }).select("*");
    }
    
    const outletAdminDetails = await supabaseInstance.from("Outlet_Admin").update({...outletDetailsData }).eq("outletAdminId",outletDetailsData.outletAdminId).select("*");

    const { data, error } = await supabaseInstance
     .from("Outlet")
     .update( {...outletData})
     .eq("outletId",outletId)
     .select("*,bankDetailsId(*),outletAdminId(*),Timing!left(*),Restaurant_category!left(categoryId)");
  
     if (data) {
      console.log
         res.status(200).json({
           success: true,
           message: "Data updated succesfully",
           data:data
         });
     } else {
       throw error;
     }
   } catch (error) {
     res.status(500).json({ success: false, error: error });
   }
 })

router.post("/updatePackagingCharge/:outletId", async (req, res) => {
  const { outletId } = req.params;
  const {packaging_charge}  = req.body;

  try {
    const { data, error } = await supabaseInstance
      .from("Outlet")
      .update({packaging_charge})
      .eq("outletId",outletId)
      .select("*");

    if (data) {
      console.log("data-->",data)
      res.status(200).json({
        success: true,
        data: data,
      });
    } else {
      throw error
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/updateTaxCharge", async (req, res) => {

  const { tax } = req.body;
  try {
    for (let data of tax) {
      taxData = await supabaseInstance
        .from("Tax")
        .update({ tax: data.tax })
        .select("*")
        .eq("taxid", data.taxid)
    }
    if (taxData) {
      res.status(200).json({
        success: true,
        message: "Data updated succesfully",
      });
    } else {
      throw error;
    }
   
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/updatePetPooja/:outletId", async (req, res) => {
  const { outletId } = req.params;
  const {petPoojaAppKey,petPoojaAppSecret,petPoojaApAccessToken,petPoojaRestId } = req.body;
  
  try {
    const {data, error} = await supabaseInstance
        .from("Outlet")
        .update({ petPoojaAppKey,petPoojaAppSecret,petPoojaApAccessToken,petPoojaRestId })
        .select("*")
        .eq("outletId",outletId)

    if (data) {
      res.status(200).json({
        success: true,
        message: "Data updated succesfully",
        data:data
      });
    } else {
      throw error;
    }
   
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/upsertLogoImage",upload.single('file'), async (req, res) => {
  const { outletId } = req.body;
  try {
    const { data, error } = await supabaseInstance
      .storage
      .from('logo-images')
      .upload(outletId + ".webp", req.file.buffer, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/webp'
      })

    if (data?.path) {
      const publickUrlresponse = await supabaseInstance.storage.from('logo-images').getPublicUrl(data?.path);
      if (publickUrlresponse?.data?.publicUrl) {
        const publicUrl = publickUrlresponse?.data?.publicUrl;
        const outletData = await supabaseInstance.from("Outlet").update({ logo:`${publicUrl}?${new Date().getTime()}`}).eq("outletId", outletId).select("*, bankDetailsId(*), outletAdminId(*), Tax!left(*),Timing!left(*),Restaurant_category!left(*)").maybeSingle();
        res.status(200).json({
          success: true,
          data: outletData.data,
        });
      } else {
        throw publickUrlresponse.error || "Getting Error in PublicUrl"
      }
    } else {
      throw error
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  }
})

router.post("/upsertHeaderImage",upload.single('file'), async (req, res) => {
  const { outletId } = req.body;
  try {
    const { data, error } = await supabaseInstance
      .storage
      .from('header-images')
      .upload(outletId + ".webp", req.file.buffer, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/webp'
      })

    if (data?.path) {
      const publickUrlresponse = await supabaseInstance.storage.from('header-images').getPublicUrl(data?.path);
      if (publickUrlresponse?.data?.publicUrl) {
        const publicUrl = publickUrlresponse?.data?.publicUrl;
        const outletData = await supabaseInstance.from("Outlet").update({ headerImage:`${publicUrl}?${new Date().getTime()}`}).eq("outletId", outletId).select("*, bankDetailsId(*), outletAdminId(*), Tax!left(*),Timing!left(*),Restaurant_category!left(*)").maybeSingle();
        res.status(200).json({
          success: true,
          data: outletData.data,
        });
      } else {
        throw publickUrlresponse.error || "Getting Error in PublicUrl"
      }
    } else {
      throw error
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  }
})

module.exports = router;