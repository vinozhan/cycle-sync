import mongoose from 'mongoose';
import { REWARD_CATEGORIES, REWARD_TIERS } from '../utils/constants.js';

const rewardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Reward name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Reward description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    icon: {
      type: String,
      required: [true, 'Reward icon is required'],
    },
    category: {
      type: String,
      enum: REWARD_CATEGORIES,
      required: [true, 'Reward category is required'],
    },
    criteria: {
      type: {
        type: String,
        required: [true, 'Criteria type is required'],
      },
      threshold: {
        type: Number,
        required: [true, 'Criteria threshold is required'],
        min: [1, 'Threshold must be at least 1'],
      },
    },
    pointsAwarded: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Points awarded must be non-negative'],
    },
    tier: {
      type: String,
      enum: REWARD_TIERS,
      required: [true, 'Reward tier is required'],
    },
    earnedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

rewardSchema.index({ category: 1, tier: 1 });
rewardSchema.index({ 'criteria.type': 1, 'criteria.threshold': 1 });

const Reward = mongoose.model('Reward', rewardSchema);

export default Reward;
