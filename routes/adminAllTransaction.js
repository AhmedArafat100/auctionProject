const router =require("express").Router();
const { body, validationResult } = require("express-validator");
const conn = require("../DB/dbconnector");
const admin =require("../middlware/admin");
const util =require("util");

// seller id send in param
router.get(
    "/",
    admin,
    async (req, res) => {
      try {
        const query = util.promisify(conn.query).bind(conn);
        // 1- VALIDATION REQUEST [manual, express validation]
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
  
        // 2- CHECK IF MOVIE EXISTS OR NOT
        const auction = await query("select old_bid, new_bid from bid");
        if (!auction[0]) {
            return res.status(404).json({ msg: "not bids found for your auctions !" });
        }
        
        res.status(200).json({
            auctions: {...auction} ,
        });
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }
    }
  );
  
  module.exports = router;
  