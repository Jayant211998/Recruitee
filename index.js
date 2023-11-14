const express = require('express');
const bodyParser = require('body-parser');
const { mongoConnect } = require('./mongo-connect.js');

const auth = require('./auth/authentication.js');
const candidate = require('./candidates/candidates.js');

const app = express();

// File Upload Loacally

// const multer = require('multer');
// const storage = multer.diskStorage({
//     destination: function (req, file, cb)  {
//         cb(null, "./uploads"); //error=> null destination=> uploads
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.originalname);
//     }
// });
// const upload = multer({storage: storage}); 
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended:false}))


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
app.post('/upload/:id', auth.verifyToken, candidate.uploadDocuments);
// app.post('/upload/:id', upload.single('file'),(req,res)=>{
//     console.log('file uploaded');
//     res.status(200).send("File uploaded")
// })
mongoConnect(()=>{
    app.listen(8000, ()=>{
        console.log('Server is running on 8000');
    })
})