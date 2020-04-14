const jwt = require('jsonwebtoken');

// ====
//Verficar token
// ====
let verificaToken = (req, res, next) => {

    //obtiene el valor de la variable que viene en el head
    let token = req.get('token');

    //funcion del jwt que verifica la validez del webtoken.
    jwt.verify(token, process.env.SEED_TOKEN, (err, decoded) => {

        if (err) {
            return res.status(404).json({
                ok: false,
                err: {
                    message: "Token no valio"
                }
            });
        }

        req.usuario = decoded.usuario;
        next();

    })

}

//======
//Verifica Rol de usuario
//=======
let verificaRole = (req, res, next) => {

    //El objeto req.usuario ya es llenado 
    // en el llamado del middleware anterior 
    // req.usuario = decoded.usuario; 
    let perfil = req.usuario.role;

    if (perfil === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(404).json({
            ok: false,
            err: {
                message: "Tipo de usuario no valido"
            }
        });
    }

}
module.exports = {
    verificaToken,
    verificaRole
}