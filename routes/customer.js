var express = require("express");
var router = express.Router();

var supabaseInstance = require("../services/supabaseClient").supabase;

router.get("/", function (req, res, next) {
  res.send({ status: true, message: "respond send from customer.js" });
});

router.post("/signUp", async (req, res) => {
  const { email, mobile, name } = req.body;

  try {
    const { data, error } = await supabaseInstance.auth.admin.createUser({
      email,
      phone: mobile,
      phone_confirm: true
    })

    if (data?.user) {
      const customerAuthUID = data.user.id;
      const customerResponse = await supabaseInstance.from("Customer").insert({ email, mobile, customerName: name, customerAuthUID }).select("*").maybeSingle();
      if (customerResponse.data) {
        res.status(200).json({
          success: true,
          message: "SignUp Successfully",
        });
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error?.message || error });
  }
});

router.post("/sendOTP", async (req, res) => {
  const { mobile } = req.body;

  try {
    const { data, error } = await supabaseInstance.auth.signInWithOtp({
      // phone: mobile
      phone: "+919130743559"
    })

    if (data) {
      res.status(200).json({
        success: true,
        message: "OTP Send Successfully",
      });
    } else {
      throw error;
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/verifyOTP", async (req, res) => {
  const { otp, phone } = req.body;
  try {
    const { data, error } = await supabaseInstance.auth.verifyOtp({ phone, token: otp, type: 'sms' })
    if (data?.user) {
      const customerAuthUID = data.user.id;
      console.log("customerAuthUID", customerAuthUID)
      const customerResponse = await supabaseInstance.from("Customer").select("*").eq("customerAuthUID", customerAuthUID).maybeSingle();
      console.log("customerResponse", customerResponse)
      if (customerResponse.data) {
        res.status(200).json({
          success: true,
          message: "OTP Verified",
          data: customerResponse.data,
        });
      } else {
        throw customerResponse.error;
      }
    }
    else {
      throw error;
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
