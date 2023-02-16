const userModel = require("../models/usersModel");
const userOtpModel = require("../models/userOtp");
const {checkNull} = require("../include/MovieFunctions");
const bcryptjs = require("bcryptjs");
const jwt      = require("jsonwebtoken");


async function getAllUsers(req,res){
    try{
        let allUsers = await userModel.find();
        res.send(allUsers);
    }catch(err){
        res.send("Failed to get the users")
    }
}



async function getSingleUser(req,res){

    let userID = req.params.id;
    if(checkNull(userID)){
        try {
            let reqSingleUser = await userModel.findById(userID);
            if(checkNull(reqSingleUser)){
                res.send(reqSingleUser);
            }else{
                res.send({status:404,message:"Thier is no data on this userid"});
            }
        } catch (error) {
            res.send({status:404,message:"Thier is no data on this userid"});
        }
    }else{
        res.send({status:404,message:"Send userID please"});
    }

}


async function logIN(req,res){
    let userID = req.body.emailID;
    let userPW = req.body.password;
console.log(userID)
    if(checkNull(userID)){
        try {
            let reqSingleUser
            let emailUser = await userModel.findOne({emailID:userID});
            let phnUser = await userModel.findOne({phone:userID});
            if (checkNull(emailUser)){
                reqSingleUser = emailUser
            }else if (checkNull(phnUser)){
                reqSingleUser = phnUser
            }
            if(checkNull(reqSingleUser)){
                let userIdPwStat = await userModel.findOne({emailID:{"$in":userID},password:{"$in":userPW}});
                bcryptjs.compare(userPW,reqSingleUser.password,(err,suc)=>{
                        if(suc){

                            jwt.sign({emailID:reqSingleUser.emailID},"privatekey",(signerr,token)=>{

                                res.send({status:200,token:token,userid:reqSingleUser._id});

                            })

                        }else{
                            res.send({status:404,message:"There is no Users On this Id and Password"})
                        }
                })
                // if(checkNull(userIdPwStat)){
                //     jwt.sign({useraName:userMail},"SuperSecret",())
                //     res.send(userIdPwStat);
                // }else{
                //     res.send({status:404,message:"There is no Users On this Id and Password"})
                // }
            }else{
                res.send({status:404,message:"There is no Users On this name"})
            }
        }catch(err){
            res.send({status:404,message:"Error occured"})
        }
    }else{
        res.send({status:404,message:"Please send body data"})
    }
}

