const router =require("express").Router();
const { validationResult } = require("express-validator");
const conn = require("../DB/dbconnector");
const util =require("util");
const seller = require("../middlware/seller");

// seller id send in param
router.get(
    "/:id",
    seller,
    async (req, res) => {
      try {
        const query = util.promisify(conn.query).bind(conn);
        // 1- VALIDATION REQUEST [manual, express validation]
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
  
        // 2- CHECK IF MOVIE EXISTS OR NOT
        const auction = await query("select old_bid, new_bid from bid where seller_id = ?", [
          req.params.id,
        ]);
        if (!auction[0]) {
            return res.status(404).json({ msg: "not bids found for your auctions !" });
        }
        
        const bidders = await query("SELECT users.name, bid.new_bid from bid INNER JOIN users on bid.seller_id = users.Id;" )
        const winnerIndex = bidders.length;
        const winner = bidders[winnerIndex - 1];
  
        res.status(200).json({
            auctions: {...auction} ,
            winner_name: winner.name,
            final_bid: winner.new_bid,
        });
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }
    }
  );
  
  module.exports = router;
  