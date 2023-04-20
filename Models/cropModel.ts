export {};
const mongoose = require('mongoose');

const cropSchema = mongoose.Schema(
  {
    //linking to user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    selectare: {
      type: Boolean,
      required:false,
  },
  selectareBy: {
      type: String,
      required: false,
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
    fertilizers: {
      type: [String],
      required: false,
    },
    pests: {
      type: [String],
      required: false,
    },
    diseases: {
      type: [String],
      required: false,
    },
    ItShouldNotBeRepeatedForXYears: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Crop', cropSchema);


