const express = require('express');
const app = express();

const bcrypt = require('bcrypt');
const _underscore = require('underscore'); //libreria que trae muchas funciones de javascript y el profe recomeinda revisar.

const Usuario = require('../models/usuario'); //Este es el esquema


//si tuviera mas modulos el archivo de autenticaion, en este caso
// solo traeriamos la funcion de varificaToken.
//Para traernos todo se podria hacer con
// const verificaion = require('../middlewares/autenticacion');
const { verificaToken, verificaRole } = require('../middlewares/autenticacion');


app.get('/usuario', [verificaToken, verificaRole], function(req, res) {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);


    let condicional = { estado: true };

    Usuario.find(condicional, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {

            if (err) {
                res.status(400).json({
                    ok: false,
                    err
                })
            }

            Usuario.countDocuments(condicional, (err, conteo) => {
                res.json({
                    ok: true,
                    registros: conteo,
                    usuarios

                })
            })

        })



})

app.post('/usuario', [verificaToken, verificaRole], function(req, res) {

        let body = req.body;

        let usuario = new Usuario({
            nombre: body.nombre,
            email: body.email,
            password: bcrypt.hashSync(body.password, 10),
            role: body.role
        })


        usuario.save((err, usuarioDB) => {
            if (err) {
                res.status(400).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                usuario: usuarioDB
            })
        });

    })
    //Reliza la actualizacion de un registro !
app.put('/usuario/:id', [verificaToken, verificaRole], function(req, res) {

    let id = req.params.id;
    let body = _underscore.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    })


})

app.delete('/usuario/:id', [verificaToken, verificaRole], function(req, res) {

    let id = req.params.id;
    //let body = _underscore.pick(req.body, ['estado']);
    //body.estado = false;

    //se puede poner el objeto que se va a actualizar directamente {estado:false}
    Usuario.findByIdAndUpdate(id, { estado: false }, { new: true }, (err, usuarioBorrado) => {

        if (err) {
            res.status(400).json({
                ok: false,
                err
            })
        }

        if (usuarioBorrado === null) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });

    })

    /*
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            res.status(400).json({
                ok: false,
                err
            })
        }

        if (usuarioBorrado === null) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        })

    })
    */

})

module.exports = app;