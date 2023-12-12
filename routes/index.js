var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(`Protocol ==> ${req.protocol}://${req.get('host')}/`);
  res.render('index', { title: 'Express' });
});

module.exports = router;


//!      Comment
//*      Comment
//todo   Comment
//?      Comment
//       Comment