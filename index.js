const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();


//CORS
app.use(cors());

//Directorio Publico
app.use(express.static('public'));

//Parseo y lectura del Body
app.use(express.json());

/* app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
}) */

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})