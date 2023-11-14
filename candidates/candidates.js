const e = require('express');

const getDB = require('../mongo-connect.js').getDB;

exports.getCandidates = async(req, res) => {
   try {
        const db = getDB();
        const candidates = await db.collection('Candidates').find({}).toArray();
        res.status(200).send({message: "All candidates retrieved successfully", candidates: candidates});
    }catch(err){
        res.status(500).send({message: `Internal Server Error! ${err}`});
    }
}
exports.postCandidates = async(req, res) => {
    try{
        const db = getDB();
        const existingCandidate = await db.collection('Candidates').findOne({'data.candidate.email': req.body.email});
        if(!existingCandidate){
            const candidateID = Math.floor(100000 + Math.random() * 90000000);
            const data = {
                candidate_id: candidateID,
                candidate_info:{
                    name: req.body.name,
                    email: req.body.email,
                    phone: req.body.phone,
                    links: req.body.links,
                    resume: null,
                    cover_letter: null
                },
                offers:[],
                created_at: new Date(),
                updated_at: new Date()
            };
            await db.collection('Candidates').insertOne({data: data});
            res.status(201).send({message: "Candidate added successfully", data: data});
        }else{
            res.status(409).send({message: "Candidate already exists!"});
        }        
    }catch(err){
        res.status(500).send({message: `Internal Server Error! ${err}`});
    }
}
exports.getCandidateById = async(req, res) => {
    try{
        const db = getDB();
        const candidate = await db.collection('Candidates').findOne({'data.candidate_id': parseInt(req.params.id)});
        if(candidate){
            res.status(200).send({message: "Candidate retrieved successfully", candidate: candidate});
        }else{
            res.status(404).send({message: "Candidate not found!"});
        }
    }catch(err){
        res.status(500).send({message: `Internal Server Error! ${err}`});
    }
}
exports.updateCandidate = async(req, res) => {
    try{
        const db = getDB();
        if("email" in req.body){
            res.status(401).send({ message: "Email field is not updatable" })
        }else{
            const candidate = await db.collection('Candidates').findOne({'data.candidate_id': parseInt(req.params.id)});
            if(candidate){
                const data = await db.collection('Candidates').updateOne({'data.candidate_id': parseInt(req.params.id)},{
                    $set: {
                        data:{
                            ...candidate.data,
                            candidate_info:{...candidate.data.candidate_info,...req.body},
                            updated_at: new Date()
                        }
                    }
                });
                res.status(200).send({message: "Candidate updated successfully", candidate: data});
            }else{
                res.status(404).send({message: "Candidate not found!"});
            }
        }
    }catch(err){
        res.status(500).send({message: `Internal Server Error! ${err}`});
    }
}
exports.deleteCandidate = async(req, res) => {
    try{
        const db = getDB();
        const candidate = await db.collection('Candidates').findOne({'data.candidate_id': parseInt(req.params.id)});
        if(candidate){
            const data = await db.collection('Candidates').deleteOne({'data.candidate_id': parseInt(req.params.id)});
            res.status(200).send({message: "Candidate deleted successfully", candidate: data});
        }else{
            res.status(404).send({message: "Candidate not found!"});
        }
        
    }catch(err){
        res.status(500).send({message: `Internal Server Error! ${err}`});
    }
}
exports.uploadDocuments = async(req, res) => {
    
}