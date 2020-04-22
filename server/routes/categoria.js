//importa la libreria de express para poder hacer peticiones http
const express = require('express');
//Manda llamar el middleware de autenticacion para que se verifique el usuario
let { verificaToken, verificaRole } = require('../middlewares/autenticacion');
//Levanta el servidor
let app = express();
//Importa el esquema categoria
let Categoria = require('../models/categoria');


//= = = A CONTINUACION SE CREAN LOS SERVICIOS = = =//
//==IMPORTANTE== Para que estas funciones esten disponibles, se tienen que agregar al archivo index.js
//con app.use(require('./categoria'));

//===Este servicio muestra todas las categorias.
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        //populate sirve para llenar colecciones. 
        //usuario es una objeto coleccion, y esta instruccion me sirve para mostrar los campos
        //Si tuviera otra coleccion podria agregar otro populate adicional
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                categorias
            })


        })

});

//===Muestra una categoria por ID
app.get('/categoria/:id', verificaToken, (req, res) => {
    //Categoria.findById()

    //Obtiene los parametros que se envian en la url
    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!categoriaDB) {
            res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            })
        }

        res.json({
            ok: true,
            categoriaDB
        })

    })


});

//= = = Crear nueva categoria por ID = = = 
//Se necesita enviar el verificaToken a la funcion pues verifica que sea un usuario autenticado
// cuando se hace el post a la funcion, si se autentica correctamente ese middleware regresa un objeto usuario,
// si no, no tendre acceso al req.usuario._id
app.post('/categoria', verificaToken, (req, res) => {

    //Obtenemos los parametros enviados en el body del request.
    let body = req.body;
    //Crea un objeto del tipo Categoria definido por el esquema que se importo al inicio.

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id,
    })

    //Se manda a guardar el esquema en BD
    categoria.save((err, categoriaDB) => {
        //Si se genera un error lo cachamos
        if (err) {
            res.status(500).json({
                ok: false,
                err
            })
        }
        //Se evalua si no creo la categoria
        if (!categoriaDB) {
            res.status(400).json({
                ok: false,
                err
            })
        }

        //Si llega hasta aqui es porque si se creo la categoria
        //Se envia la respuesta de esta peticion post
        res.json({
            ok: true,
            categoria: categoriaDB
        });

    })

});

//===Actualizar descripcion de categoria por ID
app.put('/categoria/:id', verificaToken, (req, res) => {

    //Obtiene los parametros que se envian en la url
    let id = req.params.id;
    //Obtiene los parametros que se envian en el dody.
    let body = req.body;
    //Crea una objeto que contiene un elemento que sera la nueva descripcion.
    let descCategoria = {
        //Obtiene la nueva descripcion ha actualizar
        descripcion: body.descripcion
    }

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {

        if (err) {
            res.status(500).json({
                ok: false,
                err
            })
        }
        //Se evalua si no actualizo la categoria
        if (!categoriaDB) {
            res.status(400).json({
                ok: false,
                err
            })
        }

        //Si llega hasta aqui es porque si actualizó la categoria
        //Se envia la respuesta de esta peticion put
        res.json({
            ok: true,
            categoria: categoriaDB
        });

    })

});

//===Eliminar categoria por ID
//Se agregan 2 middlewares para validar el token activo y para validar que el usuario sea admin_rol
app.delete('/categoria/:id', [verificaToken, verificaRole], (req, res) => {
    //Solo administrador puede eliminar categoria.

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, { new: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            })
        }

        res.json({
            ok: true,
            message: 'Categoria Borrada'
        })

    })

});



//Exporta los objetos para que sean visibles en la aplicacion.
module.exports = app;