    // Event listener to toggle the sidebar
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger');

    hamburger.addEventListener('click', () => {
        sidebar.style.left = sidebar.style.left === '0px' ? '-250px' : '0px';
    });

    
    // Function to fetch data for the selected section using AJAX
    function fetchData(section) {
        // AJAX request
        const url = '/patient?section=' + section; // Update URL based on the selected section
        window.history.pushState({}, '', url); // Update URL without reloading the page

        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/patient' + section, true);

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
            for (let int = 2; int < 5; int++) {
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
                        
                            <p><strong>Name:</strong>  ${data.Patient[0].FirstName}</p>
                            <p><strong>Blood Type:</strong> O+</p>
                            <p><strong>Allergies:</strong>${data.Patient[0].Allergies} </p>
                            <p><strong>Medical Conditions:</strong>${data.Patient[0].Disease}</p>
                            <p><strong>Emergency Contact:</strong> ${data.Patient[0].Contactname}</p>
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
            n=data.Patient.length;
            for (let int = 0; int < n; int++) {
                sec.innerHTML += `
                <p>
                    <strong>Medical History:</strong>  ${data.Patient[int].FirstName}
                    <strong>Treatment:</strong>  ${data.Patient[int].FirstName}
                    <strong>Status:</strong>  ${data.Patient[int].FirstName}
                </p>           
            `;
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
                <button class="btn">Create Appointments</button>
    
                <div class="appoint">
                        <div class="Appointments-1">

                        </div>
                        <div class="appointments-2">
                        </div>
                </div>
            </div>
                `;
                console.log(data); 
                const appointments1Section = document.querySelector('.Appointments-1');
                n=data.Appointments.length;
                console.log(n);
                for (let int = 0; int < n; int++) {
                    appointments1Section.innerHTML += `
                    <div class="doc" id="doc${int}" onclick="displayData('doc${int}')">
                        <p><strong>Patient Name:</strong> ${data.Appointments[int].PatientFirstName}</p>
                        <p><strong>Doctor Name:</strong> ${data.Appointments[int].DoctorLastName}</p>
                        <p><strong>Case:</strong> ${data.Appointments[int].CaseDescription}</p>
                        <p><strong>Date:</strong> ${data.Appointments[int].AppointmentDateTime}</p>
                    </div>
                        `;

                }
            break;
            case '3':
            sectionElement.style.display = 'block';
                for (let int = 1; int <= 5; int++) {
                    if (int==3) {
                    continue;   
                    }
                    document.getElementById(`div${int}`).style.display = 'none';

                }
                sectionElement.innerHTML=`
                <header>
                <h1>To Consult with a new doctor\nkindly visit our doctors page and connect with
                    your desired doctor
                </h1>
                </header>
                <main>
                    <div  class="chat">
                        <h2>Your Chats</h2>
                        <div id="chats" class="chat-list">
                            <!-- Chat previews will be dynamically added here -->
                        </div>
                    </div>
                    <div id="conversation" >
                        <h2>Conversation</h2>
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
                                <p>Doctor: ${data.Messages[index].OtherPersonFirstName+" "+data.Messages[index].OtherPersonLastName}</p>
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
                sectionElement.innerHTML=`
                <header>
                    <h1>Prescriptions</h1>
                </header>
                <main>
                    <div class="prescription-list">
                        <h2>Your Prescriptions</h2>
                       
                    </div>
                    <div class="prescription-details">
                        <h2>Prescription Details</h2>
                        <form  action="/prescriptions/add" method="post" id="prescription-form">
                            <label  for="doctor">Doctor:</label>

                            <select id="doc-list" name="doctor" required>
                        
                            </select>
                            <label  for="disease">Disease:</label>

                            <select id="disease-list" name="disease" required>
                        
                            </select>  
                            <label for="medication">Medication:</label>
                            <input type="text" id="medication" name="medication" required>
                            <label for="dosage">Dosage:</label>
                            <input type="text" id="dosage" name="dosage" required>
                            <label for="frequency">Frequency:</label>
                            <input type="text" id="frequency" name="frequency" required>
                            <label for="remaining">Remaining Quantity:</label>
                            <input type="number" id="remaining" name="remaining" required>
                            <button type="submit">Add Prescription</button>
                        </form>
                    </div>
                </main>`;
                
                myPrescriptions=document.querySelector('.prescription-list');
                console.log('Presc',myPrescriptions);
                for (let index = 0; index < data.Prescriptions.length; index++) {
                    const div = document.createElement('div');
                    div.setAttribute('id', `prescription${index+1}`);
                    div.classList.add('prescription');
                    div.innerHTML=`
                    <p><strong>Disease:</strong>${data.Prescriptions[index].Disease}</p>
                    <p><strong>Treatment:</strong>${data.Prescriptions[index].Treatments}</p>
                    <p><strong>Dosage:</strong>${data.Prescriptions[index].Dosage}</p>
                    <p><strong>Frequency:</strong>${data.Prescriptions[index].frequency}</p>
                    <p><strong>Remaining Quantity:</strong> ${data.Prescriptions[index].RemainingQuantity}</p>
                    `
                    myPrescriptions.appendChild(div);
                }
                docOptions=document.getElementById('doc-list');
                for (let index = 0; index < data.Docs.length; index++) {
                    docOptions.innerHTML+=`
                <option value="${data.Docs[index].DoctorId}">${data.Docs[index].FirstName+" "+data.Docs[index].LastName+" "+data.Docs[index].Specialization}</option>
`
                } 
                diseaseOptions=document.getElementById('disease-list');

                for (let index = 0; index < data.Diseases.length; index++) {
                    diseaseOptions.innerHTML+=`
                <option value="${data.Diseases[index].Disease}">${data.Diseases[index].Disease}</option>
`
                }

                document.getElementById('prescription-form').addEventListener('submit', function(event) {
                    event.preventDefault(); // Prevent the default form submission
                    
                        const doctor = document.getElementById('doc-list').value;
                        const disease = document.getElementById('disease-list').value;
                        const medication = document.getElementById('medication').value;
                        const dosage = document.getElementById('dosage').value;
                        const frequency = document.getElementById('frequency').value;
                        const remaining = document.getElementById('remaining').value;

                        // Now you can use these variables to submit your form data via fetch or any other method

                        console.log('formdata:',doctor,disease,medication,dosage,frequency,remaining)
                        fetch('/patient/addPrescription', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: 
                            JSON.stringify({doctor,disease,medication,dosage,frequency,remaining})
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                        })
                        .then(data => {
                            this.reset();
                        })
                        .catch(error => {
                            // Handle error
                            console.error('Error adding prescription:', error);
                        });
                    });

            break;
            case '5':
            sectionElement.style.display = 'block';
                for (let int = 1; int <= 5; int++) {
                    if (int==5) {
                    continue;   
                    }
                    document.getElementById(`div${int}`).style.display = 'none';
                }
            sectionElement.innerHTML=`
                <main id="supportf">
                    <section class="ask-question">
                        <h2>Ask a Question</h2>
                        <form action="/patient/ask" method="post">
                            <textarea name="question" id="question" placeholder="Type your question here..." required></textarea>
                            <button type="submit">Submit</button>
                        </form>
                    </section>
                
                    <section class="recent-questions">
                        <h2>Recent Questions</h2>
                    </section>
                </main>`
                questionBox=document.querySelector('.recent-questions');
                console.log('Qestion',questionBox)
                for (let index = 0; index < data.questions.length; index++) {
                    const div = document.createElement('div');
                    div.setAttribute('id', `question${index+1}`);
                    div.classList.add('prescription');
                    div.innerHTML=`
                    <p><strong>User:</strong>${data.questions[index].patientid}</p>
                    <p><strong>Question:</strong>${data.questions[index].question_statement}</p>
                    `
                    questionBox.appendChild(div); 
                    div.addEventListener('click',()=>{
                        window.open('/patient/qna?qid=' + data.questions[index].qid, '_blank');
                    })                   
                }
            break;
            default:
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

        const appointmentsSection = document.querySelector('.appointments-2');
        console.log(appointmentsSection);
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const appointmentsRect = appointmentsSection.getBoundingClientRect();
            const originalTop = 20; // Original top position of appointments-2 section

            if (scrollTop > originalTop) {
                // Scrolling down
                appointmentsSection.style.position = 'fixed';
                appointmentsSection.style.top = '10%'; // Adjust as needed
            } else {
                // Scrolling up or at the top
                appointmentsSection.style.position = 'sticky';
            }
        });

        function displayData(docId) {
        const docElement = document.getElementById(docId);

        const name = docElement.querySelector('p:nth-child(1)').innerText;
        const caseInfo = docElement.querySelector('p:nth-child(2)').innerText;
        const date = docElement.querySelector('p:nth-child(3)').innerText;

        // Display the data in the appointments-2 section
        const appointments2Section = document.querySelector('.appointments-2');
        appointments2Section.innerHTML = `
        <h2>Appointment Details</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Case:</strong> ${caseInfo}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Doctor:</strong> Shaka</p>
        <p><strong>Location:</strong> Shaka</p>
        <p><strong>Time:</strong> Shaka</p>
        <div style="margin-left:40px;">
            <button class="btn1" ">Cancel</button>
            <button class="btn1" ">Confirm</button>
            <button class="btn1" ">Text</button>
            <button class="btn1" ">Set Reminder</button>        
        </div>`;

    }

    // This is part is for chats only
    let importantInfo;
    function fetchChat(lname){
        const url = '/patient?section=3&lname=' + lname; // Update URL based on the selected section
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
    
    } else if(messages.uid==messages.Chat[0].ReceiverID){
        sender=messages.Chat[0].ReceiverID;
        receiver=messages.Chat[0].SenderID;
 
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

    // Loop through each message and create HTML elements to display them
    messages.Chat.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        const senderName = message.SenderID === `${messages.uid}` ? 'You' : 'Doctor'; // Assuming 'dcf46ee6-ff2b-4dc9-bea9-c4772ad38055' is the patient's ID
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

