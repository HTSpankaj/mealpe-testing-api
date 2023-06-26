var express = require("express");
var router = express.Router();
var supabaseInstance = require("../services/supabaseClient").supabase;

router.get("/", function (req, res, next) {
  res.send({ status: true, message: "respond send from restaurent.js" });
});

router.get("/getRestaurant", async (req, res) => {
  try {
    const { data, error } = await supabaseInstance
      .from("Restaurant")
      .select(
        "*, bankDetailsId(*), restaurantAdminId(*), Restaurant_category!left(*, categoryId(*))"
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

router.post("/createRestaurant", async function (req, res, next) {
  const {
    email,
    password,
    restaurantName,
    mobile,
    GSTIN,
    FSSAI_License,
    bankDetailsId,
    restaurantAdminId,
    Restaurant_category,
  } = req.body;

  try {
    const authResponse = await supabaseInstance.auth.signUp({
      email,
      password,
    });
    if (authResponse?.data?.user) {
      const restaurentId = authResponse.data.user.id;
      console.log("restaurentId", restaurentId);

      const insertBankDetails = await supabaseInstance
        .from("BankDetails")
        .insert({
          accountNumber: bankDetailsId?.accountNumber,
          BankName: bankDetailsId?.BankName,
          IFSCCode: bankDetailsId?.IFSCCode,
        })
        .select("*")
        .maybeSingle();
      console.log(insertBankDetails.data.bankDetailsId);

      const inserRestaurentAdminkDetails = await supabaseInstance
        .from("Restaurant_Admin")
        .insert({
          email: restaurantAdminId?.email,
          name: restaurantAdminId?.name,
          address: restaurantAdminId?.address,
          mobile: restaurantAdminId?.mobile,
          pancard: restaurantAdminId?.pancard,
        })
        .select("*")
        .maybeSingle();
      console.log(inserRestaurentAdminkDetails.data.restaurantAdminId);

      const inserRestaurentNewkDetails = await supabaseInstance
        .from("Restaurant")
        .insert({
          restaurantId: restaurentId,
          restaurantName,
          email,
          mobile,
          GSTIN,
          FSSAI_License,
          bankDetailsId: insertBankDetails.data.bankDetailsId,
          restaurantAdminId:
            inserRestaurentAdminkDetails.data.restaurantAdminId,
        })
        .select("*")
        .maybeSingle();
      //   console.log(inserRestaurentNewkDetails.data.restaurantAdminId);

      for (let categoryItemId of Restaurant_category) {
        if (restaurentId) {
          const restaurentCategoryResponse = await supabaseInstance
            .from("Restaurant_category")
            .insert({ restaurantId: restaurentId, categoryId: categoryItemId })
            .select("*")
            .maybeSingle();
          console.log(restaurentCategoryResponse);
        }
      }

      if (insertBankDetails) {
        res.send({
          status: true,
          message: "Restaurant created successfully",
          data: insertBankDetails,
          restaurent: inserRestaurentAdminkDetails,
          inserRestaurentNewkDetails: inserRestaurentNewkDetails,
        });
      }
    } else {
      throw authResponse.error;
    }
  } catch (error) {
    console.error(error);

    res.send({ status: false, message: error?.message || error });
  }
});

router.post("/getRestaurantList", async (req, res) => {
  const { page, perPage } = req.body; // Extract query parameters
  const pageNumber = parseInt(page) || 1;
  const itemsPerPage = parseInt(perPage) || 10;

  try {
    const { data, error, count } = await supabaseInstance
      .from("Restaurant")
      .select("*, bankDetailsId(*), campusId(*),restaurantAdminId(*), Restaurant_category!left(*, categoryId(*))", { count: "exact" })
      .range((pageNumber - 1) * itemsPerPage, pageNumber * itemsPerPage - 1)
      .order("restaurantAdminId", { ascending: true });

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

module.exports = router;
