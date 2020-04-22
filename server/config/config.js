//---
//Puerto
process.env.PORT = process.env.PORT || 3000;
//----

//-----
//Entorno
//-----
//HEROKU dice el maestro que le da valor a esta variable,
//que nos sirve para identificar si esta produccion 
//o es desarrollo pues esa variable no tiene ningun dato.
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//=======================
//Vencimiento del token
//=======================
//60 segs
//60 min
//24 hrs
//30 dias
//process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;
process.env.CADUCIDAD_TOKEN = '48h';

//=======================
//SEED DE AUTENTICAION
//=======================
process.env.SEED_TOKEN = process.env.SEED_TOKEN || 'este-es-el-seed-desarrollo';


//----
//Base de Datos
//----
let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    //urlDB = 'mongodb+srv://#####:#####@cluster0-ucna3.mongodb.net/cafe?retryWrites=true&w=majority'
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

//==================
//Google Client ID
//==================
process.env.CLIENT_ID = process.env.CLIENT_ID || '157276824971-01gvcqul29to0q30kmfrku3kkn5gp9fl.apps.googleusercontent.com';