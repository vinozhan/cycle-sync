import mongoose from 'mongoose';
import { REPORT_CATEGORIES, REPORT_SEVERITY, REPORT_STATUS } from '../utils/constants.js';

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Report description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      default: null,
    },
    category: {
      type: String,
      enum: REPORT_CATEGORIES,
      required: [true, 'Report category is required'],
    },
    severity: {
      type: String,
      enum: REPORT_SEVERITY,
      required: [true, 'Severity level is required'],
    },
    location: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required'],
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required'],
      },
      address: {
        type: String,
        default: '',
      },
    },
    status: {
      type: String,
      enum: REPORT_STATUS,
      default: 'open',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    adminNotes: {
      type: String,
      default: '',
      maxlength: [1000, 'Admin notes cannot exceed 1000 characters'],
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, severity: 1 });
reportSchema.index({ reportedBy: 1 });
reportSchema.index({ route: 1 });
reportSchema.index({ category: 1, createdAt: -1 });

reportSchema.pre('save', function () {
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
});

const Report = mongoose.model('Report', reportSchema);

export default Report;
