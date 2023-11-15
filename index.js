const express = require('express');
const bodyParser = require('body-parser');
const { mongoConnect } = require('./mongo-connect.js');

const auth = require('./auth/authentication.js');
const candidate = require('./candidates/candidates.js');
const jobs = require('./jobs/jobs.js');
const apply = require('./jobs/apply.js');

const app = express();

const multer = require('multer');
const { getStorage } = require('firebase/storage');

const storage = getStorage();
const upload = multer({storage: multer.memoryStorage()}); 


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}))
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
}); 


app.post('/register', auth.register);
app.post('/login', auth.login);
app.get('/logout', auth.logout);
app.get('/admin', auth.verifyToken, auth.admin);
app.get('/companies', auth.verifyToken, auth.getCompanies);
app.post('/companies', auth.verifyToken, auth.postCompanies);

//Candidates
app.get('/candidates', auth.verifyToken, candidate.getCandidates);
app.post('/candidates', auth.verifyToken, candidate.postCandidates);
app.get('/candidate/:id', auth.verifyToken, candidate.getCandidateById);
app.delete('/candidate/:id', auth.verifyToken, candidate.deleteCandidate);
app.put('/candidate/:id', auth.verifyToken, candidate.updateCandidate);
app.post('/upload_resume/:id', auth.verifyToken, upload.single('file'),( req, res )=>{candidate.uploadResume(req,res,storage)});
app.post('/upload_coverLetter/:id', auth.verifyToken, upload.single('file'),( req, res )=>{candidate.uploadCoverLetter(req,res,storage)});
app.post('/upload_image/:id', auth.verifyToken, upload.single('file'),( req, res )=>{candidate.uploadImage(req,res,storage)});


// Job openings
app.post('/jobs/:company_id', auth.verifyToken, auth.verifyCompany,jobs.postJobs);
app.get('/jobs/:company_id', auth.verifyToken, auth.verifyCompany, jobs.getJobs);
app.get('/jobs/:company_id/job/:job_id', auth.verifyToken, auth.verifyCompany, jobs.getJobById);
app.put('/jobs/:company_id/job/:job_id', auth.verifyToken, auth.verifyCompany, jobs.updateJobById);
app.delete('/jobs/:company_id/job/:job_id', auth.verifyToken, auth.verifyCompany, jobs.deleteJob);


// Job Application
app.put('/jobs/:company_id/job/:job_id/candidate/:candidate_id/apply', auth.verifyToken, auth.verifyCompany, apply.applyJob);


mongoConnect(()=>{
    app.listen(8000, ()=>{
        console.log('Server is running on 8000');
    })
})