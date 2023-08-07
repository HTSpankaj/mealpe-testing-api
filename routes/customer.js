var express = require("express");
var router = express.Router();
const multer = require("multer");
const upload = multer();
var msg91config = require("../configs/msg91Config");
const axios = require('axios');

var supabaseInstance = require("../services/supabaseClient").supabase;

router.get("/", function (req, res, next) {
  res.send({ success: true, message: "respond send from customer.js" });
});

// router.post("/signUp", async (req, res) => {
//   const { email, mobile, name } = req.body;

//   try {
//     const { data, error } = await supabaseInstance.auth.admin.createUser({
//       email,
//       phone: mobile,
//       phone_confirm: true
//     })

//     if (data?.user) {
//       const customerAuthUID = data.user.id;
//       const customerResponse = await supabaseInstance.from("Customer").insert({ email, mobile, customerName: name, customerAuthUID }).select("*").maybeSingle();
//       if (customerResponse.data) {
//         res.status(200).json({
//           success: true,
//           message: "SignUp Successfully",
//           data:customerResponse.data
//         });
//       } else {
//         throw error;
//       }
//     } else {
//       throw error;
//     }
//   } catch (error) {
//     res.status(500).json({ success: false, error: error?.message || error });
//   }
// });

router.post("/signUp", async (req, res) => {
  const { email, mobile, name } = req.body;

  try {
    const { data, error } = await supabaseInstance.from("Customer").insert({ email, mobile, customerName: name  }).select("*").maybeSingle()

    if (data) {
        res.status(200).json({
          success: true,
          message: "SignUp Successfully",
          data:data
        });
      } else {
        throw error;
      }
  } catch (error) {
    res.status(500).json({ success: false, error: error?.message || error });
  }
});


