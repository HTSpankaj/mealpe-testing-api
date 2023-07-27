var express = require("express");
var router = express.Router();
var supabaseInstance = require("../../services/supabaseClient").supabase;


router.post("/createOrder", async (req, res) => {
    const { customerAuthUID,outletId,restaurantId, isDineIn, isPickUp,totalPrice,paymentId,orderStatusId } = req.body;
    try {
      const { data, error } = await supabaseInstance
        .from("Order")
        .insert({customerAuthUID,outletId, restaurantId,isDineIn , isPickUp,totalPrice,paymentId,orderStatusId })
        .select("*")
        console.log(data)
  
      if (data) {
        res.status(200).json({
          success: true,
          data: data,
        });
      } else {
        throw error;
      }
    } catch (error) {
        console.error(error)
      res.status(500).json({ success: false, error: error });
    }
  });

  router.post("/orderitem", async (req, res) => {
    const {orderId  } = req.body;
    try {
      const { data, error } = await supabaseInstance
        .from("Order")
        .insert({ })
        .select("*")
        console.log(data)
  
      if (data) {
        res.status(200).json({
          success: true,
          data: data,
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