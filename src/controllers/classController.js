const Class = require('../models/Class');
const mongoose = require("mongoose");

exports.createClass = async (req, res) => {
  try {
    console.log("BODY:", req.body); // 🔥 ADD THIS

    const { name, description, teacherId, teacherName } = req.body;

    const newClass = await Class.create({
      name,
      description,
      teacher: teacherId,
      teacherName,
      classCode: Math.random().toString(36).substr(2, 6).toUpperCase()
    });

    console.log("CLASS CREATED:", newClass); // 🔥 ADD THIS

    res.json({ class: newClass });

  } catch (err) {
    console.log("ERROR:", err); // 🔥 ADD THIS
    res.status(500).json({ message: "Error creating class" });
  }
};

exports.getClassById = async (req, res) => {
  try {
    const id = req.params.id;

    console.log("RECEIVED ID:", id);

    // 🔥 FIX: validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid class ID" });
    }

    const classData = await Class.findById(id);

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.json({ class: classData });

  } catch (error) {
    console.log("GET CLASS ERROR:", error);
    res.status(500).json({ message: "Error fetching class" });
  }
};

exports.joinClass = async (req, res) => {
  try {
    const { classCode, userId, userName, role } = req.body;

    if (!classCode || !userId || !userName) {
      return res.status(400).json({ message: "Missing join information" });
    }

    const foundClass = await Class.findOne({
      classCode: classCode.toUpperCase().trim()
    });

    if (!foundClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    const alreadyJoined = foundClass.students.some(
      (student) => student.studentId === userId
    );

    if (!alreadyJoined) {
      foundClass.students.push({
        studentId: userId,
        studentName: userName,
        role: role || 'student'
      });
      await foundClass.save();
    }

    res.json({ class: foundClass });

  } catch (err) {
    console.log("JOIN ERROR:", err);
    res.status(500).json({ message: "Error joining class" });
  }
};