const express = require('express');
const path=require('path')
 const app = express();

const port = 80;


// Loading Css and images
app.use('/styles', express.static(__dirname + '/styles'));
app.use('/images', express.static(__dirname + '/images'));


// Pug stuff
app.set('view engine','pug');
app.set('views',path.join(__dirname,'src'));

// Endpoints
app.get()


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('__dirname:', __dirname);

});
