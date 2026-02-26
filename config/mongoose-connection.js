const mongoose = require('mongoose');
const config = require('config');
const debgr = require('debug')('development:mongoose');

mongoose
.connect(`${config.get('MONGODB_URI')}/SUBTL`)
.then(()=>{
    debgr("connected");
})
.catch((err)=>{
    debgr(err);
})

module.exports = mongoose.connection;