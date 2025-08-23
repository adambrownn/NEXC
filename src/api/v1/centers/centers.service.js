const centerRepository = require("../../../database/mongo/repositories/centers.repository");

// CREATE
module.exports.createCenter = async (req, res) => {
  try {
    if (!["superadmin", "admin"].includes(req.user.accountType)) {
      return res.status(403).json({
        success: false,
        error: "You do not have access to create centers"
      });
    }

    const newCenterResponse = await centerRepository.createCenter(req.body);
    res.json({
      success: true,
      data: newCenterResponse
    });
  } catch (error) {
    console.error("Error creating center:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create center"
    });
  }
};

// READ
module.exports.getCenters = async (req, res) => {
  try {
    console.log(`[Centers Service] Fetching all centers`);
    const centersList = await centerRepository.getCenters({});
    console.log(`[Centers Service] Found ${centersList.length} centers`);
    
    res.json({
      success: true,
      data: centersList
    });
  } catch (error) {
    console.error("[Centers Service] Error fetching centers:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch centers"
    });
  }
};

// READ by ID
module.exports.getCenterById = async (req, res) => {
  try {
    console.log(`[Centers Service] Fetching center by ID: ${req.params.centerId}`);
    const center = await centerRepository.getCenters({
      _id: req.params.centerId,
    });
    
    if (!center || center.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Center not found"
      });
    }
    
    res.json({
      success: true,
      data: center[0]
    });
  } catch (error) {
    console.error("[Centers Service] Error fetching center by ID:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch center"
    });
  }
};

// UPDATE
module.exports.updateCenter = async (req, res) => {
  try {
    if (!["superadmin", "admin"].includes(req.user.accountType)) {
      return res.status(403).json({
        success: false,
        error: "You do not have access to update centers"
      });
    }

    const updateResp = await centerRepository.updateCenter(
      { _id: req.params.centerId },
      req.body
    );

    if (!updateResp) {
      return res.status(404).json({
        success: false,
        error: "Center not found"
      });
    }

    res.json({
      success: true,
      data: updateResp
    });
  } catch (error) {
    console.error("[Centers Service] Error updating center:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update center"
    });
  }
};

// DELETE
module.exports.deleteCenter = async (req, res) => {
  try {
    if (!["superadmin", "admin"].includes(req.user.accountType)) {
      return res.status(403).json({
        success: false,
        error: "You do not have access to delete centers"
      });
    }

    const deleteResp = await centerRepository.deleteCenterByCenterId(req.params.centerId);
    
    if (deleteResp.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Center not found"
      });
    }

    res.json({
      success: true,
      data: deleteResp
    });
  } catch (error) {
    console.error("[Centers Service] Error deleting center:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete center"
    });
  }
};
