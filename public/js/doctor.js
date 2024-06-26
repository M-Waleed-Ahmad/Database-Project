const sidebar = document.getElementById('sidebar');
const hamburger = document.getElementById('hamburger');

hamburger.addEventListener('click', () => {
    sidebar.style.left = sidebar.style.left === '0px' ? '-250px' : '0px';
});


// Function to fetch data for the selected section using AJAX
function fetchData(section) {
    // AJAX request
    const url = '/doctor?section=' + section; // Update URL based on the selected section
    window.history.pushState({}, '', url); // Update URL without reloading the page

    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/doctor' + section, true);

    // Set up onload handler
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 400) {
            // On successful response, update the content of the section
            const responseData = JSON.parse(xhr.responseText);
            updateSectionContent(section, responseData);
            console.log(responseData);
        } else {
            console.error('Request failed with status:', xhr.status);
        }
    };

    // Set up onerror handler
    xhr.onerror = function() {
        console.error('Request failed');
    };

    // Send the request
    xhr.send();
}
 // Function to update the content of the section based on the fetched data
function updateSectionContent(section, data) {
    const sectionElement = document.getElementById(`div${section}`);

    switch (section) {
        case '1':
        for (let int = 2; int <= 5; int++) {
            document.getElementById(`div${int}`).style.display = 'none';
        }
        sectionElement.style.display = 'block';
        sectionElement.innerHTML=`
            <div id="div1" class="div1">
            <div  class="profile">
                <!-- Profile Image -->
                <div class="sect-1">
                    <div style="display: flex;justify-content: center;">
                        <img src="../images/profile-default.svg" alt="Profile Picture">
                    </div>
                    <!-- Basic and Emergency Information -->
                    <div class="info">
                    
                        <p><strong>Name:</strong>  ${data.Doctor[0].FirstName}</p>
                        <p><strong>Blood Type:</strong> O+</p>
                        <p><strong>Approval:</strong>${data.Doctor[0].AdminsApproval}</p>
                        <p><strong>Specialization:</strong>${data.Doctor[0].Specialization} </p>
                        <p><strong>Qualification:</strong>${data.Doctor[0].Specialization} </p>
                     </div>
                </div>
        
                    <!-- Current and Past Health Records (On the Right Side) -->
                <div id="rec" class="sect-2 records" >
                    <br>
                </div>
            </div>
        </div>        
        `;
        const sec = document.getElementById(`rec`);
        n=data.Patients.length;
        if (n==0) {
            sec.innerHTML=`<h2>You have no patients</h2>`
        } else {
            
        for (let int = 0; int < n; int++) {
            sec.innerHTML += `
            <p>
                <strong>Medical History:</strong>  ${data.Patients[int].FirstName}
                <strong>Treatment:</strong>  ${data.Patients[int].FirstName}
            </p>           
        `;
        }
        }
        console.log(data);

        break;
        case '2':
             sectionElement.style.display = 'block';
            for (let int = 1; int <= 5; int++) {
                if (int==2) {
                continue;   
                }
                document.getElementById(`div${int}`).style.display = 'none';

            }

            sectionElement.innerHTML=`
            <button id="create-app" class="btn">Create Appointments</button>

            <div class="appoint">
                    <div class="Appointments-1">

                    </div>
                    <div class="appointments-2">
                    </div>
            </div>
        </div>
            `;
            console.log(data); 
            createApp=document.getElementById('create-app');
            const appointments1Section = document.querySelector('.Appointments-1');
            n=data.Appointments.length;
            console.log(n);
            for (let int = 0; int < n; int++) {
                appointments1Section.innerHTML += `
                <div apid="${data.Appointments[int].AppointmentID}" class="doc" id="doc${int}" onclick="displayData('doc${int}')">
                <p><strong>Patient Name:</strong> ${data.Appointments[int].PatientFirstName}</p>
                <p><strong>Sir Name:</strong> ${data.Appointments[int].PatientLastName}</p>
                <p><strong>Case:</strong> ${data.Appointments[int].CaseDescription}</p>
                <p><strong>Date:</strong> ${data.Appointments[int].AppointmentDateTime}</p>
                </div>
                    `;

            }
             createApp.addEventListener('click',function(event){
                app=document.createElement('div');
                app.innerHTML=`
                <form  action="/doctor/appointment/add" method="post" id="appointments-form">
                <label  for="patient">Patient:</label>

            
                
                <label for="time">Time:</label>
                <input type="time" id="time" name="time" required>
                <label for="case">Case Description:</label>
                <input type="text" id="case" name="case" required>
                <label for="Date">Date:</label>
                <input type="date" id="Date" name="Date" required>
          
                <button type="submit">Add Appointment</button>
            </form>
`                 
                console.log('APp',app);
                patientOptions=document.createElement('select');
                console.log('asd',patientOptions);
                for (let index = 0; index < data.patients.length; index++) {
                    patientOptions.innerHTML+=`
                <option value="${data.patients[index].PatientId}">${data.patients[index].FirstName+" "+data.patients[index].LastName}</option>
`
                } 
                patientOptions.setAttribute('name', `patient`);
                console.log(patientOptions,'wad');
                app.classList.add('add-appointment');
                var secondChild = app.childNodes[1];
                news=secondChild.childNodes[1];
                news.insertAdjacentElement('afterend',patientOptions);
                console.log('new',news)
                sectionElement.appendChild(app);
            })

        break;
        case '3':
        sectionElement.style.display = 'block';
            for (let int = 1; int <= 5; int++) {
                if (int==3) {
                continue;   
                }
                document.getElementById(`div${int}`).style.display = 'none';

            }
            console.log('ada');
            sectionElement.innerHTML=`
            <header>
            <h1>Consultations</h1>
            </header>
            <main>
                <div  class="chat">
                    <h2>Your Chats</h2>
                    <div id="chats" class="chat-list">
                        <!-- Chat previews will be dynamically added here -->
                    </div>
                </div>
                <div id="conversation" >
                    <div class='bye'>
                        <h2>Conversation</h2>
                     </div>     
                    <div id="chat-container" class="messages">
                            <!-- Messages will be loaded here dynamically -->
                    </div>
                
                </div>
            </main> 
            `
            chat=document.getElementById('chats');
            console.log('chats  ',data.Messages)
            n=data.Messages.length;
            for (let index = 0; index < n; index++) {
                chat.innerHTML+=`
                    <button class="bt" onclick="fetchChat({ ChatID: '${data.Messages[index].ChatID}', lastName: '${data.Messages[index].OtherPersonLastName}' })">
                        <div class="chat-box">
                            <p>Patient: ${data.Messages[index].OtherPersonFirstName+" "+data.Messages[index].OtherPersonLastName}</p>
                        </div>
                    </button>
                    `                    
            }
            console.log('chats  ',chat)
        
            break;
        case '4':
        sectionElement.style.display = 'block';
            for (let int = 1; int <= 5; int++) {
                if (int==4) {
                continue;   
                }
                document.getElementById(`div${int}`).style.display = 'none';

            }
            console.log('ada');
            sectionElement.innerHTML=`
            <!-- Prescriptions -->

    <main>
        <section class="prescription-list">
            <h2>Your Prescriptions</h2>
            <ul>
                <!-- Prescriptions will be dynamically added here -->
            </ul>
        </section>
     
    </main>

`   

        
            // Update Prescriptions section with data
            break;
   
        default:
            // Handle invalid section
            break;
    }
}

