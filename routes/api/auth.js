const express=require('express')
const router=express.Router()
const config = require("config");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt=require('bcryptjs')

const auth=require('../../middleware/auth')
const User=require('../../models/User')
//
router.get('/',auth,async (req,res)=>{
    try {
        const user=await User.findById(req.user.id).select('-password')
        res.json(user)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('server Error')
    }
})

//Authenticate User & get token

router.post(
    "/",
    [
      
      check("email", "Please include a valid Email").isEmail(),
      check(
        "password",
        "Password is Required"
      ).exists()
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { email, password } = req.body;
  
      try {
        let user = await User.findOne({ email });
        if (!user) {
          return res
            .status(400)
            .json({ errors: [{ msg: "Invalid Credentials" }] });
        }
        
        //Match the user and password
        const isMatch=await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res
            .status(400)
            .json({ errors: [{ msg: "Invalid Credentials" }] });
        }

        //Return the JSon WebToken
        const payload = {
          user: {
            id: user.id
          }
        };
  
        jwt.sign(
          payload,
          config.get("jwtSecret"),
          {
            expiresIn: 360000
          },
          (err, token) => {
            if (err) {
              throw err;
            }
            res.json({ token });
          }
        );
      } catch (error) {
        console.error(error.message);
        res.status(500).send("server Error");
      }
    }
  );


module.exports=router