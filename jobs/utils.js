exports.updateStatus = (status) => {
    if(status === "Applied"){
        return "Phone Interview"
    }else if(status === "Phone Interview"){
        return "Onsite Interview"
    }else if(status === "Onsite Interview"){
        return "Evaluation"
    }else if(status === "Evaluation"){
        return "Offer"
    }else if(status === "Offer"){
        return "Hired"
    }
}

exports.updateJobStatus = (arr, id) => { 
    const updatedArr =  arr.map((job) => {
        if(job.job_id === id){
            return {
                _id: job._id,
                company_id: job.company_id,
                job_id: job.job_id,
                jobs_info: job.jobs_info,
                status: updateStatus(job.status)
            }
        }else{
            return job;
        }
    })
    return updatedArr;
}

exports.updateCandidateStatus = (arr, id) => {
    const updatedArr =  arr.map((candidate) => {
        if(candidate.candidate_id === id){
            return {
                candidate_id: candidate.candidate_id,
                candidate_info: candidate.candidate_info,
                stage: updateStatus(candidate.stage)
            }
        }else{
            return candidate;
        }
    })
    return updatedArr;
}

exports.countHiredCandidate = (arr) => {
    let count = 0;
    arr.forEach((candidate) => {
        if(candidate.stage === "Hired"){
            count++;
        }
    })
    return count;
}

exports.rejectCandidateStatus = (arr, id) => {
    const updatedArr =  arr.map((candidate) => {
        if(candidate.candidate_id === id){
            return {
                candidate_id: candidate.candidate_id,
                candidate_info: candidate.candidate_info,
                stage: "Rejected"
            }
        }else{
            return candidate;
        }
    })
    return updatedArr;
}

exports.rejectJobStatus = (arr, id) => { 
    const updatedArr =  arr.map((job) => {
        if(job.job_id === id){
            return {
                _id: job._id,
                company_id: job.company_id,
                job_id: job.job_id,
                jobs_info: job.jobs_info,
                status: "Rejected" 
            }
        }else{
            return job;
        }
    })
    return updatedArr;
}

exports.getQuery = (parameter) => {
    const query = {};
    for(let key in parameter){
        if( key === 'city'){
            query['data.jobs_info.address.city'] =  parameter[key];
        }if( key === 'state'){
            query['data.jobs_info.address.state'] =  parameter[key];
        }if( key === 'employment_type'){
            query['data.jobs_info.employment_type'] =  parameter[key];
        }if( key === 'title'){
            query['data.jobs_info.title'] =  parameter[key];
        }if( key === 'candidates_applied'){
            const value = JSON.parse(parameter[key]);
            query['data.candidates_applied'] = {$gte: value[0], $lte: value[1]};
        }if( key === 'candidates_applied'){
            const value = JSON.parse(parameter[key]);
            query['data.jobs_info.number_of_openings'] = {$gte: value[0], $lte: value[1]};
        }if( key === 'relevant_experience'){
            const value = JSON.parse(parameter[key]);
            query['data.jobs_info.relevent_experience_in_years'] = {$lte: value};
        }if( key === 'salary'){
            const value = JSON.parse(parameter[key]);
            query['data.jobs_info.number_of_openings'] = {$gte: value[0], $lte: value[1]};
        }if( key === 'created_after'){
            query['data.created_at'] = {$gte: new Date(parameter[key])};
        }if( key === 'remote'){
            query['data.jobs_info.address.remote'] = JSON.parse(parameter[key]);
        }
    } 
    return query;
}