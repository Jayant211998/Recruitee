const { MongoClient } = require('mongodb');

let db;
const mongoConnect= (callback) =>{
    MongoClient.connect("mongodb+srv://jayantgawali99:Jayant@recruitee.krkaqjv.mongodb.net/?retryWrites=true&w=majority")
    .then((client)=>{
        console.log("Connected....");
        db = client.db("Recruitee");
        callback();
    })
    .catch(err => console.log(err));
}
const getDB = () =>{
    if(db){
        return db;
    }
    throw new Error("Database not connected");
}

exports.mongoConnect = mongoConnect;
exports.getDB = getDB;