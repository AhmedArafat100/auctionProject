const router =require("express").Router();
const { body, validationResult } = require("express-validator");
const conn = require("../DB/dbconnector");
const upload = require("../middlware/uploadimage");
const seller = require("../middlware/seller");
const util =require("util");
const fs =require("fs");


//seller [create]
router.post(
    "/",seller,
    upload.single("image"),
    body("name")
      .isString()
      .withMessage("please enter a valid auction name")
      .isLength({ min: 10 })
      .withMessage("auction name should be at lease 10 characters"),
  
    body("description")
      .isString()
      .withMessage("please enter a valid description ")
      .isLength({ min: 20 })
      .withMessage("description name should be at lease 20 characters"),

    async (req, res) => {
      try {
        // 1- VALIDATION REQUEST [manual, express validation]
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
  
        // 2- VALIDATE THE IMAGE
        if (!req.file) {
          return res.status(400).json({
            errors: [
              {
                msg: "Image is Required",
              },
            ],
          });
        }
        
        const startTime = new Date();
        const time = new Date();
        Date.prototype.addminutes= function(m){
              this.setMinutes(this.getMinutes() +m)
              return this;
        }

const endTime = time.addminutes(1);

        // 3- PREPARE MOVIE OBJECT
        const auction = {
          name: req.body.name,
          description: req.body.description,
          start_date: startTime,
          end_date: endTime,
          image_url: req.file.filename,
          seller_id: res.locals.user.Id
        };
  
        // 4 - INSERT MOVIE INTO DB
        const query = util.promisify(conn.query).bind(conn);
        await query("insert into auction set ? ", auction);
        res.status(200).json({
          msg: "auction created successfully !",
        });
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }
    }
  );

//seller [update]
router.put(
  "/:id",
  seller,
  upload.single("image"),
  body("name")
  .isString()
  .withMessage("please enter a valid auction name")
  .isLength({ min: 10 })
  .withMessage("auction name should be at lease 10 characters"),

body("description")
  .isString()
  .withMessage("please enter a valid description ")
  .isLength({ min: 20 })
  .withMessage("description name should be at lease 20 characters"),


  body("StartDate").isDate().withMessage("please enter a valid date"),
  body("EndDate").isDate().withMessage("please enter a valid date"),
 async (req,res)=>{
    try {
      const query = util.promisify(conn.query).bind(conn);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // 2- CHECK IF AUCTION EXISTS OR NOT
      const auction = await query("select * from auction where id = ?",[req.params.id,]);

      if(!auction[0]){
        res.status(404).json({
          msg:"auction not found !"
        })
      }

      // 3- PREPARE AUCTION OBJECT
      const auctionObj ={
        name: req.body.name,
        description : req.body.description,
        start_date: req.body.StartDate,
        end_date: req.body.EndDate
      }
      
      if(req.file){
        auctionObj.image_url=req.file.filename;
        fs.unlinkSync("./upload/"+ auction[0].image_url);

      }

      // 4- UPDATE AUCTION
      await query("update auction set ? where id = ?",[auctionObj , req.params.id]);
      
      res.status(200).json({
        msg:"Auction updated successfully"
      })
      
    } catch (err) {
      res.status(500).json(err);
    }
  }
  )


//seller [delete]
router.delete(
  "/:id",
  seller, // params
  async (req, res) => {
    try {
      // 1- CHECK IF MOVIE EXISTS OR NOT
      const query = util.promisify(conn.query).bind(conn);
      const auction = await query("select * from auction where id = ?", [
        req.params.id
      ]);
      if (!auction[0]) {
        res.status(404).json({ ms: "auction not found !" });
      }
      // 2- REMOVE MOVIE IMAGE
      fs.unlinkSync("./upload/" + auction[0].image_url); // delete old image
      await query("delete from auction where id = ?",[req.params.id]);
      res.status(200).json({
        msg: "auction delete successfully",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
);
// LIST & SEARCH [ADMIN, USER]
router.get("",seller, async (req, res) => {
  const query = util.promisify(conn.query).bind(conn);
  let search = "";
  if (req.query.search) {
    // QUERY PARAMS
    search = `where name LIKE '%${req.query.search}%' or description LIKE '%${req.query.search}%'`;
  }
  const auction = await query(`select * from auction ${search}`);
  auction.map((auction) => {
    auction.image_url = "http://" + req.hostname + ":4000/" + auction.image_url;
  });
  res.status(200).json(auction);
});


// SHOW auction [ADMIN, USER]
router.get("/:id",seller, async (req, res) => {
  const query = util.promisify(conn.query).bind(conn);
  const auction = await query("select * from auction where id = ?", [
    req.params.id,
  ]);
  if (!auction[0]) {
    res.status(404).json({ ms: "auction not found !" });
  }
  auction[0].image_url = "http://" + req.hostname + ":4000/" + auction[0].image_url;
  console.log(auction);
  res.status(200).json(auction[0]);
});



module.exports=router;


