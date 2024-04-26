const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
const { v4: uuidv4 } = require('uuid');
// Import the variable from file1.js
 // Now you can use the imported variable
 const port = 80;
// Establish connection to database
const {createPool}= require('mysql2');
const { error } = require('console');
const pool=createPool({
    host:'localhost',
    user:'root',
    password:'waleed1086',
    database:'MED',
    connectionLimit:100
})

// Define paths for static files
const publicDirectoryPath = path.join(__dirname, 'src');

app.use('/css', express.static(__dirname + '/css'));
app.use('/images', express.static(__dirname + '/images'));
app.use(express.static('src'));
// Endpoints
app.get('/', (req, res) => {
    res.sendFile('cover.html', { root: publicDirectoryPath });
});

app.get('/home', (req, res) => {
    res.sendFile('home.html', { root: publicDirectoryPath });
});

app.get('/contact', (req, res) => {
    res.sendFile('contact.html', { root: publicDirectoryPath });
});

app.get('/services', (req, res) => {
    res.sendFile('services.html', { root: publicDirectoryPath });
});

app.get('/doctors', (req, res) => {
    res.sendFile('doctors.html', { root: publicDirectoryPath });
});

app.get('/SignUp', (req, res) => {
    res.sendFile('signup.html', { root: publicDirectoryPath });
});
app.get('/SignUp/patient', (req, res) => {
    res.sendFile('patientinfo.html', { root: publicDirectoryPath });
});
app.get('/SignUp/doctor', (req, res) => {
    res.sendFile('doctorinfo.html', { root: publicDirectoryPath });
   
});

app.get('/login', (req, res) => {
    res.sendFile('login.html', { root: publicDirectoryPath });
});
// Contact us form submit krne k lie
app.use(express.urlencoded());
app.post('/contact',(req,res)=>{
        cid=uuidv4();
       uname=req.body.name;
      uemail=req.body.email;
      uphone=req.body.phone;
      umess=req.body.message;
      const sql = 'INSERT INTO ContactUs (CID,Name,Email,PNO,Message) VALUES (?, ?, ?, ?,?)';
      const values = [cid,uname,uemail,uphone,umess];
    
      pool.query(sql,values,(err,suc)=>{
        if (err) {
            console.log('Error',err);
            res.sendStatus(500);  
        } else {
            console.log('Data Inserted successfully');
            res.sendStatus(200);  

        }
      })
     
})
// Signup khapat
let form_data;      //Abhi global variables use kr raha but aage sessions explore krne hain 
                    // cuz global variables cause errors when working on large scale 
let userid;         //asynchronously

app.post('/Signup', (req, res) => {
    const { role } = req.body;
    userid=uuidv4();
    form_data=req.body;
    console.log(form_data);
     if (role === 'doctor') {
      res.redirect('/signup/doctor');
    } else {
      res.redirect('/signup/patient');
    }
  });

app.post('/signup/patient',(req,res)=>{
    patientd=uuidv4();
    const {firstname,lastname,email,password,gender}=form_data;
    console.log(req.body);
    const { age,weight,height,disease, Allergies, medicalHistory,treatment} = req.body;
    const user_query='INSERT INTO Users (UserID, PositionID, FirstName, LastName, Email, Password, Gender)VALUES (?,?,?,?,?,?,?)';
    const values1=[userid,3,firstname,lastname,email,password,gender];
    const patient_query='INSERT INTO Patients (PatientID, UserID, Age, Weight, Height,Disease,Allergies)VALUES (?,?,?,?,?,?,?)';    
    const values2=[patientd,userid,age,weight,height,disease,Allergies];
    const med_query='Insert into healthrecords(ehrid,patientid,MedicalHistory,Treatment,status)values(?,?,?,?,?)';
    
    pool.query(user_query,values1,(err,SUC)=>{
        if (err) {
            console.log('Error:',err);
        } else {
            console.log('Data inserted successfully');
         }
    })
    pool.query(patient_query,values2,(err,SUC)=>{
        if (err) {
            console.log('Error:',err);
        } else {
            console.log('Data inserted successfully');
        }
    })
    
    for (let int = 0; int < medicalHistory.length-1; int++) {
        const values3=[uuidv4(),patientd,medicalHistory[int],treatment[int],'past'];
        console.log('int=',medicalHistory.length);
        pool.query(med_query,values3,(err,SUC)=>{
            if (err) {
                console.log('Error:',err);
            } else {
                console.log('Data inserted successfully');
            }
        })
        
    }
    res.sendStatus(200);
})
app.post('/signup/doctor',(req,res)=>{

})

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log()
});
