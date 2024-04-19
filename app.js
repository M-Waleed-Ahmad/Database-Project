const express = require('express');
const app = express();
const port = 80;


// Loading Css and images
app.use('/styles', express.static(__dirname + '/styles'));
app.use('/images', express.static(__dirname + '/images'));


// Handling Requests



// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('__dirname:', __dirname);

});
