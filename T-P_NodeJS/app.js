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
        const query = 'SELECT * FROM genero';
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
            throw new Error ("Categoria no encontrada");
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

app.delete('/categoria/:id',async (req,res)=>{
    try{
        let query = 'SELECT * FROM libros WHERE categoria_id=?'
        let respuesta = await qy(query, [req.params.id]);

        // Verifico que no exista ese nombre

        if (respuesta.length > 0){
            throw new Error ("Categoria con libros asociados, no se puede eliminar");
        }

        query = 'SELECT * FROM genero WHERE id = ?';
        respuesta = await qy(query, [req.params.id]);
        
        if(respuesta.length == 0){
            throw new Error ("Categoria no econtrada");
        } 

        query = 'DELETE FROM genero WHERE id = ?';
        respuesta = await qy(query, [req.params.id]);
        res.send({"respuesta": "Se borro correctamente"});
    }
    catch(e){
        console.error(e.message);
        res.status(413).send({"Error": e.message});
    }

});



// CRUD de Persona

app.get('/persona', async (req, res) => {
    try{
        const query = 'SELECT * FROM lectores';
        const respuesta = await qy(query);
        res.send({"respuesta": respuesta});
    }
    catch(e){
        console.error(e.message);
        res.status(413).send({"Error": e.message});

    }
});

app.get('/persona/:id', async (req, res) => {
    try{
        const query = 'SELECT * FROM lectores WHERE id=?';
        const respuesta = await qy(query,[req.params.id]);
        
        if(respuesta.length == 0){
            throw new Error ("No se encuentra esa persona");
        } 
        
        res.send({"respuesta": respuesta});
               
    }
    catch(e){
        console.error(e.message);
        res.status(413).send({"Error": e.message});

    }
});

app.post('/persona', async (req, res) => {
    try{
        // Veo si me mandan bien los datos

        if (!req.body.nombre || !req.body.apellido || !req.body.mail || !req.body.alias){
            throw new Error ('Faltan datos');
        }

        let query = 'SELECT * FROM lectores WHERE mail=?'
        let respuesta = await qy(query, [req.body.mail]);

        // Verifico que no exista ese mail

        if (respuesta.length>0){
            throw new Error ("El email ya se encuentra registrado");
        }

        query = 'INSERT INTO lectores (nombre, apellido, mail, alias) VALUES (?, ?, ?, ?)';
        respuesta = await qy(query, [req.body.nombre, req.body.apellido, req.body.mail, req.body.alias]);
        res.send({"respuesta": respuesta.insertId});
    }
    catch(e){
        console.error(e.message);
        res.status(413).send({"Error": e.message});
    }
});

app.delete('/persona/:id',async (req,res)=>{
    try{
        let query = 'SELECT * FROM libros WHERE lector_id=?'
        let respuesta = await qy(query, [req.params.id]);

        // Verifico que la persona no pesea libros

        if (respuesta.length > 0){
            throw new Error ("Esa persona tiene libros asociados, no se puede eliminar");
        }
        
        query = 'SELECT * FROM lectores WHERE id = ?';
        respuesta = await qy(query, [req.params.id]);
        
        if(respuesta.length == 0){
            throw new Error ("Persona no econtrada");
        } 

        query = 'DELETE FROM lectores WHERE id = ?';
        respuesta = await qy(query, [req.params.id]);
      
        res.send({"respuesta": "Se borro correctamente"});
    }
    catch(e){
        console.error(e.message);
        res.status(413).send({"Error": e.message});
    }

});

