const router =require("express").Router();
const { validationResult } = require("express-validator");
const conn = require("../DB/dbconnector");
const util =require("util");
const admin =require("../middlware/admin");



router.put("/:id",admin, async(req,res)=>{
    try {
             // 1- VALIDATION REQUEST [manual, express validation]
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                      return res.status(400).json({ errors: errors.array() });
                }
                const query = util.promisify(conn.query).bind(conn);

                const user = await query("select * from users where id = ?",[req.params.id]);

                if (user.length==0) {
                    res.status(404).json({
                      errors: [
                        {
                          msg: "User Not Found",
                        },
                      ],
                    });
                  }

                await query("update users set pending =1 where id = ?", [req.params.id]);
                 res.status(200).json({
                    msg: "User approved successfully !",
                  });



    } catch (err) {
        res.status(500).json({err});
        
    }
})




module.exports=router;