// Function to handle clicking on section links
function handleSectionClick(element) {
    const section = element.getAttribute('data-section'); // Get the section number from data attribute
    fetchData(section); // Fetch data for the selected section
}

// Function to initialize the page
function initializePage() {
    // Add event listeners to section links
    const sectionLinks = document.querySelectorAll('.item');
    sectionLinks.forEach(link => {
        link.addEventListener('click', () => {
            handleSectionClick(link);
        });
    });
}

// Call initializePage() function when the page is fully loaded
window.addEventListener('load', initializePage);


    function toggleLine(element) {
        const line = document.querySelector('.line');
        const navItems = document.querySelectorAll('.item');
        
        const itemWidth = element.offsetWidth;
        const itemOffsetLeft = element.offsetLeft;
        const containerOffsetLeft = document.querySelector('.innernav2').offsetLeft; 
        line.style.width = itemWidth + 'px';
        line.style.transform = 'translateX(' + (itemOffsetLeft - containerOffsetLeft) + 'px)'; 
        
        navItems.forEach(item => {
            item.classList.remove('active');
        });

        element.classList.add('active');
    }

    let apids;  
    function displayData(docId) {
    const docElement = document.getElementById(docId);

    const name = docElement.querySelector('p:nth-child(1)').innerText;
    const caseInfo = docElement.querySelector('p:nth-child(2)').innerText;
    const date = docElement.querySelector('p:nth-child(3)').innerText;
    const appointmentId = docElement.getAttribute('apid');
    console.log('APIDS,',appointmentId);
    apids=appointmentId;
     sender=appointmentId;
    // Display the data in the appointments-2 section
    const appointments2Section = document.querySelector('.appointments-2');
    appointments2Section.innerHTML = `
    <h2>Appointment Details</h2>
    <p><strong>Patient Name:</strong> ${name}</p>
    <p><strong>Case:</strong> ${caseInfo}</p>
    <p><strong>Date:</strong> ${date}</p>
     <p><strong>Location:</strong> Shaka</p>
    <p><strong>Time:</strong> Shaka</p>
    <div style="margin-left:190px;">
        <button class="btn1"onclick="apOp()">Cancel</button>        
    </div>`;
}

function apOp(){
    fetch('/doctor/appointment/delete', {
        method: 'POST', // Assuming you want to update the database via a POST request
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            appointmentId: apids
        })
    })
    .then(response => {
        if (response.ok) {
            // Handle successful response
            console.log('Appointment cancelled successfully');
        } else {
            // Handle error response
            console.error('Failed to cancel appointment');
        }
    }) 
}

