const express = require('express');
const ejs =  require('ejs');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {createPool}= require('mysql2');
const { v4: uuidv4 } = require('uuid');
const e = require('express');
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
        id:' ',
        mail:' ',
    }
    res.cookie('UserData',UserData,{httpOnly:true});
    res.render('Cover-Page',{UserData});
});
app.get('/logout',(req,res)=>{
    res.clearCookie('UserData')
    res.redirect('/');
})

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

app.get('/ask', (req, res) => {
    res.render('ask');
}); 

app.post('/doctors/consult', (req, res) => {
    console.log('Consult:',req.body);
    const sender=req.cookies.UserData.userid;
    const reciever=req.body.docToConsult.DoctorId;
    const chatid=uuidv4();
    const message=req.body.concern; 
    sql='INSERT INTO Messages (MessageID, ChatID, SenderID, ReceiverID, Message, Timestamp) VALUES (?,?,?,?,?,?)';
    const currentDate =  Date.now();
    sql2=`UPDATE Patients
    SET DoctorInCharge = '${reciever}'
    WHERE PatientId ='${sender}'
    `
    
    // Format the date and time string
    const formattedDate = formatDate(currentDate);
    const values=[uuidv4(),chatid,sender,reciever,message,formattedDate];
    console.log('Values:',values);
    executeQuery(sql,values)
    .then(suc=>{
        console.log('Message sent successfully');
        executeQuery(sql2)
        .then(suc=>{
            console.log('Doctor in charge updated');
            res.sendStatus(200);
        })
        .catch(err=>{
            console.log('ERR:',err);
        })
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

app.get('/login', (req, res) => {
    res.render('Login-Page');
  });

app.get('/admin', (req, res) => {
    if (req.cookies.UserData.loggedin==true)
        {
          const {id,mail,password}=req.cookies.UserData;
     
          res.render('Admin');
        }
        else
        {    
            res.send('login timing expired');
        } 
  });
  app.get('/admin:section', (req, res) => {
    const section = req.params.section;
    const {userid,mail}=req.cookies.UserData;
    console.log('sectsdsion:', req.params);

    if (section == '1') {
        sql=`SELECT Users.FirstName, Users.LastName, Doctors.*
        FROM Doctors
        JOIN Users ON Doctors.DoctorId = Users.UserID
        WHERE Doctors.AdminsApproval = 0;
        `
        executeQuery(sql)
        .then(Doctors => {
            res.json({ section, Doctors });
            console.log('Doctors:', Doctors);
        })
        .catch(error => {
            console.error('Error executing query:', error);
        });
    }
    else if (section == '2') {
        sql=`SELECT * FROM Doctors WHERE AdminsApproval = 1;`
        executeQuery(sql)
        .then(Doctors => {
            res.json({ section, Doctors });
            console.log('Doctors:', Doctors);
        })
        .catch(error => {
            console.error('Error executing query:', error);
        });
    }
    else if (section == '3') { 
        console.log('Queries');
        sql=`SELECT * from ContactUs;`
        executeQuery(sql)
        .then(Messages=>{
            console.log('Chats',Messages);
            res.json({ section,Messages}); // Render the template after data retrieval
        })
        .catch(error=>{
            console.error('Error executing query:',error);
        });
    }
    });
app.post('/admin/add',(req,res)=>{
    console.log('Add:',req.body);
    userid=uuidv4();
    const { firstName, lastName, email, password, gender, adminPhone, adminEmail } = req.body;
    const user_query = 'INSERT INTO Users (UserID, PositionID, FirstName, LastName, Email, Password, Gender) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values1 = [userid, 1, firstName, lastName, email, password, gender];
    const admin_query = 'INSERT INTO Admins (AdminID, PhoneNo, Email) VALUES (?, ?, ?)';
    const values2 = [userid, adminPhone, adminEmail];
    executeQuery(user_query, values1)
    .then(suc=>{
        executeQuery(admin_query, values2)
        .then(suc=>{
            res.sendStatus(200);
        })
        .catch(err=>{
            console.log('ERR:',err);
        })
    })
    .catch(err=>{
        console.log('ERR:',err);
    })
})
app.post('/admin/approve',(req,res)=>{
    console.log('Approve:',req.body);
    const {DoctorId}=req.body;
    const sql=`UPDATE Doctors
    SET AdminsApproval = 1
    WHERE DoctorId = '${DoctorId}';`
    executeQuery(sql)
    .then(suc=>{
        console.log('Approved');
        res.redirect('/admin');
    })
    .catch(err=>{
        console.log('ERR:',err);
    })
})
// ///////////////////////////////////////////////////////////////////////////////////
// Patient Profile page urls
app.get('/patient/update',(req,res)=>{
    const {userid,mail}=req.cookies.UserData;
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
        res.render('Patient-Update',{  Patient });
        
    console.log('Patient:', Patient);
    })
    .catch(error => {
    console.error('Error executing query:', error);
    });
})
app.post('/patient/update',(req,res)=>{
    const { age,height,weight, Allergies, disease, medicalHistory, treatment, contactName, contactPhoneNumber, contactEmail } = req.body;

    console.log("Height:", req.body);
    console.log("Allergies:", Allergies);
    console.log("Disease:", disease);
    console.log("Medical History:", medicalHistory);
    console.log("Treatment:", treatment);
    console.log("Contact Name:", contactName);
    console.log("Contact Phone Number:", contactPhoneNumber);
    console.log("Contact Email:", contactEmail);
    
    dhist=`delete from HealthRecords where PatientID="${req.cookies.UserData.userid}"`;
    dcon=`delete from EmergencyInfo where PatientID="${req.cookies.UserData.userid}"`;
    upat=`UPDATE Patients
    SET Age = '${age}',
        Weight = '${weight}',
        Height = '${height}',
        Disease = '${disease}',
        Allergies = '${Allergies}'
        WHERE PatientId = '${req.cookies.UserData.userid}';
    `
    emer=`INSERT INTO EmergencyInfo (EMID, PatientID, ContactName, ContactPNO, ContactMail)
    VALUES (?, ?, ?, ?, ?);
    `
    const med_query = 'INSERT INTO HealthRecords (EHRID, PatientID, MedicalHistory, Treatment, Status) VALUES (?, ?, ?, ?, ?)';

    emerValu=[uuidv4(),req.cookies.UserData.userid,contactName,contactPhoneNumber,contactEmail];
    executeQuery(upat)
    .then(suc=>{
        executeQuery(dhist)
        .then(suc=>{
            executeQuery(dcon)
            .then(suc=>{
                executeQuery(emer,emerValu)
                .then(suc=>{
                    for (let index = 0; index < medicalHistory.length; index++) {
                        const values3 = [uuidv4(), req.cookies.UserData.userid, medicalHistory[index], treatment[index], 'past'];
                        executeQuery(med_query,values3)
                        .then(suc=>{
                            res.sendStatus(200);
                        })
                        .catch(err=>{
                            console.log('ERR:',err);
                        })
                    }
                })
                .catch(err=>{
                    console.log('ERR:',err);
                })
            })
        })
        .catch(err=>{
            console.log('Err:',err);
        })
    })
    .catch(err=>{
        console.log('ERR:',err);
    })
})


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
            A.DoctorID,
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
     sq=`Select * from Prescriptions;`
     executeQuery(sq)
     .then(Prescriptions=>{
        sql=`
        select U.FirstName,U.LastName,d.DoctorId,d.Specialization,d.Qualification 
        from 
        doctors d
        Inner Join Users U on d.DoctorId=U.UserID;`;
        executeQuery(sql)
        .then(Docs=>{
            console.log('Succeed:',Docs);
            sql2=`select Disease from Patients
            where PatientID='${req.cookies.UserData.userid}'`
            executeQuery(sql2)
            .then(Diseases=>{
                console.log("Prescription,",Prescriptions);
                res.json({Docs,Diseases,Prescriptions});
            })
            .catch(err=>{
                console.log('Error:',err);
            })
        })
        .catch(err=>{
            console.log('Error:',err);
        })
     })
     .catch(err=>{
        console.log("Err:",err);
     })
    console.log('Prescriptions');

    }
    else if (section == '5') {
        console.log('Support Community');
        sql=`Select * from Questions;`
        executeQuery(sql)
        .then(questions=>{
            console.log("Questions:",questions);
            res.json({ questions }); // Render the template after data retrieval    
        })
        .catch(err=>{
            console.log('ERR:',err);
        })
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

app.post('/patient/chat/delete',(req,res)=>{
    console.log('POk:',req.body);
    const {chatId}=req.body;
    const sql=`Delete from Messages where ChatID='${chatId}'`;
    executeQuery(sql)
    .then(suc=>{
        console.log('Deleted');
        res.redirect('/patient');
    })
    .catch(err=>{
        console.log('ERR:',err);
    })
});
app.post('/patient/prescription/delete',(req,res)=>{
    console.log('POk:',req.body);
    const {presId}=req.body;
    const sql=`Delete from Prescriptions where PrescriptionID='${presId}'`;
    executeQuery(sql)
    .then(suc=>{
        console.log('Deleted');
        res.redirect('/patient');
    })
    .catch(err=>{
        console.log('ERR:',err);
    })
});

app.post('/patient/addPrescription',(req,res)=>{
    console.log('Hi',req.body);
    const {doctor,disease,medication,dosage,frequency,remaining}=req.body;
    addpr=`INSERT INTO Prescriptions (PrescriptionID, Disease, DoctorID,PatientID, Treatments, Dosage, frequency, RemainingQuantity)
    VALUES(?,?,?,?,?,?,?,?)`
    value=[uuidv4(),disease,doctor,req.cookies.UserData.userid,medication,dosage,frequency,remaining]
    executeQuery(addpr,value)
    .then(suc=>{        
        res.sendStatus(200);
    })
    .catch(err=>{
        console.log('ERR:',err);
    })
    
});
app.get('/patient/qna',(req,res)=>{
    console.log('q',req.query.qid);
    sql=`Select * from answers where qid='${req.query.qid}'`
    executeQuery(sql)
    .then(answers=>{
        executeQuery(`Select question_statement from questions where qid='${req.query.qid}'`)
        .then(question=>{
            console.log(question[0],"s",answers);
            res.render('Qna-Page',{question,answers});

        })
        .catch(err=>{
            console.log('ERR:',err);
        })
    })
    .catch(err=>{
        console.log('ERR:',err);
    })
});
app.post('/patient/qna',(req,res)=>{
    
    sql=`INSERT INTO Answers (answerid, patientid, qid, answer_statement) VALUES(?,?,?,?)`
    value=[uuidv4(),req.cookies.UserData.userid,req.query.qid,req.body.answer];
    console.log('rq',value);
    executeQuery(sql,value)
    .then(r=>{
        res.sendStatus(200);
    })
    .catch(err=>{
        console.log('ERR:',err);
    })
})
app.post('/patient/ask',(req,res)=>{
    sql=`insert into Questions(qid,patientid,question_statement) Values(?,?,?)`
    values=[uuidv4(),req.cookies.UserData.userid,req.body.question];
    console.log('req',values);
    executeQuery(sql,values)
    .then(suc=>{
        res.redirect('/patient');
    })
    .catch(err=>{
        console.log("ERR:",err);
    })
})
app.post('/patient/appointment/cancel',(req,res)=>{
    a=req.body.appointmentId.appointmentId;
    d=req.body.appointmentId.did;

    console.log('Delete:',a,d);
    s=`Delete from Appointments where AppointmentId="${a}"`;
    executeQuery(s)
    .then(suc=>{
        console.log('Deleted');
        const currentDate =  Date.now();
        const formattedDate = formatDate(currentDate);
        values=[uuidv4(),uuidv4(),req.cookies.UserData.userid,d,formatDate]
        sq=`INSERT INTO Messages (MessageID, ChatID, SenderID, ReceiverID, Message, Timestamp) VALUES (?,?,?,?,?,?)`
        executeQuery(sq,values)
        .then(suc=>{
            console.log("Message Send");
        })
        .catch(err=>{
            console.log('ERR',err);
        })
        res.redirect('/patient');
    })
    .catch(err=>{
        console.log('ERR:',err);
    })

})



// Doctor APis
app.get('/doctor', (req, res) => {
    if (req.cookies.UserData.loggedin==true)
        {
            const {id,mail,password}=req.cookies.UserData;
            res.render('Doctor-Profile');
     
        }
        else
        {    
            res.send('login timing expired');
        }  
});

app.get('/doctor:section', (req, res) => {
    const section = req.params.section;
    const {userid,mail}=req.cookies.UserData;
    console.log('sectsdsion:', req.params);

    if (section == '1') {
        console.log('Profile Page:', section);
        const sql = `SELECT D.*, U.FirstName, U.LastName
        FROM Doctors AS D
        JOIN Users AS U ON D.DoctorId = U.UserID
        WHERE u.email = ?;
        `

        executeQuery(sql,mail)
        .then(Doctor => {
            ps=`
            SELECT P.*, U.FirstName, U.LastName
            FROM Patients AS P
            JOIN Users AS U ON P.PatientId = U.UserID
            WHERE P.DoctorInCharge = '${userid}';;
            `
            executeQuery(ps)
            .then(Patients=>{
                console.log('Doctor:', Doctor);
                console.log('Patient:', Patients);
                res.json({ section, Doctor,Patients });
            })
            .catch(err=>{
                console.log("ERR:",err);
            })
        })
        .catch(error => {
            console.error('Error executing query:', error);
        });
                
    }
     else if (section == '2') {
        sql=`
        SELECT A.*, U.FirstName AS PatientFirstName, U.LastName AS PatientLastName
        FROM Appointments AS A
        JOIN Users AS U ON A.PatientID = U.UserID
        WHERE A.DoctorID = '${userid}';`
        executeQuery(sql)
        .then(Appointments => {
            patients=`
            SELECT P.*, U.FirstName, U.LastName
            FROM Patients AS P
            JOIN Users AS U ON P.PatientId = U.UserID
            WHERE P.DoctorInCharge = '${userid}';`
            executeQuery(patients)
            .then(patients=>{

                res.json({ section, Appointments,patients});
                console.log('Appointment:', Appointments);
                console.log('Patient:', patients);
                   })
            .catch(err=>{
                console.log('Error:',err);
            });
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
     sq=`Select * from Prescriptions;`
     executeQuery(sq)
     .then(Prescriptions=>{
        sql=`
        select U.FirstName,U.LastName,d.DoctorId,d.Specialization,d.Qualification 
        from 
        doctors d
        Inner Join Users U on d.DoctorId=U.UserID;`;
        executeQuery(sql)
        .then(Docs=>{
            console.log('Succeed:',Docs);
            sql2=`select Disease from Patients
            where PatientID='${req.cookies.UserData.userid}'`
            executeQuery(sql2)
            .then(Diseases=>{
                console.log("Prescription,",Prescriptions);
                res.json({Docs,Diseases,Prescriptions});
            })
            .catch(err=>{
                console.log('Error:',err);
            })
        })
        .catch(err=>{
            console.log('Error:',err);
        })
     })
     .catch(err=>{
        console.log("Err:",err);
     })
    console.log('Prescriptions');

    }
    
 
});
app.post('/doctor/appointment/add',(req,res)=>{
    console.log("Appointment Details",req.body);
    sql=`Insert into Appointments(AppointmentId,PatientID,DoctorID,CaseDescription,AppointmentDateTime) Values(?,?,?,?,?)`;

    values=[uuidv4(),req.body.patient,req.cookies.UserData.userid,req.body.case,req.body.Date+' '+req.body.time+':00'];
    console.log('val',values);
    executeQuery(sql,values)
    .then(suc=>{
        console.log("Yay it works");
        mess=`Insert into Messages(MessageID,ChatID,SenderID,ReceiverID,Message) values(?,?,?,?,?)`
        values=[uuidv4(),uuidv4(),req.cookies.UserData.userid,req.body.patient,'Dear Patient , Your Appointment has been set']
        executeQuery(mess,values)
        .then(suc=>{
            console.log("Appointment has been set");

        })
        .catch(err=>{
            console.log('ERR:',err);
        })
    })

    .catch(err=>{
        console.log('ERR:',err);
    })
    res.redirect('/doctor');
})
app.post('/doctor/appointment/delete',(req,res)=>{
    d=req.body.appointmentId;
    console.log('Delete:',req.body);
    s=`Delete from Appointments where AppointmentId="${d}"`;
    executeQuery(s)
    .then(suc=>{
        console.log('Deleted');
        res.redirect('/doctor');
    })
    .catch(err=>{
        console.log('ERR:',err);
    })
})

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
    console.log('asd',form_data);
    const { firstname, lastname, email, password, gender } = form_data;
    const { age, weight, height, disease, Allergies, medicalHistory, treatment, contactName, contactPhoneNumber, contactEmail  } = req.body;
    const user_query = 'INSERT INTO Users (UserID, PositionID, FirstName, LastName, Email, Password, Gender) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values1 = [userid, 3, firstname, lastname, email, password, gender];
    const patient_query = 'INSERT INTO Patients (PatientID, Age, Weight, Height, Disease, Allergies) VALUES (?, ?, ?, ?, ?, ?)';
    const values2 = [userid, age, weight, height, disease, Allergies];
    const med_query = 'INSERT INTO HealthRecords (EHRID, PatientID, MedicalHistory, Treatment, Status) VALUES (?, ?, ?, ?, ?)';
   
    emer=`INSERT INTO EmergencyInfo (EMID, PatientID, ContactName, ContactPNO, ContactMail)
    VALUES (?, ?, ?, ?, ?);
    `
    emerValu=[uuidv4(),userid,contactName,contactPhoneNumber,contactEmail];

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
                                executeQuery(emer,emerValu)
                                .then(suc=>{
                                    console.log('Ss');
                                    res.sendStatus(200);
                                    
                                })
                                console.log('Health record inserted successfully');
                            }
                        });
                    }
                }
            });
        }
    });



});

app.post('/signup/doctor',(req,res)=>{
    userid=uuidv4();
     const {firstname,lastname,email,password,gender}=form_data;
     console.log(req.body);
    const { LicenseNo,Experience,Qualification, institution, languages,Specialization} = req.body;
    const user_query='INSERT INTO Users (UserID, PositionID, FirstName, LastName, Email, Password, Gender)VALUES (?,?,?,?,?,?,?)';
    const values1=[userid,2,firstname,lastname,email,password,gender];
    const doctor_query='INSERT INTO Doctors (DoctorID, Specialization, Qualification, LicenseNo,Institute,Experience,Language,AdminsApproval)VALUES(?,?,?,?,?,?,?,?)';    
    const values2=[userid,Specialization,Qualification,LicenseNo,institution, Experience, languages,0git];
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
                    id:positionid,
                    mail:email,
                }
                res.cookie('UserData', UserData, { httpOnly: true });
                if (positionid=='3') {
                    
                     res.redirect('/patient');
                } 
                else if (positionid=='2'){
                    res.redirect('/doctor');
                }
                else{
                    res.redirect('/admin');
                }
                        
            }
            
        }
    });
})


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
 
});