app.put('persona/:id', async (req, res)=>{
    try{
        let query = 'SELECT * FROM lectores WHERE id = ?';
        let respuesta = await qy(query, [req.params.id]);

        if (respuesta.length == 0){
            throw new Error ("Persona no econtrada");
        }

        if (!req.body.nombre || !req.body.apellido || !req.body.alias){
            throw new Error ('Faltan datos');
        }
             
        query = 'UPDATE lectores SET nombre = ?, apellido = ?, alias = ? WHERE id = ?';
        respuesta = await qy(query, [req.body.nombre, req.body.apellido, req.body.alias, req.params.id]);
      
        res.send({"respuesta": respuesta.affectedRows});
    }
    catch(e){
        console.error(e.message);
        res.status(413).send({"Error": e.message});
    }


});


// CRUD de Libros

app.get('/libros', async (req, res) => {
    try{
        const query = 'SELECT * FROM libros';
        const respuesta = await qy(query);
        res.send({"respuesta": respuesta});
    }
    catch(e){
        console.error(e.message);
        res.status(413).send({"Error": e.message});

    }
});

app.get('/libros/:id', async (req, res) => {
    try{
        const query = 'SELECT * FROM libros WHERE id=?';
        const respuesta = await qy(query,[req.params.id]);
        
        if(respuesta.length == 0){
            throw new Error ("No se encuentra ese libro");
        } 
        
        res.send({"respuesta": respuesta});
               
    }
    catch(e){
        console.error(e.message);
        res.status(413).send({"Error": e.message});

    }
});

app.post('/libro', async (req, res) => {
    try{
        // Veo si me mandan bien los datos

        if (!req.body.nombre_libro || !req.body.lector_id || !req.body.categoria_id){
            throw new Error ('Faltan datos. (Recordar que el lector 161 es la biblioteca)');
        }

        let query = 'SELECT * FROM libros WHERE nombre_libro=?'
        let respuesta = await qy(query, [req.body.mail]);

        // Verifico que no exista ese libro

        if (respuesta.length>0){
            throw new Error ("Ese libro ya se encuentra registrado");
        }

        query = 'INSERT INTO libros (nombre_libro, descripcion, lector_id, categoria_id) VALUES (?, ?, ?, ?)';
        respuesta = await qy(query, [req.body.nombre_libro, req.body.descripcion, req.body.lector_id, req.body.categoria_id]);
        res.send({"respuesta": respuesta.insertId});
    }
    catch(e){
        console.error(e.message);
        res.status(413).send({"Error": e.message});
    }
});

app.delete('/libro/:id',async (req,res)=>{
    try{
        let query = 'SELECT * FROM libros WHERE lector_id = ?'
        let respuesta = await qy(query, [req.body.lector_id, req.params.id]);

        // Verifico que el libro exita
        
        if(respuesta.length == 0){
            throw new Error ("No se ecuentra ese libro");
        } 

        // Verifico que el libro no este prestado
        if (req.body.lector_id != 161){
            throw new Error ("Ese libro esta prestado, no se puede eliminar");
        }
        
        query = 'DELETE FROM libros WHERE id = ?';
        respuesta = await qy(query, [req.params.id]);
      
        res.send({"respuesta": "Se borro correctamente"});
    }
    catch(e){
        console.error(e.message);
        res.status(413).send({"Error": e.message});
    }

});
/*
app.put('persona/:id', async (req, res)=>{
    try{
        let query = 'SELECT * FROM lectores WHERE id = ?';
        let respuesta = await qy(query, [req.params.id]);

        if (respuesta.length == 0){
            throw new Error ("Persona no econtrada");
        }

        if (!req.body.nombre || !req.body.apellido || !req.body.alias){
            throw new Error ('Faltan datos');
        }
             
        query = 'UPDATE lectores SET nombre = ?, apellido = ?, alias = ? WHERE id = ?';
        respuesta = await qy(query, [req.body.nombre, req.body.apellido, req.body.alias, req.params.id]);
      
        res.send({"respuesta": respuesta.affectedRows});
    }
    catch(e){
        console.error(e.message);
        res.status(413).send({"Error": e.message});
    }


});
*/



//Servidor
app.listen(port, ()=>{
    console.log('servidor escuchando en el puerto', port);
})



