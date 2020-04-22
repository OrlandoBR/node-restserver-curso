const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Se crea y define el esquema del objeto Categoria que se estara guardando en BD de Mongo
let categoriaSchema = new Schema({
    descripcion: { type: String, unique: true, required: [true, "La descripcion es obligatoria"] },
    //Aqui hace referencia a otro esquema, es que es otra "tabla" en este caso la de Usuario
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
});

module.exports = mongoose.model('Categoria', categoriaSchema);