async function createUser(req,res){
    let userDta = req.body;
    console.log(userDta)
    let reqSingleUser
    let emailUser = await userModel.findOne({emailID:userDta.emailID});
    let phnUser = await userModel.findOne({phone:userDta.phone});
    if (checkNull(emailUser)){
        reqSingleUser = emailUser
    }else if (checkNull(phnUser)){
        reqSingleUser = phnUser
    }
    // check for existing users
        if(checkNull(userDta) && !checkNull(reqSingleUser)){
        
        /**
         * for syncronous it can wait not for async
         * 
         * 
         * var salt = bcryptjs.genSaltSync(10);
        var hash = bcryptjs.hashSync("B4c0/\/", salt);
        userDta.password = hash;

        let x = await userModel.create(userDta);
        if(checkNull(x)){
            res.send(x);
        }
         */
        
        try{

            bcryptjs.genSalt(10,(err,salt)=>{ //async task
                if(!checkNull(err)){
                    bcryptjs.hash(userDta.password,salt, (err,encrypt)=>{

                        if(!checkNull(err)){

                            userDta.password = encrypt;
                            userModel.create(userDta)
                            .then((doc)=>{
                                console.log(doc);
                                if(checkNull(doc)){
                                    res.send({status:200,message:"User created sucessfull"});
                                }else{
                                    res.send("User id or email already exist");

                                }
                            })
                            .catch((err)=>{
                                res.send({status:404,message:"User id or email already exist"});
                            })
                        }else{
                            res.send({status:404,message:"error while hash"})
                        }
                    })
                }else{
                    res.send({status:404,message:"error while gen salt"})
                }
            })
                
        }catch(error){
            console.log(error);
            res.send({status:200,message:error});
        }
    }else{
        res.send({status:404,message:"User already exist"});
    }
}
function sendBookedMessage(msg,phno){
    const accountSid = 'ACef2c97ddf6d97809ddb29e2e6e1bd8bf'; 
    const authToken = '3e354c791369867a7f46dfdc59458ac2'; 
    const client = require('twilio')(accountSid, authToken); 
 
     client.messages.create({     
         body : msg,
         from : "+16186230260",
         to: '+91'+phno
       }) 
      .then(message => console.log(message.sid));
}
async function updateUser(req,res){
    let userDta = req.body;
    let reqSingleUser
    let phnUser = await userModel.findOne({phone:userDta.phone});
    let userOtp = await userOtpModel.findOne({phone:userDta.phone}).sort({createdAt:-1}).limit(1);
    if (checkNull(phnUser) && checkNull(userOtp)){
        reqSingleUser = phnUser
        if (userOtp._doc.otp != userDta.otp ){
            res.send({status:404,message:"Otp not matched"});
        }
    }else{
        res.send({status:404,message:"Phone number not found"});
    }
    if(checkNull(reqSingleUser)){
        let userUpdateData = req.body;
        let userID = reqSingleUser._doc._id
        if(checkNull(userUpdateData)){
            try{
                    bcryptjs.genSalt(10,(err,salt)=>{ //async task
                        if(!checkNull(err)){
                            bcryptjs.hash(userDta.password,salt, (err,encrypt)=>{
                                if(!checkNull(err)){
                                    userDta.password = encrypt;
                                    userModel.findByIdAndUpdate(userID,userDta)
                                    .then((doc)=>{
                                        console.log(doc);
                                        if(checkNull(doc)){
                                            res.send({status:200,message:"Updated successfully"});
                                        }else{
                                            res.send({status:404,message:"Internal Server Error"});
                                        }
                                    })
                                    .catch((err)=>{
                                        res.send({status:404,message:"User id or email already exist"});
                                    })
                                }else{
                                    res.send({status:404,message:"error while hash"})
                                }
                            })
                        }else{
                            res.send({status:404,message:"error while gen salt"})
                        }
                    })

            }catch(error){
                console.log(error);
                res.send(error);
            }
        }
    }else{
        res.send({status:404,message:"Send userID please"});
    }
}


async function deleteUser(req,res){
    let userID = req.params.id;
    try {
        if(checkNull(userID)){
           let deleteUser = await userModel.findByIdAndDelete(userID);
           console.log(deleteUser);
           if(checkNull(deleteUser)){
                res.send({status:200,message:`User delete sucessfully on this _id ${userID} `});
           }else{
                res.send("User id doesnot exist");
           }
        }
    }catch(err){
        res.send({status:404,message:"Their is no data on this ID"});
    }

}

async function createOptByUserPhone(req,res){
    let userDta = req.body;
    if (!checkNull(userDta)){
        res.send({status:404,message:"Phone number cannot be null"});
    }
    let reqSingleUser
    let phnUser = await userModel.findOne({phone:userDta.userPhone});
    if (checkNull(phnUser)){
        reqSingleUser = phnUser
    }else{
        res.send({status:404,message:"Phone number not found"});
    }
    if(checkNull(reqSingleUser)){
        // 6 digit otp
        let userOtp = parseInt((Math.random())*1000000)
        userOtpModel.create({
            userID:reqSingleUser._doc._id,
            userPhone:userDta.userPhone,
            otp:userOtp
        }).then((doc)=>{
            console.log(doc);
            if(checkNull(doc)){
                res.send({status:200,message:"Otp Sent sucessfull"});
                // send otp
                try {
                    sendBookedMessage(`Your otp for SAMFLIX is ${userOtp}`,userDta.userPhone)
                } catch (error) {
                    console.log(error);
                }
            }else{
                res.send({status:404,message:"Internal Server Error"});
            }
        })

    }
}




module.exports = {getAllUsers,createUser,getSingleUser,updateUser,deleteUser,logIN,createOptByUserPhone};