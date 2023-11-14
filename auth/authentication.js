const jwt = require('jsonwebtoken');
const getDB = require('../mongo-connect.js').getDB;

exports.register = async(req, res) => {
    try{
        const db = getDB();
        const existingUser = await db.collection('Users').findOne({email:req.body.email})
        const existingCompany = await db.collection('Companies').findOne({name:req.body.company})
        if(!existingUser && !existingCompany){
            const userID = Math.floor(100000 + Math.random() * 900000);
            await db.collection('Users').insertOne({
                user_id: userID,
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                created_time: new Date(),
                updated_time: new Date()
            });
            const companyID = Math.floor(100000 + Math.random() * 900000);
            await db.collection('Companies').insertOne({
                    company_id: companyID,
                    name: req.body.company, 
                    website: req.body.website,
                    owner: {
                        name: req.body.username,
                        email: req.body.email, 
                        id: userID
                    }, 
                    type: "default",
                    created_time: new Date(),
                    updated_time: new Date()
            });
            res.status(200).send({message: "User registered successfully"});
        }else if(existingCompany){
            res.status(409).send({message: "Company with this name already exists"});
        }else{
            res.status(409).send({message: "User already exists"});
        }
    }catch(err){
        res.status(500).send({message: `Internal server error ${err}`});
    }
}

exports.login = async(req, res) => {
    try{
        const db = getDB();
        const existingUser = await db.collection('Users').findOne({email:req.body.email})
        if(existingUser){
            if(existingUser.password === req.body.password){
                const token = jwt.sign(req.body, "secret", {expiresIn: "1h"});
                res.status(200).send({message: "User logged in successfully", token: token, data: existingUser});
            }else{
                res.status(401).send({message: "Invalid password"});
            }
        }else{
            res.status(404).send({message: "User not found"});
        }
    }catch(err){
        res.status(500).send({message: `Internal server error ${err}`});
    }
}

exports.verifyToken = async(req, res, next) => {
    try{
        const token = req.headers.authorization;
        if(!token){
            res.status(401).send({message: "No token provided"});
        }else{
            const decoded = jwt.verify(token, "secret");
            const db = getDB();
            const existingUser = await db.collection('Users').findOne({email: decoded.email});
            if(existingUser){
                req.user = existingUser;
                next();
            }else{
                res.status(401).send({message: `Invalid token ${err}`});
            }
        }
    }catch(err){
        res.status(500).send({message: `Internal server error: Token got expired: ${err}`});
    }
}

exports.logout = async(req, res) => {
    req.user = null;
    res.status(200).send({message: "User logged out successfully"});
}

exports.admin = async(req, res) => {
    res.status(200).send(req.user);
}

exports.getCompanies = async(req, res) => {
    try{
        const db = getDB();
        const companies = await db.collection('Companies').find({"owner.id": req.user.user_id}).toArray();
        res.status(200).send({message: "Companies fetched successfully", companies: companies});
    }catch(err){
        res.status(500).send({message: "Internal server error"});
    }
}

exports.postCompanies = async(req, res) => {
    try{
        const db = getDB();
        const existingCompany = await db.collection('Companies').findOne({name:req.body.company});
        if(!existingCompany){
            const companyID = Math.floor(100000 + Math.random() * 900000);
            const companies = await db.collection('Companies').insertOne({
                company_id: companyID,
                name: req.body.company,
                website: req.body.website,
                address: req.body.address,
                description: req.body.description,
                owner: {
                    name: req.user.username,
                    email: req.user.email, 
                    id: req.user.user_id
                }, 
                type: "created",
                created_time: new Date(),
                updated_time: new Date()
            });
            res.status(200).send({message: "Companies created successfully", companies: companies});
        }else{
            res.status(409).send({message: "Company with this name already exists"});
        }        
    }catch(err){
        res.status(500).send({message: "Internal server error"});
    }
}

exports.verifyCompany = async(req, res, next) => {
    const db = getDB();
    const existingCompany = await db.collection('Companies').findOne({company_id: parseInt(req.params.company_id)});
    if(!existingCompany){
        res.status(404).send({message: "Company not found"});
    }else if(existingCompany.owner.id!== req.user.user_id){
        res.status(401).send({message: "You are not authorized to perform this action"});
    }else{
        next();
    }
}