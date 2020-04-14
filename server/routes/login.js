const express = require('express');
const app = express();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario'); //Este es el esquema


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



module.exports = app;