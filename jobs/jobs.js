const getDB = require('../mongo-connect.js').getDB;
const { getQuery } = require('./utils.js');


exports.postJobs = async(req, res) => {
    try{
        const db = getDB();
            const jobID = Math.floor(100000 + Math.random() * 9000);
            const data = {
                job_id: jobID,
                company_id: req.params.company_id,
                status: "Open",
                jobs_info:{...req.body, hired: 0},
                created_at: new Date(),
                updated_at: new Date()
            };
            await db.collection('Jobs').insertOne({data: data});
            res.status(201).send({message: "Job opening added successfully", data: data});
    }catch(err){
        res.status(500).send({message: `Internal Server Error! ${err}`});
    }
}

exports.getJobs = async(req, res) => {
    try {
        const db = getDB();
        const query = getQuery(req.query)
        const jobs = await db.collection('Jobs').find({'data.company_id': req.params.company_id, ...query}).toArray();
        res.status(200).send({message: "All jobs retrieved successfully", jobs: jobs});
    }catch(err){
        res.status(500).send({message: `Internal Server Error! ${err}`});
    }
}

exports.getJobById = async(req, res) => {
    try {
        const db = getDB();
        const job = await db.collection('Jobs').findOne({'data.job_id': parseInt(req.params.job_id)});
        if(job){
            res.status(200).send({message: "Job retrieved successfully", job: job});
        }else{
            res.status(404).send({message: "Job not found!"});
        }
    }catch(err){
        res.status(500).send({message: `Internal Server Error! ${err}`});
    }
}

exports.updateJobById = async(req, res) => {
    try{
        const db = getDB();
        const job = await db.collection('Jobs').findOne({'data.job_id': parseInt(req.params.job_id)});
        if(job){
            const data = await db.collection('Jobs').updateOne({'data.job_id': parseInt(req.params.job_id)},{
                $set: {
                    data:{
                        ...job.data,
                        jobs_info:{...job.data.jobs_info,...req.body},
                        updated_at: new Date()
                    }
                }
            });
            res.status(200).send({message: "Job updated successfully", jobs: data});
        }else{
            res.status(404).send({message: "Job not found!"});
        }
    
    }catch(err){
        res.status(500).send({message: `Internal Server Error! ${err}`});
    }
}

exports.deleteJob = async(req, res) => {
    try{
        const db = getDB();
        const job = await db.collection('Jobs').findOne({'data.job_id': parseInt(req.params.job_id)});
        if(job){
            const data = await db.collection('Jobs').deleteOne({'data.job_id': parseInt(req.params.job_id)});
            res.status(200).send({message: "Job deleted successfully", job: data});
        }else{
            res.status(404).send({message: "Job not found!"});
        }
        
    }catch(err){
        res.status(500).send({message: `Internal Server Error! ${err}`});
    }
}