const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    message: "API working",
    status: "success"
  });
});

module.exports = router;