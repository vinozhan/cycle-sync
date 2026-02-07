import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: [true, 'Route reference is required'],
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer reference is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      maxlength: [1500, 'Comment cannot exceed 1500 characters'],
    },
    safetyScore: {
      type: Number,
      min: [1, 'Safety score must be at least 1'],
      max: [5, 'Safety score cannot exceed 5'],
    },
    sceneryScore: {
      type: Number,
      min: [1, 'Scenery score must be at least 1'],
      max: [5, 'Scenery score cannot exceed 5'],
    },
    difficultyAccuracy: {
      type: String,
      enum: ['easier', 'accurate', 'harder'],
      default: 'accurate',
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ route: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ route: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1 });

reviewSchema.pre('save', function (next) {
  if (!this.isNew && this.isModified('comment')) {
    this.isEdited = true;
  }
  next();
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
