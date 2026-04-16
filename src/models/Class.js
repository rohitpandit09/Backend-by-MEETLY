const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  teacher: {
    type: String,
    required: true
  },
  teacherName: {
    type: String,
    required: true
  },
  classCode: {
    type: String,
    required: true,
    uppercase: true,
    unique: true
  },
  students: [
    {
      studentId: {
        type: String,
        required: true
      },
      studentName: {
        type: String,
        required: true
      },
      role: {
        type: String,
        default: 'student'
      }
    }
  ],
  messages: [
    {
      sender: String,
      role: String,
      content: String,
      time: String,
      isNotice: {
        type: Boolean,
        default: false
      },
      isPinned: {
        type: Boolean,
        default: false
      }
    }
  ],
  assignments: [
    {
      title: String,
      description: String,
      dueDate: Date,
      submissions: [
        {
          studentId: String,
          studentName: String,
          submitted: {
            type: Boolean,
            default: false
          },
          time: String,
          fileName: String,
          late: {
            type: Boolean,
            default: false
          }
        }
      ]
    }
  ],
  isMeetingStarted: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Class', classSchema);