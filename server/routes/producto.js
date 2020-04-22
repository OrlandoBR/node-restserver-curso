const express = require('express');
const { verificaToken, verificaRole } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');

//=== Buscar productos
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;
    //Expresion regular, la i es para que no identifique entre mayusculas y minusculas
    //RegExp es una funcion de JS regular
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                productos
            })

        })

})


//=== Obtener todos los prodcutos
app.get('/producto', verificaToken, (req, res) => {

    //Para el paginado se envia desde que registro se desea cargar
    let desde = req.query.desde || 0;
    desde = Number(desde);

    Producto.find({ disponible: true })
        .skip(desde) //Se salta los registros hasta el numero indicado (paginacion)
        .limit(5)
        .sort('nombre')
        //populate sirve para llenar colecciones. 
        //usuario es una objeto coleccion, y esta instruccion me sirve para mostrar los campos
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                productos
            })


        })


});

//=== Obtener productos por ID
app.get('/producto/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    //Busca Producto por ID
    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoBD) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            //Se revisa is existe el producto
            if (!productoBD) {
                res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El ID no es correcto'
                    }
                })
            }

            res.json({
                ok: true,
                productoBD
            })

        })

});

//=== Crear producto
app.post('/producto', [verificaToken], (req, res) => {

    //obtenemos el objeto de body con los parametros
    let body = req.body;
    //Se crea objeto a partir del esquema
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.preciouni,
        descripcion: body.descripcion,
        //disponible: true,  //}tiene valor por default en el esquema
        categoria: body.categoria,
        usuario: req.usuario._id
    })

    //Se manda a guardar el esquema en BD
    producto.save((err, productoDB) => {
        //Si se genera un error lo cachamos
        if (err) {
            res.status(500).json({
                ok: false,
                err
            })
        }
        //Se evalua si no creo el producto
        if (!productoDB) {
            res.status(400).json({
                ok: false,
                err
            })
        }

        //Si llega hasta aqui es porque si se creo el producto
        //Se envia la respuesta de esta peticion post
        res.status(201).json({
            ok: true,
            producto: productoDB
        });

    })


});

//=== Actualizar producto
app.put('/producto/:id', [verificaToken], (req, res) => {

    let id = req.params.id;
    let body = req.body;

    let produ = {
        nombre: body.nombre,
        precioUni: body.preciouni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        //usuario: req.usuario._id
    }

    Producto.findByIdAndUpdate(id, produ, { new: true, runValidators: true }, (err, productoBD) => {

        if (err) {
            res.status(500).json({
                ok: false,
                err
            })
        }
        //Se evalua si no actualizo la categoria
        if (!productoBD) {
            res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            })
        }

        //Si llega hasta aqui es porque si actualizó la categoria
        //Se envia la respuesta de esta peticion put
        res.json({
            ok: true,
            producto: productoBD
        });

    })
});

//=== Borrar producto, realmnte actualiza el estatus de disponibilidad del producto.
app.delete('/producto/:id', [verificaToken, verificaRole], (req, res) => {

    let id = req.params.id;

    Producto.findById(id, (err, productoBD) => {

        if (err) {
            res.status(500).json({
                ok: false,
                err
            })
        }
        //Se evalua si no actualizo la categoria
        if (!productoBD) {
            res.status(400).json({
                ok: false,
                err
            })
        }

        //Actualiza el campo en el esquema productoBD
        productoBD.disponible = false;

        //Se guarda el esquema modificado
        productoBD.save((err, productoBorrado) => {

            if (err) {
                res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                producto: productoBorrado,
                message: 'Producto Borrado'
            });

        })
    })
});



module.exports = app;