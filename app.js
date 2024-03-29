var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
var logger = require('morgan');
const cors = require("cors");

var indexRouter = require("./routes/index");
var adminRouter = require("./routes/admin");
var campusRouter = require("./routes/campus");
var cityRouter = require("./routes/citys");
var daysRouter = require("./routes/day");
var categoryRouter = require("./routes/category");
var restaurentRouter = require("./routes/restaurent");
var customerRouter = require("./routes/customer")
var resturantRouter = require("./routes/restaurent")
var outletRouter = require("./routes/outlet/outlet")
var menuRouter = require("./routes/outlet/menu")
var offerRouter = require("./routes/outlet/offer")
var staffRouter = require("./routes/staff/staff")
var roleRouter = require("./routes/staff/role")
var commonRouter = require("./routes/common")
var petpoojaRouter = require("./routes/petpooja/index");
var orderRouter = require("./routes/order/order");
var favoriteRouter = require("./routes/favorite/favorite");
var ratingRouter = require("./routes/rating/rating");
var messageRouter = require("./routes/message");
var paymentRouter = require("./routes/Payment/index");
var serverRouter = require("./routes/server");
var surepassRouter = require("./routes/surepass");
var contactTicketRouter = require("./routes/contactUs/contactTicket");
var settlementRouter = require("./routes/settlement/adminSettlement");
var restaurentSettlementRouter = require("./routes/settlement/restaurentSettlement");
var scheduleRouter = require("./routes/scheduler/index");


var app = express();

// Increase the request size limit
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/campus', campusRouter);
app.use('/city', cityRouter);
app.use('/customer', customerRouter);
app.use('/restaurent', resturantRouter);
app.use('/outlet', outletRouter);
app.use("/days", daysRouter);
app.use("/category", categoryRouter);
app.use('/outlet/menu', menuRouter);
app.use('/outlet/offer', offerRouter);
app.use('/staff/staff', staffRouter);
app.use('/staff/role', roleRouter);
app.use('/common', commonRouter);
app.use('/petpooja', petpoojaRouter);
app.use('/order/order', orderRouter);
app.use('/favorite/favorite', favoriteRouter);
app.use('/rating/rating', ratingRouter);
app.use('/message', messageRouter);
app.use('/payment', paymentRouter);
app.use('/server', serverRouter);
app.use('/surepass', surepassRouter);
app.use('/contactTicket', contactTicketRouter);
app.use('/settlement/adminSettlement', settlementRouter);
app.use('/settlement/restaurentSettlement', restaurentSettlementRouter);
app.use('/schedule', scheduleRouter);




// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
