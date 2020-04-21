require('./config/config');
const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose')





const bodyParser = require('body-parser')
    // parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
    // parse application/json
app.use(bodyParser.json())

//habilitar carpeta public
//app.use(express.static(path.resolve(__dirname, '/public')))
app.use(express.static(__dirname + '/public'));


//configuracon global de rutas.
app.use(require('./routes/index.js'))


mongoose.connect(process.env.URLDB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}, (err, res) => {

    if (err) console.log(err);;

    console.log('Base de datos online');
})


app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto ', process.env.PORT)
})