const conn = require("../DB/dbconnector");
const util = require("util"); // helper

const admin = async (req, res, next) => {
  const query = util.promisify(conn.query).bind(conn);
  const { token } = req.headers;
  const user = await query("select * from users where token = ?", [token]);
  if (user[0] && user[0].type=="admin") {
    res.locals.user = user[0];
    next();
  } else {
    res.status(403).json({
      msg: "you are not authorized to access this route !",
    });
  }
};

module.exports = admin;