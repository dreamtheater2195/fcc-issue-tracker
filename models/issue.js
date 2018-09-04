const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  issue_title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 50
  },
  issue_text: {
    type: String, 
    required: true,
    trim: true,
    minlength: 5, 
    maxlength: 200
  },
  created_by: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  assigned_to: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  status_text: {
    type: String,
    trim: true,
    maxlength: 50
  },
  created_on: {
    type: Date,
    default: Date.now
  },
  updated_on: {
    type: Date,
    default: Date.now
  },
  open: {
    type: Boolean,
    default: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

const Issue = mongoose.model(
  'Issue', 
  IssueSchema
);

module.exports = { Issue };