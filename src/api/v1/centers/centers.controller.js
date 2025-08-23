const express = require("express");
const router = express.Router();
const centersService = require("./centers.service");
const { extractTokenDetails } = require("../../../common/services/auth.service");

// Debug middleware for this router
router.use((req, res, next) => {
  console.log(`[Centers Controller] ${req.method} ${req.path} at ${new Date().toISOString()}`);
  next();
});

// GET /centers
router.get("/", async (req, res, next) => {
  try {
    await centersService.getCenters(req, res);
  } catch (error) {
    next(error);
  }
});

// POST /centers
router.post("/", extractTokenDetails, async (req, res, next) => {
  try {
    await centersService.createCenter(req, res);
  } catch (error) {
    next(error);
  }
});

// GET /centers/:centerId
router.get("/:centerId", async (req, res, next) => {
  try {
    await centersService.getCenterById(req, res);
  } catch (error) {
    next(error);
  }
});

// PUT /centers/:centerId
router.put("/:centerId", extractTokenDetails, async (req, res, next) => {
  try {
    await centersService.updateCenter(req, res);
  } catch (error) {
    next(error);
  }
});

// DELETE /centers/:centerId
router.delete("/:centerId", extractTokenDetails, async (req, res, next) => {
  try {
    await centersService.deleteCenter(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
