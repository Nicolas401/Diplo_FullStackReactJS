const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;
const util = require("util");

app.use(express.json()); //permite el mapeo de la petición json a objeto js

//Conexion con mysql

const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'misLibros'
})

conexion.connect((error)=>{
    if(error){
        throw error;
    }

    console.log('Conexion con la base de datos mysql establecida');
});


const qy = util.promisify(conexion.query).bind(conexion);

// CRUD de Genero

app.get('/categoria', async (req, res) => {
    try{
        const query = 'SELECT id, nombre_genero FROM genero';
        const respuesta = await qy(query);
        res.send({"respuesta": respuesta});
    }
    catch(e){
        console.error(e.message);
        res.status(413).send({"Error": e.message});

    }
});

app.get('/categoria/:id', async (req, res) => {
    try{
        const query = 'SELECT * FROM genero WHERE id=?';
        const respuesta = await qy(query,[req.params.id]);
        
        if(respuesta.length == 0){
            throw new Error ("categoria no encontrada");
        } 
        
        res.send({"respuesta": respuesta});
               
    }
    catch(e){
        console.error(e.message);
        res.status(413).send({"Error": e.message});

    }
});

app.post('/categoria', async (req, res) => {
    try{
        // Veo si me mandan bien los datos

        if (!req.body.nombre_genero){
            throw new Error ('Falta enviar el nombre del genero');
        }

        let query = 'SELECT id FROM genero WHERE nombre_genero=?'
        let respuesta = await qy(query, [req.body.nombre_genero]);

        // Verifico que no exista ese nombre

        if (respuesta.length>0){
            throw new Error ('Ese genero ya existe');
        }

        query = 'INSERT INTO genero (nombre_genero) VALUE (?)';
        respuesta = await qy(query, [req.body.nombre_genero]);
        res.send({"respuesta": respuesta.insertId});
    }
    catch(e){
        console.error(e.message);
        res.status(413).send({"Error": e.message});
    }
});


//Servidor
app.listen(port, ()=>{
    console.log('servidor escuchando en el puerto', port);
})



// SELECT g.id , l.categoria_id FROM genero g JOIN libros l ON g.nombre_genero = l.categoria_id;