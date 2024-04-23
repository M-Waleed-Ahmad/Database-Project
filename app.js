const express = require('express');
const path = require('path');
const app = express();

const port = 80;

// Define paths for static files
const publicDirectoryPath = path.join(__dirname, 'src');

app.use('/css', express.static(__dirname + '/css'));
app.use('/images', express.static(__dirname + '/images'));

// Endpoints
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: publicDirectoryPath });
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

app.get('/login', (req, res) => {
    res.sendFile('login.html', { root: publicDirectoryPath });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
