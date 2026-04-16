const express = require('express');
const router = express.Router();
const Class = require('../models/Class');

const { createClass, getClassById, joinClass } = require('../controllers/classController');

router.post('/create', createClass);
router.get('/:id', getClassById);
router.post('/join', joinClass);
router.post("/start/:id", async (req, res) => {
  try {
    const foundClass = await Class.findById(req.params.id);

    if (!foundClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    foundClass.isMeetingStarted = true;
    await foundClass.save();

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: "Error starting meeting" });
  }
});

module.exports = router;