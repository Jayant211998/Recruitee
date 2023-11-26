const getDB = require('../mongo-connect.js').getDB;

const { updateStatus, countHiredCandidate,rejectJobStatus, rejectCandidateStatus } = require('../utils.js');

exports.apply = async(req, res) => {
    try{
        const db = getDB();
        const candidate = await db.collection('Candidates').findOne({'data.candidate_id': parseInt(req.params.candidate_id)});
        if(!candidate){
            res.status(404).send({message: "Candidate not found. Please check candidate ID."});
        }else{
            const job = await db.collection('Jobs').findOne({'data.job_id': parseInt(req.params.job_id)});
            if(!job){
                res.status(404).send({message: "Job not found. Please check job ID."});
            }else{
                const job_applied = await db.collection('Application').findOne({job_id: parseInt(req.params.job_id), candidate_id: parseInt(req.params.candidate_id)});
                if(job_applied){
                    res.status(404).send({message: "Candidate has already applied for this job."});
                }else if ( job.data.status === "Closed" ) {
                    res.status(404).send({message: "Hiring process is finished for this job."});
                }else{
                    const application_id = Math.floor(100000 + Math.random() * 90000000);
                    const job_application = await db.collection('Application').insertOne({
                        job_application_id: application_id,
                        company_id: job.data.company_id,
                        job_id: parseInt(req.params.job_id),
                        job_title: job.data.jobs_info.title,
                        candidate_id: parseInt(req.params.candidate_id),
                        candidate_email: candidate.data.candidate_info.email,
                        candidate_name: candidate.data.candidate_info.name,
                        stage: 'Applied',
                        created_at: new Date(),
                        updated_at: new Date()
                    })
                    res.status(200).send({message: "Candidate applied for job successfully.", job_application_id: application_id ,job_application_data: job_application});
                }
            }  
        }
    }catch(err){
        res.status(500).send(`Internal Server Error ${err}`);
    }       
}

exports.applyJobInfo = async(req, res) => {
    try{
        const db = getDB();
        const candidates = await db.collection('Application').find({job_id: parseInt(req.params.job_id)}).toArray();
        if(candidates.length === 0){
            res.status(404).send({message: "No candidate applied for this job. Please check job ID."});
        }else{
            res.status(200).send({ job_application_information: candidates });
        }
    }catch(err){
        res.status(500).send(`Internal Server Error ${err}`);
    }
}

exports.applyCandidateInfo = async(req, res) => {
    try{
        const db = getDB();
        const jobs = await db.collection('Application').find({candidate_id: parseInt(req.params.candidate_id)}).toArray();
        if(jobs.length === 0){
            res.status(404).send({message: "Candidate not found. Please check candidate ID."});
        }else{
            res.status(200).send({ job_application_information: jobs });
        }
    }catch(err){
        res.status(500).send(`Internal Server Error ${err}`);
    }
}

exports.applicationInfo = async(req, res) => {
    try{
        const db = getDB();
        const application = await db.collection('Application').findOne({job_application_id: parseInt(req.params.application_id)});
        if(!application){
            res.status(404).send({message: "Job application not found. Please check application ID."});
        }else{
            res.status(200).send({ data: application });
        }
    }catch(err){
        res.status(500).send(`Internal Server Error ${err}`);
    }
}

exports.promote = async(req, res) => {
    try{
        const db = getDB();
        const application = await db.collection('Application').findOne({job_application_id: parseInt(req.params.application_id)});
        const job = await db.collection('Jobs').findOne({ 'data.job_id': application.job_id });
        if(!application){
            res.status(404).send({message: "Application not found. Please check application ID."});
        }else if(application.stage === "Rejected"){
            res.status(404).send({message: "Rejected candidates can not be promoted"});
        }else if(application.stage === "Hired"){
            res.status(404).send({message: "You have already hired the candidate."});
        }else if(job.data.status === "Closed"){
            res.status(404).send({message: "Hiring process is finished for this job."});
        }else {
            if(application.stage === "Offer" && job.data.jobs_info.hired + 1 === job.data.jobs_info.hired.number_of_openings){
                await db.collection('Jobs').updateOne({
                    'data.job_id': application.job_id
                },{
                    $set:{
                        'data.jobs_info.hired': application.candidates_hired + 1,
                        'data.status': "Closed",
                        'data.updated_at': new Date()                        
                    }
                })                
            }else if(application.stage === "Offer"){
                await db.collection('Application').updateOne({
                    job_application_id: parseInt(req.params.application_id)
                },{
                    $set: {
                        stage: updateStatus(application.stage),
                }})
                await db.collection('Jobs').updateOne({
                    'data.job_id': application.job_id
                },{
                    $set:{
                        'data.jobs_info.hired': application.candidates_hired + 1,
                        'data.updated_at': new Date()                        
                    }
                })
            }
            await db.collection('Application').updateOne({
                job_application_id: parseInt(req.params.application_id)
            },{ 
                $set: {
                    stage: updateStatus(application.stage),
                    updated_at: new Date()
            }})
            res.status(200).send({message: "Candidate has been promoted to next stage."});
        }
    }catch(err){
        res.status(500).send(`Internal Server Error ${err}`);
    }       
}

exports.reject = async(req, res) => {
    try{
        const db = getDB();
        const application = await db.collection('Application').findOne({job_application_id: parseInt(req.params.application_id)});
        if(!application){
            res.status(404).send({message: "Application not found. Please check application ID."});
        }else if(application.stage === "Rejected"){
                res.status(404).send({message: "Candidate has already been rejected for this offer."});
        }else if(application.stage === "Hired"){
            res.status(404).send({message: "Hired candidates cannot be rejected"});
        }else {
            await db.collection('Application').updateOne({job_application_id: parseInt(req.params.application_id)}, { $set: { stage:  "Rejected", updated_at: new Date() }});
            res.status(200).send({message: "Candidate has been rejected for this offer."});
        }
    }catch(err){
        res.status(500).send(`Internal Server Error ${err}`);
    }       
}

exports.clear = async(req,res) => {
    try{
        const db = getDB();
        await db.collection('Candidates').deleteMany({});
        await db.collection('Jobs').deleteMany({});
        await db.collection('Application').deleteMany({});
        res.status(200).send({message: "deleted successfully"});
    }catch(err){
        res.status(500).send({message: `Internal Server Error! ${err}`});
    }
}