const getDB = require('../mongo-connect.js').getDB;

exports.applyJob = async(req, res) => {
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
                const job_applied = candidate.data.offers.find(job_applied => job_applied.id === parseInt(req.params.job_id));
                if(job_applied){
                    res.status(404).send({message: "Candidate has already applied for this job."});
                }else{
                    const updated_job = await db.collection('Jobs').updateOne(
                        {'data.job_id': parseInt(req.params.job_id)},
                        {$set: {
                            ...job,
                            data:{
                                ...job.data,
                                candidate_applied_info: [
                                    ...job.data.candidate_applied_info,
                                    {
                                        candidate_id: candidate.data.candidate_id,
                                        candidate_info: candidate.data.candidate_info,  
                                        stage: "Applied"
                                    }
                                ],
                                candidates_applied: job.data.candidates_applied + 1,
                                updated_at: new Date()
                            }
                        }}
                    );
                    const updated_candidate = await db.collection('Candidates').updateOne(
                        {'data.candidate_id': parseInt(req.params.candidate_id)},{
                            $set: {
                                ...candidate,
                                data:{
                                    ...candidate.data,
                                    offers_applied: candidate.data.offers_applied + 1,
                                    offers: [
                                        ...candidate.data.offers,
                                        {
                                            jobs_info: job.data.jobs_info,
                                            _id: job._id,
                                            job_id: job.data.job_id,
                                            company_id: job.data.company_id,                       
                                            status: "Applied"
                                        }
                                    ],
                                    updated_at: new Date()
                                }
                            }
                        }
                    );
                    res.status(200).send({message: "Candidate applied for job successfully.", job: updated_job, candidate: updated_candidate});
                }
            }  
        }
    }catch(err){
        res.status(500).send(`Internal Server Error ${err}`);
    }       
}