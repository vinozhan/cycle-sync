import mongoose from 'mongoose';
import { DIFFICULTY, SURFACE_TYPES } from '../utils/constants.js';

const waypointSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    name: { type: String, default: '' },
  },
  { _id: false }
);

const routeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Route title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Route description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startPoint: {
      type: waypointSchema,
      required: [true, 'Start point is required'],
    },
    endPoint: {
      type: waypointSchema,
      required: [true, 'End point is required'],
    },
    waypoints: [waypointSchema],
    distance: {
      type: Number,
      required: [true, 'Distance is required'],
      min: [0, 'Distance must be positive'],
    },
    estimatedDuration: {
      type: Number,
      min: [0, 'Duration must be positive'],
    },
    difficulty: {
      type: String,
      enum: DIFFICULTY,
      required: [true, 'Difficulty level is required'],
    },
    safetyRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    elevationGain: {
      type: Number,
      default: 0,
      min: 0,
    },
    surfaceType: {
      type: String,
      enum: SURFACE_TYPES,
      default: 'paved',
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    polyline: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    city: {
      type: String,
      default: '',
      trim: true,
    },
    country: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

routeSchema.index({ title: 'text', description: 'text', tags: 'text' });
routeSchema.index({ difficulty: 1, safetyRating: -1 });
routeSchema.index({ createdBy: 1 });
routeSchema.index({ isActive: 1, createdAt: -1 });

const Route = mongoose.model('Route', routeSchema);

export default Route;
