export {};
var mongoose = require('mongoose')



  const userSchema = mongoose.Schema ({
    rol:{
        type:String,
        enum: {
            values: ['client', 'agent'],
          },
        required:[true,'{VALUE} is not supported or missing']
    },
    name:{
        type:String,
        required:[true,'Please add a name']
    },
    email:{
        type:String,
        required:[true,'Please add an email '],
        unique: true
    },
    password:{
        type:String,
        required:[true,'Please add a password']
    },
   },
   {
       timestamps:true
   }
   )



   module.exports = mongoose.model('User', userSchema)
