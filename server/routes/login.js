const express = require('express');
const app = express();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario'); //Este es el esquema

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);


app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {

        if (err) {
            res.status(500).json({
                ok: false,
                err
            })
        }

        if (!usuarioBD) {
            res.status(400).json({
                ok: false,
                err: {
                    message: "(Usuario) o contraseña incorrectos"
                }
            })
        }

        if (!bcrypt.compareSync(body.pass, usuarioBD.password)) {
            res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario o (contraseña) incorrectos"
                }
            })
        }

        let token = jwt.sign({
            usuario: usuarioBD
        }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            usuario: usuarioBD,
            token
        })

    })

})


//Configuraciones de google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    console.log(payload.name);
    console.log(payload.email);
    console.log(payload.picture);

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true

    }


}

app.post('/google', async(req, res) => {

    let token = req.body.idtoken;

    //Cuando se hace un posteo a google, nos regresa un token.
    let googleUser = await verify(token) //Se le agrega el wait porque es una promesa
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: {
                    msg: 'Se genero erro al verificar el token'
                }
            });
        });


    //Base de datos y crear informacion
    //verificar si no tengo usuario con ese correo en mi base de datos
    Usuario.findOne({ email: googleUser.email }, (err, usuarioBD) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        //si el usuario existe
        if (usuarioBD) {

            //Si esto regresa false e porque se registro con su correo normal y no por google.
            if (usuarioBD.google === false) {

                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usuar su autenticacion normal'
                    }
                })
            } else {

                //Si el usuario existe y fue por google se renueva su token personalizado mio.
                let token = jwt.sign({
                    usuario: usuarioBD
                }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioBD,
                    token
                })
            }
        } else {
            //Si el usuario no existe en nuestra base de datos y es la primera vez que se autentia
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            //Se graba el usuario en la base de datos.
            usuario.save((err, usuarioBD) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }

                let token = jwt.sign({
                    usuario: usuarioBD
                }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioBD,
                    token
                })
            })
        }
    })


})

module.exports = app;