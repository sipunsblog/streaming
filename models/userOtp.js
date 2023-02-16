const mongoose = require("../config/dbConnection");

const userOtp1 = mongoose.Schema({
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true,
        unique:false,
    },
    userPhone:{
        type:String,
        required:true,
        unique:false,
    },
    otp:{
        type:String,
        required:true,
        unique:false,

    }
},{timestamps:true})

const userOtpModel = mongoose.model("usersOtp",userOtp1);

module.exports = userOtpModel;
