var express = require("express");
var router = express.Router();
var supabaseInstance = require("../../services/supabaseClient").supabase;

router.post("/favoriteMenuItem", async (req, res) => {

    const { customerAuthUID, outletId, itemid, restaurantId  } = req.body;
    try {
    
      const { data, error } = await supabaseInstance
        .from("FavoriteMenuItem")
        .insert({customerAuthUID, outletId, itemid, restaurantId})
        .select("*")
  
      if (data) {
        res.status(200).json({
          success: true,
          data:data
        });
      } else {
        throw error;
      }
     
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
router.get("/getfavoriteMenuItem/:outletId", async (req, res) => {
    const { outletId } = req.params;
    try {
        const { data, error } = await supabaseInstance
            .from("FavoriteMenuItem")
            .select("*")
            .eq("outletId", outletId)
            
        if (data) {
            res.status(200).json({
                success: true,
                data: data,
            });
        } else {
            throw error
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;