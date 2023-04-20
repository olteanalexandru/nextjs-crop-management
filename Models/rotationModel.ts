export {};
var mongoose = require('mongoose')
const rotationSchema = mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
      },
      fieldSize: {
        type: Number,
        required: [true, 'Lipseste marimea terenului'],
      },
      numberOfDivisions: {
        type: Number,
        required: [true, 'Lipseste numarul de diviziuni'],
      },
      crops: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Crop',
        },
      ],
    },
    {
      timestamps: true,
    }
  );
  
  module.exports = mongoose.model('Rotation', rotationSchema);
  