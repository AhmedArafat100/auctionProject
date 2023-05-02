const router = require("express").Router();
const conn =require("../DB/dbconnector");
const { body, validationResult } = require('express-validator');
const util =require("util");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const authorize =require("../middlware/authorize");


//register
router.post(
    "/register",
body("email").isEmail().withMessage("Please enter valid email"),
body("name").isString().withMessage("Please enter valid name").isLength({min:10,max:20}).withMessage("name should be between 10 and 20 character"),
body("password").isLength({min:8,max:12}).withMessage("password should be between 8 and 12 character"),
body("phone").isLength(11).withMessage("Please enter valid Phone Number"),
body("type").isString().withMessage("the type must be admin , seller and bidder"),

async (req,res) =>{
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const query =util.promisify(conn.query).bind(conn);
        const checkEmailExists = await query("select * from users where email = ?",[req.body.email]);

        if(checkEmailExists.length > 0){
            res.status(400).json({
                errors:[
                    {
                        msg: "email already exists",
                    }
                ]
            })
        }

        const userData = {
            name: req.body.name,
            email: req.body.email,
            password:  await bcrypt.hash(req.body.password,10),
            phone: req.body.phone,
            type:req.body.type,
            token: crypto.randomBytes(16).toString("hex")
        }
        await query("insert into users set ?",userData);
        delete userData.password;
        res.status(200).json(userData);

    }catch(err){
        res.status(500).json({err:err});
    }
});

//login
router.post(
  '/login',
  body('email').isEmail().withMessage('please enter a valid email!'),
  body('password')
    .isLength({ min: 8, max: 12 })
    .withMessage('password should be between (8-12) character'),
  async (req, res) => {
    try {
      // 1- VALIDATION REQUEST [manual, express validation]
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // 2- CHECK IF EMAIL EXISTS
      const query = util.promisify(conn.query).bind(conn); // transform query mysql --> promise to use [await/async]
      const user = await query(
        'select * from users where email = ?',
        [req.body.email]
      );
      if (user.length == 0) {
        return res.status(404).json({
          errors: [
            {
              msg: 'email or password not found !',
            },
          ],
        });
      }

      // 3- COMPARE HASHED PASSWORD
      const checkPassword = await bcrypt.compare(
        req.body.password,
        user[0].password
      );

      if (!checkPassword) {
        return res.status(400).json({
          msg: 'email or password not found !',
        });
      }
      await conn.query('update users set status =1 where email =?', [
        req.body.email,
      ]);

      if (user[0].pending === 0) {
        return res.status(401).json({
          msg: 'Waiting for admin approval',
        });
      }
      if (user[0].pending === 2) {
        return res.status(401).json({
          msg: 'you are rejected',
        });
      }
      const newUser = await query(
        'select * from users where email = ?',
        [req.body.email]
      );
      delete newUser[0].password;
      return res.status(200).json(newUser[0]);

    } catch (err) {
      res.status(500).json({ err: err });
    }
  }
);

  //logout
router.put("/logout",authorize,async(req,res)=>{
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const query = util.promisify(conn.query).bind(conn);
    await query("update users set status =0 where id =?",[res.locals.user.Id]);

    res.status(200).json({
      msg:"Logout successfully!!"
    })
    
  } catch (err) {
    res.status(500).json({ err : err});
  }
})

module.exports=router;