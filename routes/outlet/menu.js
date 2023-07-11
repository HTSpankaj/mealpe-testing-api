var express = require("express");
var router = express.Router();
var supabaseInstance = require("../../services/supabaseClient").supabase;
const multer = require("multer");
const upload = multer();


router.post("/createCategory", async (req, res) => {
  const { outletId, active, categoryname } = req.body;
  try {
    const { data, error } = await supabaseInstance
      .from("Menu_Categories")
      .insert({ outletId, active, categoryname })
      .select("*")

    if (data) {
      res.status(200).json({
        success: true,
        data: data,
      });
    } else {
      throw error;
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  }
});

router.post("/updateCategory/:categoryid", async (req, res) => {

  const { categoryid } = req.params;
  const menuCategoryData = req.body;
  ;
  try {
    const { data, error } = await supabaseInstance
      .from("Menu_Categories")
      .update({ ...menuCategoryData })
      .eq("categoryid", categoryid)
      .select("*");

    if (data) {
      res.status(200).json({
        success: true,
        message: "Data updated succesfully",
        data: data,
      });
    } else {
      throw error;
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/category/:outletId", async (req, res) => {
  try {
    const { data, error } = await supabaseInstance
      .from("Menu_Categories")
      .select("*")

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


router.post("/upsertCategoryImage", upload.single('file'), async (req, res) => {
  const { categoryid } = req.body;
  console.log("categoryid",categoryid)
  try {
    const { data, error } = await supabaseInstance
      .storage
      .from('category-image')
      .upload(categoryid + ".webp", req.file.buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/webp'
      })

    if (data?.path) {
      const publickUrlresponse = await supabaseInstance.storage.from('category-image').getPublicUrl(data?.path);
      console.log("publickUrlresponse",publickUrlresponse)
      if (publickUrlresponse?.data?.publicUrl) {
        const publicUrl = publickUrlresponse?.data?.publicUrl;
        const menuCategoryData = await supabaseInstance.from("Menu_Categories").update({ category_image_url: publicUrl }).eq("categoryid", categoryid).select("*").maybeSingle();
        res.status(200).json({
          success: true,
          data: menuCategoryData.data,
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

module.exports = router;