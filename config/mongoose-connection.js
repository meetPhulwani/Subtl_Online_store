const mongoose = require('mongoose');
const config = require('config');
const debgr = require('debug')('development:mongoose');

const dbUri = process.env.MONGODB_URI || config.get('MONGODB_URI');

mongoose
.connect(dbUri)
.then(()=>{
    debgr("connected");
    console.log("Connected to database:", mongoose.connection.name);
})
.catch((err)=>{
    debgr(err);
    console.error("MongoDB connection failed:", err.message);
})

module.exports = mongoose.connection;
