const express = require('express');
const ejs =  require('ejs');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {createPool}= require('mysql2');
const { v4: uuidv4 } = require('uuid');
const port = 80;




app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.urlencoded());

// Establish connection to database
const pool=createPool({
    host:'localhost',
    user:'root',
    password:'waleed1086',
    database:'MED',
    connectionLimit:100
})
// Assuming you have a function to execute your query, for example:
function executeQuery(query) {
  return new Promise((resolve, reject) => {
      // Execute your query here
      // For example:
      pool.query(query, (err, result) => {
          if (err) {
              reject(err); // Reject the promise if there's an error
          } else {
              resolve(result); // Resolve the promise with the result
          }
      });
  });
}

// Usage:


// Endpoints
app.get('/', (req, res) => {
    res.render('Cover-Page');
});

app.get('/home', (req, res) => {
    res.render('Home-Page');
});

app.get('/contact', (req, res) => {
    res.render('Contactus-Page');
});

app.get('/services', (req, res) => {
    res.render('Services-Page');
});

app.get('/doctors', async(req, res) => {
  executeQuery('SELECT * FROM doctors')
  .then(doctors => {
    console.log(doctors);
    res.render('Doctors-Page', { doctors }); // Render the template after data retrieval

  })
  .catch(error => {
      console.error('Error executing query:', error);
  });
});

app.get('/SignUp', (req, res) => {
  res.render('Signup-Page');
});
app.get('/SignUp/patient', (req, res) => {
  res.render('Patient-Signup');
});
app.get('/SignUp/doctor', (req, res) => {
  res.render('Doctor-Signup');    
});
app.get('/patient', (req, res) => {
   
    if (req.cookies.cookiedata.loggedin==true) {
      res.render('Patient-Profile');
    } else {
        
        res.send('login timing expired');
    } 
    
});
app.get('/doctor', (req, res) => {
    res.render('Doctor-Profile');
    
});

app.get('/login', (req, res) => {
  res.render('Login-Page');
});
// Contact us form submit krne k lie
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
    // console.log(form_data);
    
    let check=true;
    pool.query('select email from users',(err,result)=>{
        if (err) {
            console.log('Error signup:',err);
        } 
        else
        {
            result.forEach(element => {
                if (element.email==req.body.email) {
                    check=false;
                }
            });
                
            console.log(check);
            
            if (check === true)
            {
                if (role === 'doctor') 
                {
                    res.redirect('/signup/doctor'); 
                }
                else 
                {
                    res.redirect('/signup/patient');
                }
            }
            else{
                res.sendStatus(500);
            }

        }
    })
  });

app.post('/signup/patient',(req,res)=>{
    patientd=uuidv4();
    const {firstname,lastname,email,password,gender}=form_data;
    // console.log(req.body);
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
    doctorid=uuidv4();
     const {firstname,lastname,email,password,gender}=form_data;
     console.log(req.body);
    const { LicenseNo,Country,Experience,Qualification, institution, languages,Specialization} = req.body;
    const user_query='INSERT INTO Users (UserID, PositionID, FirstName, LastName, Email, Password, Gender)VALUES (?,?,?,?,?,?,?)';
    const values1=[userid,3,firstname,lastname,email,password,gender];
    const doctor_query='INSERT INTO Doctors (DoctorID, UserID, Specialization, Qualification, LicenseNo,Institute,Experience,Language)VALUES(?,?,?,?,?,?,?,?)';    
    const values2=[doctorid,userid,Specialization,Qualification,LicenseNo,institution, Experience, languages];
    pool.query(user_query,values1,(err,SUC)=>{
        if (err) {
            console.log('Error:',err);
        } else {
            console.log('Data inserted successfully');
         }
    })
    pool.query(doctor_query,values2,(err,SUC)=>{
        if (err) {
            console.log('Error:',err);
        } else {
            console.log('Data inserted successfully');
        }
    })
    
    res.sendStatus(200);
})

app.post('/login',(req,res)=>{
    const {email,password}=req.body;
    check=false;
    let username = ''; // Initialize username variable
    let positionid = ''; // Initialize positionid variable
    pool.query('select firstName,email,password,positionid from users',(err,result)=>{
        if (err) {
            console.log('Error:',err);
        } else {
            result.forEach(element => {
                if (element.email===email && element.password===password) {
                    console.log('Login Successfull'); 
                    check=true;
                    username=element.firstname;
                    positionid=element.positionid;
                }
            });
            if (check==false) {
                console.log('Login Unuccessfull');    
            }
            else{
                const cookieData = {
                    id: username,
                    mail: email,
                    loggedin: true
                };
                res.cookie('cookiedata', cookieData, { maxAge: 900000, httpOnly: true });
                if (positionid===3) {
                    res.redirect('/patient');
                } 
                else {
                    res.redirect('/patient');
                }
                        
            }
            
        }
    });
})


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
 
});