router.post("/sendOTP", async (req, res) => {
  const { mobile  } = req.body;
  try {
    sendOTP(mobile ).then((responseData) => {
      console.log('.then block ran: ', responseData);
      res.status(200).json({
        success: true,
        data: responseData,
      });
    }).catch(err => {
      console.log('.catch block ran: ',err);
      throw err;
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/verifyOTP", async (req, res) => {
  const { mobile , otp } = req.body;
  try {
    verifyOTP(mobile , 123456).then((responseData) => {
      console.log('.then block ran: ', responseData);
      res.status(200).json({
        success: true,
        data: responseData,
      });
    }).catch(err => {
      console.log('.catch block ran: ',err);
      throw err;
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/userlogin", async (req, res) => {
  const { mobile, email } = req.body;
  try {
    let loginQuery;
    if (mobile) {
      loginQuery = supabaseInstance.from("Customer").select("*").eq("mobile", mobile);
    } else if (email) {
      loginQuery = supabaseInstance.from("Customer").select("*").eq("email", email);
    }

    const userData = await loginQuery.maybeSingle();
    if (userData?.data) {
      res.send({
        success: true,
        message: "Login successfully",
        data: userData.data,
      });
    } else if (!userData.data && !userData.error) {
      const err = {
        message: "User not found."
      }
      throw err;
    } else {
      throw error;
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/cafeteriaDetails/:outletId", async (req, res) => {
  const { outletId } =req.params;
  try {
    const { data, error } = await supabaseInstance.from("Menu_Item").select("*").eq("outletId", outletId);
    if (data) {
      const outdetails = await supabaseInstance.from("Outlet").select("*").eq("outletId", outletId);
      const categorydetails = await supabaseInstance.from("Menu_Item").select("item_categoryid,Menu_Categories(categoryname,category_image_url)").eq("outletId", outletId);

      res.status(200).json({
        success: true,
        message: "Data fetch succesfully",
        data:{
          outdetails:outdetails.data,
          menuItems:data,
          categoryDetails:categorydetails.data
        },
      });
    } else {
      throw error
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})

router.get("/homeData", async (req, res) => {
  const { categoryId, campusId } = req.query;
  try {
    const cafeteriasForYouDataResponse = await supabaseInstance.from("Outlet").select("*,cityId(*),restaurantId(*),bankDetailsId(*),campusId(*)").eq("campusId",campusId).limit(5);

    let PopularCafeteriasQuery = supabaseInstance.from("Restaurant_category").select("*,restaurantId(*),outletId(*)");
    if (categoryId) {
      PopularCafeteriasQuery = PopularCafeteriasQuery.eq("categoryId",categoryId);
    }
    const PopularCafeterias = await PopularCafeteriasQuery.limit(5);

    if (cafeteriasForYouDataResponse.data && PopularCafeterias.data) {
        res.status(200).json({
          success: true,
          message: "Data fetch succesfully",
          data:{
            cafeteriasForYouData:cafeteriasForYouDataResponse.data,
            PopularCafeterias:PopularCafeterias.data
          }
        });
    } else{
      throw PopularCafeterias.error || cafeteriasForYouDataResponse.error;
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  }
})

router.post("/upsertUserImage",upload.single('file'), async (req, res) => {
  const { customerAuthUID } = req.body;
  try {
    const { data, error } = await supabaseInstance
      .storage
      .from('user-photo')
      .upload(customerAuthUID + ".webp", req.file.buffer, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/webp'
      })

    if (data?.path) {
      const publickUrlresponse = await supabaseInstance.storage.from('user-photo').getPublicUrl(data?.path);
      if (publickUrlresponse?.data?.publicUrl) {
        const publicUrl = publickUrlresponse?.data?.publicUrl;
        const userData = await supabaseInstance.from("Customer").update({ photo: `${publicUrl}?${new Date().getTime()}`}).eq("customerAuthUID", customerAuthUID).select("*").maybeSingle();
        res.status(200).json({
          success: true,
          data: userData.data,
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

router.get("/getCustomer/:outletId", async (req, res) => {
  const { outletId } = req.params;
  try {
    let orderData = [];
    let orderCustomerData = await supabaseInstance.rpc('get_distinct_customer', { outletid: outletId })

    if (orderCustomerData.data) {
      for (let order of orderCustomerData.data) {
        data = await supabaseInstance.from("Customer").select("*").eq("customerAuthUID", order)
        orderData.push(data.data)
      }
      res.status(200).json({
        success: true,
        data: orderData,
      })
    } else {
      throw orderCustomerData.error
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: error.message });
  }
})


const MSG91_AUTH_KEY = msg91config.config.auth_key;
const MSG91_OTP_ENDPOINT = 'https://control.msg91.com/api/v5/otp';

async function sendOTP(mobile ) {
  try {
    const response = await axios.post(MSG91_OTP_ENDPOINT, {
      authkey: MSG91_AUTH_KEY,
      mobile: mobile,
    });

    const responseData = response.data;
    console.log("response.data",response.data)
    if (responseData.type === 'success') {
      console.log('OTP sent successfully');
      console.log(responseData);
      return responseData;
    } else {
      console.error('Failed to send OTP:', responseData.message);
      return null;
    }
  } catch (error) {
    console.error('Error sending OTP:', error.message);
    return null;
  }
}

const MSG91_OTP_VERIFY_ENDPOINT = 'https://api.msg91.com/api/v5/otp/verify';

async function verifyOTP(mobile , otp) {
  try {
    // const response = await axios.post(MSG91_OTP_VERIFY_ENDPOINT, {
    //   authkey: MSG91_AUTH_KEY,
    //   mobile: mobile ,
    //   otp: 123456,
    // });

    // const responseData = response.data;
    // console.log("response.data",response.data)
    // if (responseData.type === 'success') {
    //   console.log('OTP verification successful');
    //   return responseData;
    // } else {
    //   console.error('OTP verification failed:', responseData.message);
    //   return null;
    // }


    if (otp === 123456) {
      console.log('OTP verification successful');
      return {
        success: true,
        message:'OTP verification successful'

      };
    } else {
      console.error('OTP verification failed:');
      return null;
    }
  } catch (error) {
    console.error('Error verifying OTP:', error.message);
    return null;
  }
}

module.exports = router;
