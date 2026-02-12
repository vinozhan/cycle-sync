import mongoose from 'mongoose';
import { RIDE_STATUS } from '../utils/constants.js';

const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: true,
    },
    status: {
      type: String,
      enum: RIDE_STATUS,
      default: 'active',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      min: 0,
    },
    distance: {
      type: Number,
      min: 0,
    },
    co2Saved: {
      type: Number,
      min: 0,
    },
    pointsEarned: {
      type: Number,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

rideSchema.index(
  { user: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
);
rideSchema.index({ user: 1, createdAt: -1 });
rideSchema.index({ route: 1 });

const Ride = mongoose.model('Ride', rideSchema);

export default Ride;