// This is part is for chats only
let importantInfo;
function fetchChat(lname){
    const url = '/doctor?section=3&lname=' + lname; // Update URL based on the selected section
    window.history.pushState({}, '', url); // Update URL without reloading the page
    const xhr = new XMLHttpRequest();
    console.log(xhr);
    xhr.open('GET', '/patient/chat?section=3&lname='+lname.lastName+'&ChatId='+lname.ChatID, true);

    // Set up onload handler
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 400) {
            // On successful response, update the content of the section
            const responseData = JSON.parse(xhr.responseText);
            loadChat( responseData,lname.ChatID);
        } else {
            console.error('Request failed with status:', xhr.status);
        }
    };

    // Set up onerror handler
    xhr.onerror = function() {
        console.error('Request failed');
    };
    // Send the request
    xhr.send();
}

function loadChat(messages,chatId) {
const messagesDiv = document.getElementById('chat-container');
console.log('test',messages); 
if (messages.uid==messages.Chat[0].SenderID) {
    sender=messages.Chat[0].SenderID;
    receiver=messages.Chat[0].ReceiverID;
    console.log('UserID',messages.uid);
    console.log('Message',messages.Chat[0]);
    console.log('receiver',receiver);
    console.log('sender',sender);
} else if(messages.uid==messages.Chat[0].ReceiverID){
    sender=messages.Chat[0].ReceiverID;
    receiver=messages.Chat[0].SenderID;
    console.log('UserID',messages.uid);
    console.log('Message',messages.Chat[0]);
    console.log('1receiver',receiver);
    console.log('1sender',sender);
}
importantInfo = {
    sender: sender,
    receiver: receiver,
    chatId: chatId
};
const sendbox=`<div class="input-container">
            <textarea id="message-input" placeholder="Type your message..."></textarea>
            <button id="send-button" onclick="sendMessage();">Send</button>
        </div>`;
const adjacentDiv = messagesDiv.nextElementSibling;
if (adjacentDiv) {
    adjacentDiv.remove();
}

    messagesDiv.insertAdjacentHTML('afterend',sendbox);        // Clear previous messages
    messagesDiv.innerHTML = '';

    document.querySelector('.bye').innerHTML=`
    <h2>Conversation</h2> 
    <button onclick=chatDel("${chatId}")>
    <svg  class="cross" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
    </svg>
    </button>`

// Loop through each message and create HTML elements to display them
messages.Chat.forEach(message => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    const senderName = message.SenderID === `${messages.uid}` ? 'You' : 'Patient'; // Assuming 'dcf46ee6-ff2b-4dc9-bea9-c4772ad38055' is the patient's ID
    if (message.SenderID === `${messages.uid}`) {
        messageDiv.classList.add('sent');
    } else {
        messageDiv.classList.add('received');
    } 
    const d=mtime1(mtime(message.Timestamp));
    messageDiv.innerHTML = `
        <div><strong>${senderName}</strong>: ${message.Message}</div>
        <div class="timestamp">${d}</div>
    `;
    messagesDiv.appendChild(messageDiv);

    console.log('d',d);
    
});

// Scroll to bottom of messages container
messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendMessage() {
const messageInput = document.getElementById('message-input');
console.log(messageInput);
const message = messageInput.value;
const chatContainer = document.getElementById('chat-container');
console.log('qq',chatContainer.firstChild);
const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add('sent');
    messageDiv.innerHTML = `
        <div><strong>You</strong>: ${message}</div>
        <div class="timestamp">Just now</div>
    `;
    chatContainer.appendChild(messageDiv);

    messageInput.value = '';
    chatContainer.scrollTop = chatContainer.scrollHeight;
    const currentDate =  Date.now();

    console.log('importantInfo',currentDate);
    // Format the date and time string
    const formattedDate = formatDate(currentDate);
    console.log('importantInfo',formattedDate);
    ;
// Send the message to the server
fetch('/patient/chat/send', {
    method: 'POST', // Assuming you want to update the database via a POST request
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        message: message,
        importantInfo: importantInfo,
        Timestamp: formattedDate
    })
})
.then(response => {
    if (response.ok) {
        // Handle successful response
        console.log('Database updated successfully');
    } else {
        // Handle error response
        console.error('Failed to update database');
    }
})
.catch(error => {
    // Handle network error
    console.error('Network error:', error);
});
} 

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

function mtime(dateString){
const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
}
function mtime1(dateString){
const date = new Date(dateString);

const hours = date.getHours();
const ampm = hours >= 12 ? 'PM' : 'AM';
const twelveHourFormat = hours % 12 || 12;
const minutes = String(date.getMinutes()).padStart(2, "0");
const seconds = String(date.getSeconds()).padStart(2, "0");

const formattedTime = `${twelveHourFormat}:${minutes}:${seconds} ${ampm}`;
return formattedTime;
}
function chatDel(chatId){
    fetch('/patient/chat/delete', {
        method: 'POST', // Assuming you want to update the database via a POST request
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chatId: chatId
        })
    })
}
