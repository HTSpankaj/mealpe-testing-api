var express = require("express");
const { saveOrderToPetpooja } = require("../petpooja/pushMenu");
var router = express.Router();
var supabaseInstance = require("../../services/supabaseClient").supabase;


router.post("/createOrder", async (req, res) => {
  const { customerAuthUID, outletId, restaurantId, isDineIn, isPickUp, totalPrice, paymentId, items, pickupTime } = req.body;
  try {
    const { data, error } = await supabaseInstance
      .from("Order")
      .insert({ customerAuthUID, outletId, restaurantId, isDineIn, isPickUp, totalPrice, paymentId })
      .select("*")

    if (data) {
      const orderId = data[0].orderId;
      let orderData = [];
      for (let data of items) {
        let calculatedPrice = data.qty * data.price;
        let orderitemData = await supabaseInstance
          .from("Order_Item")
          .insert({ orderId: orderId, itemId: data.id, quantity: data.qty, itemPrice: data.price, calculatedPrice: calculatedPrice })
          .select("*")
        orderData.push(orderitemData.data)
      }
      const orderScheduleData = await supabaseInstance
        .from("Order_Schedule")
        .insert({ orderId: orderId, scheduleDate: pickupTime.orderDate, scheduleTime: pickupTime.time })
        .select("*")


        saveOrderToPetpooja(restaurantId,customerAuthUID,orderId,outletId).then((saveOrderToPetpoojaResponse) => {
          console.log('.then block ran: ', saveOrderToPetpoojaResponse.data);
          res.status(200).json({
            success: true,
            data: {
              data: data,
              orderitemData: orderData,
              pickupTime: orderScheduleData.data,
              saveOrderToPetpooja:saveOrderToPetpoojaResponse.data
            }
          });
        }).catch(err => {
          console.log('.catch block ran: ',err);
          throw err;
        });

    } else {
      throw error;
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: error });
  }
  });

  router.get("/getOrder", async (req, res) => {
    const { restaurantId, outletId, orderStatusId } = req.query;
    try {
      let orderQuery, error;

        orderQuery = supabaseInstance.from("Order").select("*,Order_Item(*),Order_Schedule(*), orderStatusId(*),customerAuthUID(*)").eq("outletId", outletId)

      // if (outletId && restaurantId) {
      //   orderQuery = supabaseInstance.from("Order").select("*,Order_Item(*),Order_Schedule(*), orderStatusId(*),customerAuthUID(*)").eq("outletId", outletId).eq("restaurantId", restaurantId);
      // } else if (restaurantId && !outletId) {
      //   orderQuery = supabaseInstance.from("Order").select("*,Order_Item(*),Order_Schedule(*), orderStatusId(*),customerAuthUID(*)").eq("restaurantId", restaurantId);
      // }
      if (orderStatusId) {
        orderQuery = orderQuery.eq("orderStatusId", orderStatusId);
      }

      const orderData = await orderQuery;

      if (orderData) {
      
        res.status(200).json({
          success: true,
          data: orderData.data,
        });
      } else {
        throw error
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ success: false, error: error });
    }
    });
module.exports = router;