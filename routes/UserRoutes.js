const express = require("express");
const routes = express.Router();

const {getAllUsers,createUser,getSingleUser,updateUser,deleteUser,logIN,createOptByUserPhone} = require("../controller/UserController");
const {verifyUserLogedIn} = require("../midleware/userMiddleware");


routes.get("/",getAllUsers);

routes.post("/login",logIN);

routes.post("/sendOtp",createOptByUserPhone);

routes.get("/:id",getSingleUser);

routes.post("/",createUser);

routes.post("/updateUser",updateUser);

routes.delete("/:id",deleteUser)



module.exports = routes;