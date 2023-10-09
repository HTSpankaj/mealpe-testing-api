var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});




router.get("/getTitle", function (req, res) {
  res.send({data: "Title from server = " + new Date().toLocaleString()});
})

router.get("/realtimeDemo", function (req, res) {

  res.statusCode = 200;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("connection", "keep-alive");
  res.setHeader("Content-Type", "text/event-stream");

  setInterval(() => {
    res.write(`data: ${JSON.stringify({ updateorder: 'Hello from server!1' })}\n\n`);  
  }, 2000);
  setInterval(() => {
    res.write(`updateorder: ${JSON.stringify({ message: 'Hello from server!2' })}\n\n`);
  }, 4000);
  setInterval(() => {
    res.write(`data: ${JSON.stringify({ message: 'Hello from server!3' })}\n\n`);
  }, 6000);


  // res.write("retry: 10000\n\n");
});



module.exports = router;


//!      Comment
//*      Comment
//todo   Comment
//?      Comment
//       Comment