var express = require("express");
var router = express.Router();
var supabaseInstance = require("../services/supabaseClient").supabase;
const multer = require("multer");
const upload = multer();

router.get("/", function (req, res, next) {
  res.send({ status: true, message: "respond send from restaurent.js" });
});

router.get("/getRestaurant", async (req, res) => {
  try {
    const { data, error } = await supabaseInstance
      .from("Restaurant")
      .select(
        "*, bankDetailsId(*), restaurantAdminId(*), Restaurant_category!left(*, categoryId(*)), Tax!left(taxid, taxname, tax)"
      );
    console.log(data);
    console.log(error);
    if (data) {
      res.status(200).json({
        success: true,
        message: "Data fetch succesfully",
        data: data,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/getRestaurantList", async (req, res) => {
  const { page, perPage, searchText} = req.query; // Extract query parameters
  const pageNumber = parseInt(page) || 1;
  const itemsPerPage = parseInt(perPage) || 10;

  try {
    let query =  supabaseInstance
      .from("Restaurant")
      .select("*, bankDetailsId(*), campusId(*),restaurantAdminId(*), Restaurant_category!left(*, categoryId(*)), Timing!left(*), Tax!left(taxid, taxname, tax)", { count: "exact" })
      .range((pageNumber - 1) * itemsPerPage, pageNumber * itemsPerPage - 1)
      .order("restaurantAdminId", { ascending: true });
      if(searchText) {
        query = query.or(`address.ilike.%${searchText}%,restaurantName.ilike.%${searchText}%`);
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
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/createRestaurant", async (req, res) => {
  const {
    email,
    password,
    bankDetailsId,
    restaurantAdminId,
    restaurantName,
    mobile,
    GSTIN,
    FSSAI_License,
    campusId,
    address,
    isVeg,
    isNonVeg,
    openTime,
    closeTime,
    Restaurant_category,
    Timing
  } = req.body;
  try {
    const { data, error } = await supabaseInstance.auth.signUp(
      {
        email: email,
        password: password,
        options: {
          data: {
            isRestaurant: true,
            isOutlet: false,
          }
        }
      })
    if (data?.user) {
      const restaurantId = data.user.id;

      const bankDetails = await supabaseInstance.from("BankDetails").insert({ accountNumber: bankDetailsId.accountNumber || 0, BankName: bankDetailsId.BankName, IFSCCode: bankDetailsId.IFSCCode }).select().maybeSingle();
      const _bankDetailsId = bankDetails.data.bankDetailsId;

      const restaurantAdminDetails = await supabaseInstance.from("Restaurant_Admin").insert({ name: restaurantAdminId?.name, mobile: restaurantAdminId?.mobile || null, email: restaurantAdminId?.email, address: restaurantAdminId?.address, pancard: restaurantAdminId?.pancard }).select().maybeSingle();
      const _restaurantAdminId = restaurantAdminDetails.data.restaurantAdminId;

      let objectData = { 
        restaurantId,
        restaurantName, 
        email,
        mobile, 
        GSTIN, 
        FSSAI_License, 
        bankDetailsId: _bankDetailsId, 
        restaurantAdminId: _restaurantAdminId, 
        campusId, 
        address, 
        isVeg, 
        isNonVeg, 
        openTime, 
        closeTime 
      }
      
      if (openTime) {
        objectData.openTime = openTime;
      }
      if (closeTime) {
        objectData.closeTime = closeTime;
      }
      const inserRestaurentNewkDetails = await supabaseInstance.from("Restaurant").insert(objectData).select("*").maybeSingle();
      
      const taxPostBody = [
        {restaurantId, taxname: "CGST"},
        {restaurantId, taxname: "SGST"}
      ]
      const taxResponse = await supabaseInstance.from("Tax").insert(taxPostBody).select();

      for (let categoryItem of Restaurant_category) {
        const restaurentCategoryResponse = await supabaseInstance
          .from("Restaurant_category")
          .insert({ restaurantId, categoryId: categoryItem })
          .select("*")
          .maybeSingle();
        console.log("restaurentCategoryResponse", restaurentCategoryResponse);
      }

      for (let data of Timing) {
        const restaurentTimeResponse = await supabaseInstance
          .from("Timing")
          .insert({ restaurantId, dayId: data.dayId, openTime: data.openTime || null, closeTime: data.closeTime || null })
          .select("*")
          .maybeSingle();
        console.log("restaurentTimeResponse", restaurentTimeResponse);
      }

      if (inserRestaurentNewkDetails.data) {
        res.send({
          status: true,
          message: "Restaurant created successfully",
          data: inserRestaurentNewkDetails.data,

        });
      } else {
        throw inserRestaurentNewkDetails.error
      }
    } else {
      throw error;
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})

router.post("/upsertFssaiLicensePhoto",upload.single('file'), async (req, res) => {
  const { restaurantId } = req.body;
  try {
    const { data, error } = await supabaseInstance
      .storage
      .from('fssai-license')
      .upload(restaurantId + ".webp", req.file.buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/webp'
      })

    if (data?.path) {
      const publickUrlresponse = await supabaseInstance.storage.from('fssai-license').getPublicUrl(data?.path);
      if (publickUrlresponse?.data?.publicUrl) {
        const publicUrl = publickUrlresponse?.data?.publicUrl;
        const restaurantData = await supabaseInstance.from("Restaurant").update({ FSSAI_License: publicUrl }).eq("restaurantId", restaurantId).select("*, bankDetailsId(*), campusId(*),restaurantAdminId(*), Restaurant_category!left(*, categoryId(*)), Tax!left(taxid, taxname, tax)").maybeSingle();
        res.status(200).json({
          success: true,
          data: restaurantData.data,
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

router.post("/restaurantLogin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabaseInstance.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (data?.user) {
      const id = data.user.id
      console.log("id", id)
      console.log("ata?.user?.user_metadata----->",data?.user?.user_metadata)
      if (data?.user?.user_metadata?.isRestaurant === true) {
        const restaurantData = await supabaseInstance.from("Restaurant").select("*, Tax!left(taxid, taxname, tax)").eq("restaurantId", id).maybeSingle();

        res.status(200).json({
          success: true,
          message: "LogIn successfully",
          data: {
            outletData: restaurantData.data
          }
        });

      } else if (data?.user?.user_metadata?.isOutlet === true) {
        const outletData = await supabaseInstance.from("Outlet").select("*").eq("outletId", id).maybeSingle();
        res.status(200).json({
          success: true,
          message: "LogIn successfully",
          data: {
            outletData: outletData.data
          }
        });
      } else if(data?.user?.user_metadata?.isOutletStaff === true) {
        const outletStaffData = await supabaseInstance.from("Outlet_Staff").select("*").eq("outletStaffAuthUId", id).maybeSingle();
        const outletData = await supabaseInstance.from("Outlet").select("*").eq("outletId", outletStaffData.data.outletId).maybeSingle();
        res.status(200).json({
          success: true,
          message: "LogIn successfully",
          data: {
            outletData: outletData.data, 
            outletStaffData: outletStaffData 
          }
        });
      }
    }
    else {
      throw error;
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})

module.exports = router;
