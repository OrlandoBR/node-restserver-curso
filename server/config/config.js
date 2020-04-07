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

//----
//Base de Datos
//----
let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb+srv://cafe-user:789456123@cluster0-ucna3.mongodb.net/cafe?retryWrites=true&w=majority'
}

process.env.URLDB = urlDB;