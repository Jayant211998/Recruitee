//ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC6NIsVvarVAEN+AKyfffapDYb0fj8iZqNB7WlxYsZ/SngYHvHJxmX5TuoQlMqq4xKY+OD2S9EJAi15vTg8cgGnOADvnj0tDOkcj6YSNZpQLFugpskgboKwK0tluo75lVeIjZW0xORN2MTAK3HQauOLl23XPsGcEJWf0Yd+QcS6SSulD3qKUPHjDFMS9lWbcY7fZ+MRWRxAqKlHDRXI3Kt3Bz3etL2xuvsojI6HgkdlN1EDHgRL47gzkQ9eih0+UiLQSBlGr2ahIvFOEipz4GN9oeCFRqlb2i/3+W+2GqlxiOpivZJ/+RkoiGkNosYneF6sMA0J2BSLPs5xAnZZ8XAS0ro/LT1KcumvwvGB5Htf7Af2CYM1Vbp78xuN4LcdbSsGlIFqm8aWsW1fMcY305YdYEJMR1640eQffykUE1QtyTe+HwRetZb1XJeewf4eo66C5Zsdphquab8sdKVmim/gLwbQFu6AVvoTkrMkHikpobEMOWfXfYjdVER1tir1IRR7YRbixLgce2DCK9sGg3X/whpsokJkYcbW7geuQ+yL3IWGS2gl3WTArenUjDuSn+cFVF4Ofe10ztvunKsHYtepM2CKDnYoBZtPOzYf3ANiRYZyRkBrySPk1V2SeB94sgZHmyAWfBNby0Xn9UT4UIbfGerv0lMPuUYc5IRXMhwTuQ==

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
app.post('/company/:company_id', auth.verifyToken, auth.verifyCompany,jobs.postJobs);
app.get('/company/:company_id', auth.verifyToken, auth.verifyCompany, jobs.getJobs);
app.get('/company/:company_id/job/:job_id', auth.verifyToken, auth.verifyCompany, jobs.getJobById);
app.put('/company/:company_id/job/:job_id', auth.verifyToken, auth.verifyCompany, jobs.updateJobById);
app.delete('/company/:company_id/job/:job_id', auth.verifyToken, auth.verifyCompany, jobs.deleteJob);


// Job Application
app.put('/company/:company_id/job/:job_id/candidate/:candidate_id/apply', auth.verifyToken, auth.verifyCompany, apply.apply);
app.get('/company/:company_id/job/:job_id/apply', auth.verifyToken, auth.verifyCompany, apply.applyCandidate);
app.get('/company/:company_id/candidate/:candidate_id/apply', auth.verifyToken, auth.verifyCompany, apply.applyJob);
app.put('/company/:company_id/job/:job_id/candidate/:candidate_id/promote', auth.verifyToken, auth.verifyCompany, apply.promote);
app.put('/company/:company_id/job/:job_id/candidate/:candidate_id/reject', auth.verifyToken, auth.verifyCompany, apply.reject);


mongoConnect(()=>{
    app.listen(8000, ()=>{
        console.log('Server is running on 8000');
    })
})