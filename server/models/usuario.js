const mongoose = require('mongoose');

const uniquev = require('mongoose-unique-validator')
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

let Schema = mongoose.Schema;



let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol valido'
};

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        index: true,
        unique: true,
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligarotia']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

usuarioSchema.methods.toJSON = function() {

    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    //para que cuando regrese el json quite el paswword del json

    return userObject;
}

usuarioSchema.plugin(uniquev, { message: '{PATH} debe ser unico' });

module.exports = mongoose.model('Usuario', usuarioSchema)