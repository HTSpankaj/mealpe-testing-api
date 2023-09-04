var express = require("express");
const { saveOrderToPetpooja } = require("../petpooja/pushMenu");
const moment = require("moment/moment");
var router = express.Router();
var supabaseInstance = require("../../services/supabaseClient").supabase;


router.post("/createOrder", async (req, res) => {
  const { customerAuthUID, outletId, restaurantId, isDineIn, isPickUp, totalPrice, paymentId, items, pickupTime, orderPriceBreakDown } = req.body;
  try {
    const { data, error } = await supabaseInstance
      .from("Order")
      .insert({ customerAuthUID, outletId, isDineIn, isPickUp, totalPrice, paymentId, orderPriceBreakDown })
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
    const {data,error} = await supabaseInstance.from("Order").select("*,customerAuthUID(*),outletId(outletId,outletName,logo,address),Order_Item(*,Menu_Item(itemname,item_image_url)),Order_Schedule(*),orderStatusId(*))").eq("orderId", orderId).maybeSingle();
    if (data) {
      res.status(200).json({
        success: true,
        data: data,
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
    const { data, error } = await supabaseInstance.from("Order").select("*,outletId(outletName,logo),Order_Item(*),Order_Schedule(*),orderStatusId(*))").eq("customerAuthUID", customerAuthUID).order("created_at",{ascending:false})
    if (data) {
      res.status(200).json({
        success: true,
        data: data,
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
  const { isDineIn, orderStatusId, orderSequenceId } = req.query;
  const now = new Date();
  const formattedTime = moment(now).format('HH:mm:ss');
  console.log("formattedTime=>",formattedTime)
  // const formattedTimeMinus2Hours = moment(formattedTime, 'HH:mm:ss').subtract(2, 'hours').format('HH:mm:ss');
  try {
    let currentDate = new Date().toJSON().slice(0, 10);

    let query = supabaseInstance.from("Order_Schedule").select("*,orderId(*,orderStatusId(*),customerAuthUID(*))")
    .gte("scheduleDate", currentDate)
    .eq("orderId.outletId", outletId)
    .gt("scheduleTime", formattedTime)
    .order("scheduleTime", { ascending: false })

    if (isDineIn) {
      if (isDineIn == 'true') {
        query = query.eq("orderId.isDineIn", true)
      }
      else if (isDineIn == 'false') {
        query = query.eq("orderId.isDineIn", false)
      }
    }

    if (orderStatusId) {
      const _orderStatusId = orderStatusId.split(',');
      if (_orderStatusId.length > 0) {
        query = query.in('orderId.orderStatusId', _orderStatusId);
      }
    }

    if (orderSequenceId) {
      query = query.ilike("orderId.order_id_search", `%${orderSequenceId}%`);
    }

    const { data, error, } = await query;

    if (data) {
      res.status(200).json({
        success: true,
        data: data?.filter(f => f.orderId),
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
  const { isDineIn, orderStatusId, orderSequenceId } = req.query;

  const now = new Date();
  const formattedTime = moment(now).format('HH:mm:ss');console.log(formattedTime)
  const formattedTimeMinus2Hours = moment(formattedTime, 'HH:mm:ss').subtract(2, 'hours').format('HH:mm:ss');console.log(formattedTimeMinus2Hours)
  
  try {
    let currentDate = new Date().toJSON().slice(0, 10);

    // let query =  supabaseInstance.from("Order_Schedule").select("*,orderId(*,orderStatusId(*),customerAuthUID(*))").eq("scheduleDate", currentDate).eq("orderId.outletId", outletId);

    let query = supabaseInstance.from("Order_Schedule").select("*,orderId(*,orderStatusId(*),customerAuthUID(*))")
      .eq("scheduleDate", currentDate)
      .eq("orderId.outletId", outletId)
      .lt("scheduleTime", formattedTime)
      .gt("scheduleTime", formattedTimeMinus2Hours)
      .order("scheduleTime", { ascending: false })

    if (isDineIn) {
      if (isDineIn == 'true') {
        query = query.eq("orderId.isDineIn", true)
      }
      else if (isDineIn == 'false') {
        query = query.eq("orderId.isDineIn", false)
      }
    }

    if (orderStatusId) {
      const _orderStatusId = orderStatusId.split(',');
      if (_orderStatusId.length > 0) {
        query = query.in('orderId.orderStatusId', _orderStatusId);
      }
    }

    if (orderSequenceId) {
      query = query.ilike("orderId.order_id_search", `%${orderSequenceId}%`);
    }

    const { data, error, } = await query;

    if (data) {
      res.status(200).json({
        success: true,
        data: data?.filter(f => f.orderId)
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
  const { isDineIn, orderStatusId, orderSequenceId, startDate, endDate } = req.query;

  try {
    let currentDate = new Date().toJSON().slice(0, 10);
    let query = supabaseInstance.from("Order_Schedule").select("*,orderId(*,orderStatusId(*),customerAuthUID(*))").lte("scheduleDate", currentDate).eq("orderId.outletId", outletId);

    if (isDineIn) {
      if (isDineIn == 'true') {
        query = query.eq("orderId.isDineIn", true)
      }
      else if (isDineIn == 'false') {
        query = query.eq("orderId.isDineIn", false)
      }
    }

    if (orderStatusId) {
      const _orderStatusId = orderStatusId.split(',');
      if (_orderStatusId.length > 0) {
        query = query.in('orderId.orderStatusId', _orderStatusId);
      }
    }

    if (orderSequenceId) {
      query = query.ilike("orderId.order_id_search", `%${orderSequenceId}%`);
    }

    if (startDate && endDate ) {
      query = query.gte("scheduleDate",startDate).lte("scheduleDate",endDate);
    }
    const { data, error, } = await query;
    if (data) {
      res.status(200).json({
        success: true,
        data: data?.filter(f => f.orderId)
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
  const { page, perPage } = req.query; // Extract query parameters
  const pageNumber = parseInt(page) || 1;
  const itemsPerPage = parseInt(perPage) || 10;
  try {
    const { data, error,count } = await supabaseInstance
    .from("Order")
    .select("*,orderStatusId(*),customerAuthUID(*),Order_Schedule(*))",{ count: "exact" })
    .eq("outletId", outletId)
    .in('orderStatusId', ['-1', '-2'])
    .range((pageNumber - 1) * itemsPerPage, pageNumber * itemsPerPage - 1)

    if (data) {
      const totalPages = Math.ceil(count / itemsPerPage);
      res.status(200).json({
        success: true,
        data: data,
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
    console.log(error)
    res.status(500).json({ success: false, error: error });
  }
});

router.post("/acceptOrder/:orderId", async (req, res) => {
  const { orderId } = req.params;
  try {
    const { data, error } = await supabaseInstance.from("Order").update({ orderStatusId: 1 }).select("*").eq("orderId", orderId)
    if (data) {
      res.status(200).json({
        success: true,
        data: data,
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
    const { data, error } = await supabaseInstance.from("Order").update({ orderStatusId: -2 }).select("*").eq("orderId", orderId);
    if (data) {
      res.status(200).json({
        success: true,
        data: data,
      });
    } else {
      throw error
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: error });
  }
});

router.post("/dashboardData", async (req, res) => {
  const { target_date, outlet_id, analyticalType} = req.body;
  try {
    const { data, error } = await supabaseInstance.rpc('get_dashboard_count', { target_date, outlet_id,analyticaltype:analyticalType });

    if (data) {
      res.status(200).json({
        success: true,
        data: data,
      });
    } else {
      throw error
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  }
});

router.post("/orderPrice", async (req, res) => {
  const { outlet_id,target_date,analyticalType } = req.body;
  try {
    const { data, error } = await supabaseInstance.rpc('get_total_price', { outlet_id,target_date,analyticaltype: analyticalType});

    if (data) {
      res.status(200).json({
        success: true,
        data: data,
      });
    } else {
      throw error
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: error });
  }
});

router.post("/dineInPickUp", async (req, res) => {
  const { outlet_id,target_date,analyticalType } = req.body;
  try {
    const { data, error } = await supabaseInstance.rpc('get_customer_order_count', { target_date,outlet_id,analyticaltype: analyticalType});

    if (data) {
      res.status(200).json({
        success: true,
        data: data,
      });
    } else {
      throw error
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  }
});

router.post("/totalRevenue", async (req, res) => {
  const { outlet_id,target_date,analyticalType } = req.body;
  try {
    const { data, error } = await supabaseInstance.rpc('get_total_revenue_count', { target_date,outlet_id,analyticaltype: analyticalType});

    if (data) {
      res.status(200).json({
        success: true,
        data: data,
      });
    } else {
      throw error
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  }
});

module.exports = router;