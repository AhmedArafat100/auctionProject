const router =require("express").Router();
const { validationResult } = require("express-validator");
const conn = require("../DB/dbconnector");
const bidder=require("../middlware/bidder");
const util =require("util");



// auction time

router.post(
    "/:id",
    bidder,
    async (req, res) => {
      try {
        const query = util.promisify(conn.query).bind(conn);
        // 1- VALIDATION REQUEST [manual, express validation]
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
  
        // 2- CHECK IF auction EXISTS OR NOT
        const auction = await query("select * from auction where id = ?", [
          req.params.id,
        ]);

        if (!auction[0]) {
          res.status(404).json({ msg: "auction not found !" });
        }
        const timeNow = new Date();
        const autionTime = new Date(auction[0].end_date)
        
        if((timeNow - autionTime) > 0 ){
          return res.status(404).json({
            msg: 'this auction has been end'
          })
        }
        
        const sellerId=auction[0].seller_id
        // 3 - PREPARE auction  OBJECT
        const bidObj = {
            user_id:res.locals.user.Id,
            auction_id: req.params.id,
            new_bid: req.body.new_bid,
            old_bid: 0,
            seller_id:sellerId
        };

        // check bid on this auction
        const bid = await query("select * from bid where auction_id = ?", [
            req.params.id,
          ]);
          if (!bid[0]) {
            await query("insert into bid set ?", bidObj);
          }
          else {
              const len = bid.length;
              if( bidObj.new_bid <= bid[len-1].new_bid){
                   return res.status(400).json({
                    msg: 'hot rakm a3la ysta'
                  })
              }
            bidObj.old_bid = bid[len-1].new_bid;
            await query("insert into bid set ?", bidObj);
          }
        

  
        
        res.status(200).json({
          msg: "bid added successfully !",
        });
      } catch (err) {
        res.status(500).json(err);
      }
    }
  );
  
  module.exports = router;
  
