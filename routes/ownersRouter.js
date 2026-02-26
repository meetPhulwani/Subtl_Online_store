const express = require('express');
const router = express.Router();
const ownerModel = require('../models/ownerModel');


if(process.env.NODE_ENV === "development"){

router.post('/create', async (req,res)=>{

    let owners = await ownerModel.find();

    if(owners.length> 0) return res.sendStatus(503);

    let{fullName,email,contact,password} = req.body;

    let createdOwner = await ownerModel.create({
    fullName,
    email,
    contact,
    password,
    })
    res.status(201).send("ownerCreated");
})
}

router.get('/admin',(req,res)=>{
    let success = req.flash('success')
    let error = req.flash('error')
    res.render('createProducts', { success , error });
})

module.exports = router;