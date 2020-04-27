const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');

let app = express();

app.use(fileUpload({ useTempFiles: true }));

let Usuario = require('../models/usuario');
let Producto = require('../models/producto');

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    let tiposvalidos = ['productos', 'usuarios'];
    if (tiposvalidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos validos son ' + tiposvalidos.join(', '),
                tipo: tipo
            }
        })
    }


    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningun archivo'
            }
        });
    }
    //obtenemos el objeto con el archivo. "archivo" es el nombre del parametro que viene en la peticion post
    let archivo = req.files.archivo;
    console.log(archivo);

    //Extensones permitidas
    let extensionesValidas = ['jpg', 'png', 'gif', 'jpeg'];
    let subextension = archivo.name.split('.');
    let extension = subextension[subextension.length - 1];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
                ext: extension
            }
        })
    }

    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    //Indica la ruta a donde se colocara el archivo
    archivo.mv(path.resolve(`uploads/${tipo}/${nombreArchivo}`), (err) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //imagenUsuario(id, res, nombreArchivo, tipo);
        cargaImagen(id, res, nombreArchivo, tipo);

    })
})

//===Esta ya no se usa pues se usa la generica
/*
function imagenUsuario(id, res, nombreArchivo, tipo) {

    Usuario.findById(id, (err, usuarioBD) => {

        if (err) {
            borraArchivo(nombreArchivo, tipo);
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!usuarioBD) {
            borraArchivo(nombreArchivo, tipo);
            return res.status(400).json({
                ok: false,
                err
            })
        }

        borraArchivo(usuarioBD.img, tipo);

        usuarioBD.img = nombreArchivo;

        usuarioBD.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        })

    });
}
*/
function cargaImagen(id, res, nombreArchivo, tipo) {

    let esquemaUsar;
    if (tipo === 'usuarios')
        esquemaUsar = Usuario;
    else
        esquemaUsar = Producto;

    esquemaUsar.findById(id, (err, esquemaBD) => {

        if (err) {
            borraArchivo(nombreArchivo, tipo);
            return res.status(500).json({
                ok: false,
                err: { msj: `Error al buscar en el esquema ${esquemaUsar}` }
            })
        }

        if (!esquemaBD) {
            borraArchivo(nombreArchivo, tipo);
            return res.status(400).json({
                ok: false,
                err
            })
        }

        borraArchivo(esquemaBD.img, tipo);

        esquemaBD.img = nombreArchivo;

        console.log(esquemaBD);

        esquemaBD.save((err, esquemaGuardado) => {
            res.json({
                ok: true,
                esquema: esquemaGuardado,
                img: nombreArchivo
            })
        })

    });
}

function borraArchivo(nombreImagen, tipo) {

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`)
    console.log(pathImagen);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen)
    }
}

module.exports = app;