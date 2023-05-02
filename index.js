const express = require("express");
const app = express();


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("upload"));
const cors =require("cors");
app.use(cors());


const auth =require("./routes/Auth");
const auction =require("./routes/auction")
const bid = require('./routes/bid')
const auctionActivity = require('./routes/auctionActivity')
const adminTransaction = require('./routes/adminSpesificTransactions')
const adminAllTransaction = require('./routes/adminAllTransaction')
const approve= require("./routes/approved");
const reject= require("./routes/rejected");



app.listen(4000,"localhost",()=>{
    console.log("SERVER IS RUNNING");
});

app.use("/auth",auth);
app.use("/auction",auction);
app.use('/bid', bid)
app.use('/activity', auctionActivity)
app.use('/admin/transaction', adminTransaction)
app.use('/admin/transactions', adminAllTransaction)
app.use('/admin/approve',approve);
app.use('/admin/reject',reject)