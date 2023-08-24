var express = require("express");
const { saveOrderToPetpooja } = require("../petpooja/pushMenu");
var router = express.Router();
var supabaseInstance = require("../../services/supabaseClient").supabase;


router.post("/createOrder", async (req, res) => {
  const { customerAuthUID, outletId, restaurantId, isDineIn, isPickUp, totalPrice, paymentId, items, pickupTime ,orderPriceBreakDown} = req.body;
  try {
    const { data, error } = await supabaseInstance
      .from("Order")
      .insert({ customerAuthUID, outletId, isDineIn, isPickUp, totalPrice, paymentId,orderPriceBreakDown })
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
 

      saveOrderToPetpooja(restaurantId, customerAuthUID, orderId, outletId).then((saveOrderToPetpoojaResponse) => {
        console.log('.then block ran: ', saveOrderToPetpoojaResponse.data);
        res.status(200).json({
          success: true,
          data: {
            data: data,
            orderitemData: orderData,
            pickupTime: orderScheduleData.data,
            saveOrderToPetpooja: saveOrderToPetpoojaResponse.data
          }
        });
      }).catch(err => {
        console.log('.catch block ran: ', err);
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

router.get("/getOrder/:orderId", async (req, res) => {
  const { orderId } = req.params;
  try {
    const {data,error} = await supabaseInstance.from("Order").select("*,customerAuthUID(*),Order_Item(*,Menu_Item(itemname,item_image_url)),Order_Schedule(*),orderStatusId(*))").eq("orderId", orderId).maybeSingle();
    if (data) {
      res.status(200).json({
        success: true,
        data:data,
      });
    } else {
      throw error
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: error });
  }
});

router.get("/getOrderByCustomerAuthId/:customerAuthUID", async (req, res) => {
  const { customerAuthUID } = req.params;
  try {
    const {data,error} = await supabaseInstance.from("Order").select("*,outletId(outletName,logo),Order_Item(*),Order_Schedule(*),orderStatusId(*))").eq("customerAuthUID", customerAuthUID)
    if (data) {
      res.status(200).json({
        success: true,
        data:data,
      });
    } else {
      throw error
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: error });
  }
});

router.get("/getUpcomingOrder/:outletId", async (req, res) => {
  const { outletId } = req.params;
  const {isDineIn, orderStatusId,orderId} = req.query;
  try {
    let currentDate =new Date().toJSON().slice(0, 10);
    
    let query =  supabaseInstance.from("Order_Schedule").select("*,orderId(*,orderStatusId(*),customerAuthUID(*))").gt("scheduleDate", currentDate).eq("orderId.outletId", outletId);
   
    if (isDineIn) {
      if (isDineIn == 'true') {
        query = query.eq("orderId.isDineIn", true)
      }
      else if (isDineIn == 'false') {
        query = query.eq("orderId.isDineIn", false)
      }
    }

    if (orderStatusId) {
      const _orderStatusId = eval(orderStatusId);
      if (_orderStatusId.length > 0) {
        query = query.in('orderId.orderStatusId',_orderStatusId);
      }
    }
    
    if (orderId) {
      query = query.ilike("orderId.order_id_search", `%${orderId}%`);
    }

    const { data, error, } = await query;

    if (data) {
      res.status(200).json({
        success: true,
        data:data?.filter(f => f.orderId),
      });
    } else {
      throw error
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: error });
  }
});

router.get("/getCurrentOrder/:outletId", async (req, res) => {
  const { outletId } = req.params;
  const {isDineIn, orderStatusId,orderId} = req.query;
  try {
    let currentDate = new Date().toJSON().slice(0, 10);
    let query =  supabaseInstance.from("Order_Schedule").select("*,orderId(*,orderStatusId(*),customerAuthUID(*))").eq("scheduleDate", currentDate).eq("orderId.outletId", outletId);
   
    if (isDineIn) {
      if (isDineIn == 'true') {
        query = query.eq("orderId.isDineIn", true)
      }
      else if (isDineIn == 'false') {
        query = query.eq("orderId.isDineIn", false)
      }
    }

    if (orderStatusId) {
      const _orderStatusId = eval(orderStatusId);
      if (_orderStatusId.length > 0) {
        query = query.in('orderId.orderStatusId',_orderStatusId);
      }
    }
    
    if (orderId) {
      query = query.ilike("orderId.order_id_search", `%${orderId}%`);
    }
   
    const { data, error, } = await query;

    if (data) {
      res.status(200).json({
        success: true,
        data:data?.filter(f => f.orderId)
      });
    } else {
      throw error
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: error });
  }
});

router.get("/getHistoryOrders/:outletId", async (req, res) => {
  const { outletId } = req.params;
  const {isDineIn, orderStatusId,orderId} = req.query;

  try {
    let currentDate =new Date().toJSON().slice(0, 10);
    let query =  supabaseInstance.from("Order_Schedule").select("*,orderId(*,orderStatusId(*),customerAuthUID(*))").lt("scheduleDate", currentDate).eq("orderId.outletId", outletId);

    if (isDineIn) {
      if (isDineIn == 'true') {
        query = query.eq("orderId.isDineIn", true)
      }
      else if (isDineIn == 'false') {
        query = query.eq("orderId.isDineIn", false)
      }
    }

    if (orderStatusId) {
      const _orderStatusId = eval(orderStatusId);
      if (_orderStatusId.length > 0) {
        query = query.in('orderId.orderStatusId',_orderStatusId);
      }
    }
    
    if (orderId) {
      query = query.ilike("orderId.order_id_search", `%${orderId}%`);
    }
    const { data, error, } = await query;
    if (data) {
      res.status(200).json({
        success: true,
        data:data?.filter(f => f.orderId)
      });
    } else {
      throw error
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: error });
  }
});

router.get("/getCancelledOrders/:outletId", async (req, res) => {
  const { outletId } = req.params;
  try {
    const {data,error} = await supabaseInstance.from("Order").select("*,orderStatusId(*),customerAuthUID(*),Order_Schedule(*))").eq("outletId", outletId).in('orderStatusId', ['-1', '-2']);
    if (data) {
      res.status(200).json({
        success: true,
        data:data
      });
    } else {
      throw error
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: error });
  }
});

router.post("/acceptOrder/:orderId", async (req, res) => {
  const { orderId } = req.params;
  try {
    const {data,error} = await supabaseInstance.from("Order").update({orderStatusId:1}).select("*").eq("orderId", orderId)
    if (data) {
      res.status(200).json({
        success: true,
        data:data,
      });
    } else {
      throw error
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: error });
  }
});

router.post("/rejectOrder/:orderId", async (req, res) => {
  const { orderId } = req.params;
  try {
    const {data,error} = await supabaseInstance.from("Order").update({orderStatusId:-2}).select("*").eq("orderId", orderId);
    if (data) {
      res.status(200).json({
        success: true,
        data:data,
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