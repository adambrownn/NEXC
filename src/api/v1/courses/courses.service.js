const courseRepository = require("../../../database/mongo/repositories/courses.repository");
const modelRegistry = require("../../../database/mongo/modelRegistry");

// Helper function to sync trade-service associations
const syncTradeAssociation = async (tradeId, courseId, action = 'add') => {
  try {
    if (!tradeId || !courseId) return;
    
    const TradeServiceAssociation = modelRegistry.getModel('trade-service-associations');
    
    let association = await TradeServiceAssociation.findOne({ trade: tradeId });
    
    if (action === 'add') {
      if (association) {
        if (!association.courses.includes(courseId)) {
          association.courses.push(courseId);
          await association.save();
          console.log(`[syncTradeAssociation] Added course ${courseId} to trade ${tradeId}`);
        }
      } else {
        association = new TradeServiceAssociation({
          trade: tradeId,
          cards: [],
          tests: [],
          courses: [courseId],
          qualifications: []
        });
        await association.save();
        console.log(`[syncTradeAssociation] Created new association for trade ${tradeId} with course ${courseId}`);
      }
    } else if (action === 'remove' && association) {
      association.courses = association.courses.filter(
        id => id.toString() !== courseId.toString()
      );
      await association.save();
      console.log(`[syncTradeAssociation] Removed course ${courseId} from trade ${tradeId}`);
    }
  } catch (error) {
    console.error('[syncTradeAssociation] Error:', error);
  }
};

// CREATE
module.exports.createCourse = async (req, res) => {
  try {
    if (!["superadmin", "admin"].includes(req.user.accountType)) {
      throw new Error("You do not have Access");
    }

    const newCourseResponse = await courseRepository.createCourse(req.body);
    
    // Auto-sync trade association
    if (newCourseResponse && newCourseResponse._id && req.body.tradeId) {
      await syncTradeAssociation(req.body.tradeId, newCourseResponse._id, 'add');
    }
    
    res.json(newCourseResponse);
  } catch (e) {
    console.log(e);
    res.json({
      err: e.message,
    });
  }
};

// READ
module.exports.getCourses = async (req, res) => {
  const filterCriteria = {};
  if (req.query.tradeId) {
    filterCriteria.tradeId = req.query.tradeId;
  }

  const coursesList = await courseRepository.getCourses(filterCriteria);
  res.json(coursesList);
};

module.exports.getCourseById = async (req, res) => {
  try {
    const reqObj = req.body;

    const sort = {
      createdAt: -1,
    };

    const limit = reqObj.limit || 500;

    const searchReqObj = {
      _id: req.params.courseId,
    };

    const populateObj = [
      {
        path: "tradeId",
        select: "title isAvailable",
      },
    ];

    const course = await courseRepository.getCoursesPopulateData(
      searchReqObj,
      populateObj,
      sort,
      limit
    );

    res.json(course);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};

// UPDATE
module.exports.updateCourse = async (req, res) => {
  try {
    // Get old course to check if trade changed
    const Course = modelRegistry.getModel('courses');
    const oldCourse = await Course.findById(req.params.courseId);
    
    const updateResp = await courseRepository.updateCourse(
      { _id: req.params.courseId },
      req.body
    );
    
    // Handle trade association updates
    if (oldCourse && req.body.tradeId) {
      const oldTradeId = oldCourse.tradeId?.toString();
      const newTradeId = req.body.tradeId?.toString();
      
      if (oldTradeId !== newTradeId) {
        if (oldTradeId) {
          await syncTradeAssociation(oldTradeId, req.params.courseId, 'remove');
        }
        if (newTradeId) {
          await syncTradeAssociation(newTradeId, req.params.courseId, 'add');
        }
      } else if (newTradeId) {
        await syncTradeAssociation(newTradeId, req.params.courseId, 'add');
      }
    }
    
    res.json(updateResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};

// DELETE
module.exports.deleteCourse = async (req, res) => {
  try {
    // Get course to find its trade before deleting
    const Course = modelRegistry.getModel('courses');
    const course = await Course.findById(req.params.courseId);
    
    const deleteResp = await courseRepository.deleteCourseByCourseId({
      _id: req.params.courseId,
    });
    
    // Remove from trade association
    if (course && course.tradeId) {
      await syncTradeAssociation(course.tradeId, req.params.courseId, 'remove');
    }
    
    res.json(deleteResp);
  } catch (e) {
    console.log(e);
    res.json({ err: e.message });
  }
};
