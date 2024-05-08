const express = require('express');
const ejs =  require('ejs');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {createPool}= require('mysql2');
const { v4: uuidv4 } = require('uuid');
  const port = 80;
    
function formatDate(dateString) {
    // Parse the input date string
    const date = new Date(dateString);

    // Extract date components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Format the date string in the desired format
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return formattedDate;
}




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
function executeQuery(query, values = []) {
    return new Promise((resolve, reject) => {
        // Execute your query here
        // For example:
        pool.query(query, values, (err, result) => {
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
    UserData={
        userid:' ',
        loggedin:false,
        username:' ',
        mail:' ',
    }
    res.cookie('UserData',UserData,{httpOnly:true});
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
    
   executeQuery(`SELECT COUNT(*) AS ApprovedDoctorsCount
    FROM doctors
    WHERE AdminsApproval = 1; -- Assuming 1 indicates approval and 0 indicates not approved`)
    .then(DoctorsCount => {
        console.log('DoctorsCount:', DoctorsCount);
        count=DoctorsCount
    })
    .catch(error => {
        console.log('Error:',error)
    });
    executeQuery('SELECT * FROM doctors WHERE AdminsApproval = 1;')
     .then(doctors => {
        console.log(doctors);
        const userinfo=req.cookies.UserData;
        res.render('Doctors-Page', { doctors,userinfo,count}); // Render the template after data retrieval
    })
    .catch(error => {
        console.error('Error executing query:', error);
    });
});
app.post('/doctors/consult', (req, res) => {
    console.log('Consult:',req.body);
    const sender=req.cookies.UserData.userid;
    const reciever=req.body.docToConsult.DoctorId;
    const chatid=uuidv4();
    const message=req.body.concern; 
    sql='INSERT INTO Messages (MessageID, ChatID, SenderID, ReceiverID, Message, Timestamp) VALUES (?,?,?,?,?,?)';
    const currentDate =  Date.now();
    
    // Format the date and time string
    const formattedDate = formatDate(currentDate);
    const values=[uuidv4(),chatid,sender,reciever,message,formattedDate];
    console.log('Values:',values);
    executeQuery(sql,values)
    .then(suc=>{
        console.log('Message sent successfully');
        res.sendStatus(200);
    })
    .catch(err=>{
        console.error('Error executing query:',err);
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

// ///////////////////////////////////////////////////////////////////////////////////
// Patient Profile page urls

app.get('/patient', (req, res) => {
    
    if (req.cookies.UserData.loggedin==true)
    {
      const {id,mail,password}=req.cookies.UserData;
 
      res.render('Patient-Profile'); // Render the template after data retrieval
     }
    else
    {    
        res.send('login timing expired');
    } 
    
});
app.get('/patient:section', (req, res) => {
    const section = req.params.section;
    const {userid,mail}=req.cookies.UserData;
    console.log('sectsdsion:', req.params);

    if (section == '1') {
        console.log('Profile Page:', section);
        const sql = `SELECT Users.UserID, Users.PositionID, Users.FirstName, Users.LastName,
                    Users.Email,Patients.PatientId, Patients.Age, Patients.Weight, Patients.Height
                    ,Patients.Disease, Patients.Allergies, Patients.DoctorInCharge,
                    HealthRecords.EHRID, HealthRecords.MedicalHistory, HealthRecords.Treatment, HealthRecords.Status,
                    EmergencyInfo.EMID, EmergencyInfo.ContactName, EmergencyInfo.ContactPNO,
                    EmergencyInfo.ContactMail FROM Users LEFT JOIN Patients ON Users.UserID = Patients.PatientId 
                    LEFT JOIN HealthRecords ON Patients.PatientId = HealthRecords.PatientID LEFT JOIN EmergencyInfo ON Patients.PatientId = EmergencyInfo.PatientID
                    WHERE Users.Email = ?`

        executeQuery(sql,mail)
        .then(Patient => {
            res.json({ section, Patient });
            console.log('Patient:', Patient);
        })
        .catch(error => {
            console.error('Error executing query:', error);
        });
                
    }
     else if (section == '2') {
        sql=`SELECT 
            A.AppointmentID,
            A.CaseDescription,
            A.AppointmentDateTime,
            UP.FirstName AS PatientFirstName,
            UP.LastName AS PatientLastName,
            UD.FirstName AS DoctorFirstName,
            UD.LastName AS DoctorLastName
            FROM 
                Appointments A
                INNER JOIN Users UP ON A.PatientID = UP.UserID
                INNER JOIN Users UD ON A.DoctorID = UD.UserID
            WHERE UP.UserID = ?; `
        executeQuery(sql,userid)
        .then(Appointments => {
            res.json({ section, Appointments });
            console.log('Appointments:', Appointments);
        })
        .catch(error => {
            console.error('Error executing query:', error);
        });
    }
    else if (section == '3') { 
        console.log('Consultations');
        sql=`SELECT DISTINCT
        ChatID,
        OtherUser.FirstName AS OtherPersonFirstName,
        OtherUser.LastName AS OtherPersonLastName
    FROM
        (
            SELECT
                ChatID,
                CASE
                    WHEN SenderID = '${userid}' THEN ReceiverID
                    ELSE SenderID
                END AS OtherUserID
            FROM
                Messages
            WHERE
                SenderID = '${userid}'
                OR ReceiverID = '${userid}'
        ) AS Interactions
    INNER JOIN Users AS OtherUser ON OtherUser.UserID = Interactions.OtherUserID
    WHERE
        OtherUserID <> '${userid}';`
        executeQuery(sql)
        .then(Messages=>{
            console.log('Chats',Messages);
            res.json({ section,Messages}); // Render the template after data retrieval
        })
        .catch(error=>{
            console.error('Error executing query:',error);
        });
    }
        else if (section == '4') {
        console.log('Prescriptions');

        res.json({ section }); // Render the template after data retrieval
    }
    else if (section == '5') {
        console.log('Support Community');

        res.json({ section }); // Render the template after data retrieval
    }
 
});
app.get('/patient/chat',(req,res)=>{
    const section = req.query.section 
    const chat = req.query.ChatId 
    const lname = req.query.lname 
    sql=`SELECT MessageID, SenderID, ReceiverID, Message, Timestamp
        FROM Messages
        WHERE ChatID = '${chat}'
        ORDER BY Timestamp ASC;`
        executeQuery(sql)
        .then(Chat=>{
            uid=req.cookies.UserData.userid;
            console.log('Chat=',Chat,'USERID',uid);
            res.json({ section, Chat , uid});
        })
        .catch(err=>{
            console.error('Error executing query:', err);

        })
    console.log('section:', req.query.ChatId);
    
});
app.post('/patient/chat/send',(req,res)=>{

    const chat=req.body.importantInfo.chatId;
    const sender=req.body.importantInfo.sender;
    const reciever=req.body.importantInfo.receiver;
    console.log('section:', req.body)
    const {message}=req.body;
    const time=req.body.Timestamp;
    const sql='INSERT INTO Messages (MessageID, ChatID, SenderID, ReceiverID, Message, Timestamp) VALUES (?,?,?,?,?,?)';
    values=[uuidv4(),chat,sender,reciever,message,time];
    executeQuery(sql,values)
    .then(suc=>{
        console.log('Message sent successfully');
        res.sendStatus(200);
    })
    .catch(err=>{
        console.error('Error executing query:', err);
    }) 
    console.log('values',values);
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

app.post('/Signup', (req, res) => {
    const { role } = req.body;
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
app.post('/signup/patient', (req, res) => {
    userid = uuidv4();
    const { firstname, lastname, email, password, gender } = form_data;
    const { age, weight, height, disease, Allergies, medicalHistory, treatment } = req.body;
    const user_query = 'INSERT INTO Users (UserID, PositionID, FirstName, LastName, Email, Password, Gender) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values1 = [userid, 3, firstname, lastname, email, password, gender];
    const patient_query = 'INSERT INTO Patients (PatientID, Age, Weight, Height, Disease, Allergies) VALUES (?, ?, ?, ?, ?, ?)';
    const values2 = [userid, age, weight, height, disease, Allergies];
    const med_query = 'INSERT INTO HealthRecords (EHRID, PatientID, MedicalHistory, Treatment, Status) VALUES (?, ?, ?, ?, ?)';

    pool.query(user_query, values1, (err, SUC) => {
        if (err) {
            console.log('Error:', err);
        } else {
            console.log('User data inserted successfully');
            pool.query(patient_query, values2, (err, SUC) => {
                if (err) {
                    console.log('Error:', err);
                } else {
                    console.log('Patient data inserted successfully');
                    for (let int = 0; int < medicalHistory.length; int++) { // Removed -1 from the loop condition
                        const values3 = [uuidv4(), userid, medicalHistory[int], treatment[int], 'past'];
                        console.log('int=', medicalHistory.length);
                        pool.query(med_query, values3, (err, SUC) => {
                            if (err) {
                                console.log('Error:', err);
                            } else {
                                console.log('Health record inserted successfully');
                            }
                        });
                    }
                }
            });
        }
    });



    res.sendStatus(200);
});

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
    pool.query('select userid,email,password,positionid from users',(err,result)=>{
        if (err) {
            console.log('Error:',err);
        } else {
            result.forEach(element => {
                if (element.email===email && element.password===password) {
                    console.log('Login Successfull'); 
                    check=true;
                    id=element.userid;
                    username=element.userid;
                    positionid=element.positionid;
                }
            });
            if (check==false) {
                console.log('Login Unsuccessfull');    
            }
            else{
                console.log('Login s',username,positionid); 

                UserData={
                    userid:id,
                    loggedin:true,
                    username:username,
                    mail:email,
                }
                res.cookie('UserData', UserData, { httpOnly: true });
                if (positionid===3) {
                console.log('Login s'); 
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
