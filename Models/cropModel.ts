var mongoose = require('mongoose');

const cropSchema = mongoose.Schema(
  {
    //linking to user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    cropName: {
      type: String,
      required: [true, 'Lipseste numele culturii'],
    },
    cropType: {
      type: String,
      required: [true, 'Lipseste tipul culturii'],
    },
    cropVariety: {
      type: String,
      required: [true, 'Lipseste soiul culturii'],
    },
    plantingDate: {
      type: String,
      required: [true, 'Lipseste data plantarii'],
    },
    harvestingDate: {
      type: String,
      required: [true, 'Lipseste data recoltarii'],
    },
    description: {
      type: String,
      required: [true, 'Lipseste descrierea'],
    },
    imageUrl: {
      type: String,
      required: false,
    },
    soilType: {
      type: String,
      required: [true, 'Lipseste tipul de sol'],
    },
    climate: {
      type: String,
      required: [true, 'Lipseste clima'],
    },
    selectare: {
      type: Boolean,
      required: false,
    },
    selectareBy: {
      type: String,
      required: false,
      ref: 'User',
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Crop', cropSchema);
