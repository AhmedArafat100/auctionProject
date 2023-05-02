const conn = require("../DB/dbconnector");
const util = require("util"); // helper

const bidder = async (req, res, next) => {
  const query = util.promisify(conn.query).bind(conn);
  const { token } = req.headers;
  const bidder = await query("select * from users where token = ?", [token]);
  if (bidder[0]&& bidder[0].type=="bidder") 
  {
    res.locals.user = bidder[0] 
    next();
  } else {
    res.status(403).json({
      msg: "you are not authorized to access this route !",
    });
  }
};

module.exports = bidder;