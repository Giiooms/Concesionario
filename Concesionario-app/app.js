const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');

// Crear una instancia de Express
const app = express();

// Configuración de la conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'concesionario'
});

db.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err);
  } else {
    console.log('Conectado a la base de datos MySQL');
  }
});

// Configurar el motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // Permite usar DELETE y PUT en formularios

// Ruta para la página principal
app.get('/', (req, res) => {
  res.render('index');
});

// Rutas para consultar los Vehículos
app.get('/vehiculos', (req, res) => {
    db.query(`
      SELECT v.id_vehiculo, v.vin, v.año, v.precio, v.estado, 
             m.nombre AS marca, md.nombre AS modelo, t.tipo AS tipo
      FROM vehiculos v
      JOIN modelos md ON v.id_modelo = md.id_modelo  -- Relación con la tabla de modelos
      JOIN marcas m ON md.id_marca = m.id_marca      -- Relación con la tabla de marcas
      JOIN tipo_vehiculo t ON v.id_tipo = t.id_tipo  -- Relación con la tabla de tipo_vehiculo
    `, (err, result) => {
      if (err) throw err;
      res.render('vehiculos', { vehiculos: result });
    });
  });

//Ruta para agregar un nuevo registro de vehiculos
app.get('/vehiculos/nuevo', (req, res) => {
  db.query('SELECT * FROM marcas', (err, marcas) => {
    if (err) throw err;
    db.query('SELECT * FROM tipo_vehiculo', (err, tipos) => {
      if (err) throw err;
      res.render('nuevoVehiculo', { marcas, tipos });
    });
  });
});
app.post('/vehiculos/nuevo', (req, res) => {
  const { id_modelo, id_tipo } = req.body;
  db.query('INSERT INTO vehiculos (id_modelo, id_tipo) VALUES (?, ?)', [id_modelo, id_tipo], (err) => {
    if (err) throw err;
    res.redirect('/vehiculos');
  });
});

//Ruta para editar un registro de vehiculos
app.get('/vehiculos/editar/:id', (req, res) => {
  const id_vehiculo = req.params.id;
  db.query('SELECT * FROM vehiculos WHERE id_vehiculo = ?', [id_vehiculo], (err, vehiculo) => {
    if (err) throw err;
    db.query('SELECT * FROM marcas', (err, marcas) => {
      if (err) throw err;
      db.query('SELECT * FROM tipo_vehiculo', (err, tipos) => {
        if (err) throw err;
        res.render('editarVehiculo', { vehiculo: vehiculo[0], marcas, tipos });
      });
    });
  });
});

app.post('/vehiculos/editar/:id', (req, res) => {
  const id_vehiculo = req.params.id;
  const { id_modelo, id_tipo } = req.body;
  db.query('UPDATE vehiculos SET id_modelo = ?, id_tipo = ? WHERE id_vehiculo = ?', [id_modelo, id_tipo, id_vehiculo], (err) => {
    if (err) throw err;
    res.redirect('/vehiculos');
  });
});

//Ruta para eliminar un registro en vehiculos
app.get('/vehiculos/eliminar/:id', (req, res) => {
  const id_vehiculo = req.params.id;
  db.query('DELETE FROM vehiculos WHERE id_vehiculo = ?', [id_vehiculo], (err) => {
    if (err) throw err;
    res.redirect('/vehiculos');
  });
});

// Rutas para consultar las Marcas
app.get('/marcas', (req, res) => {
  db.query('SELECT * FROM marcas', (err, result) => {
    if (err) throw err;
    res.render('marcas', { marcas: result });
  });
});

//Ruta para agregar una nueva marca
app.get('/marcas/nuevo', (req, res) => {
  res.render('nuevaMarca');
});
app.post('/marcas/nuevo', (req, res) => {
  const { nombre } = req.body;
  db.query('INSERT INTO marcas (nombre) VALUES (?)', [nombre], (err) => {
    if (err) throw err;
    res.redirect('/marcas');
  });
});

//RUta para editar un registro de marca
app.get('/marcas/editar/:id', (req, res) => {
  const id_marca = req.params.id;
  db.query('SELECT * FROM marcas WHERE id_marca = ?', [id_marca], (err, marca) => {
    if (err) throw err;
    res.render('editarMarca', { marca: marca[0] });
  });
});
app.post('/marcas/editar/:id', (req, res) => {
  const id_marca = req.params.id;
  const { nombre } = req.body;
  db.query('UPDATE marcas SET nombre = ? WHERE id_marca = ?', [nombre, id_marca], (err) => {
    if (err) throw err;
    res.redirect('/marcas');
  });
});

//Ruta para eliminar un registro de marcas
app.get('/marcas/eliminar/:id', (req, res) => {
  const id_marca = req.params.id;
  db.query('DELETE FROM marcas WHERE id_marca = ?', [id_marca], (err) => {
    if (err) throw err;
    res.redirect('/marcas');
  });
});

// Rutas para la gestión de Modelos
app.get('/modelos', (req, res) => {
  db.query('SELECT * FROM modelos', (err, result) => {
    if (err) throw err;
    res.render('modelos', { modelos: result });
  });
});
app.get('/modelos/nuevo', (req, res) => {
  db.query('SELECT * FROM marcas', (err, marcas) => {
    if (err) throw err;
    res.render('nuevoModelo', { marcas });
  });
});
app.post('/modelos/nuevo', (req, res) => {
  const { id_marca, nombre } = req.body;
  db.query('INSERT INTO modelos (id_marca, nombre) VALUES (?, ?)', [id_marca, nombre], (err) => {
    if (err) throw err;
    res.redirect('/modelos');
  });
});
app.get('/modelos/editar/:id', (req, res) => {
  const id_modelo = req.params.id;
  db.query('SELECT * FROM modelos WHERE id_modelo = ?', [id_modelo], (err, modelo) => {
    if (err) throw err;
    db.query('SELECT * FROM marcas', (err, marcas) => {
      if (err) throw err;
      res.render('editarModelo', { modelo: modelo[0], marcas });
    });
  });
});
app.post('/modelos/editar/:id', (req, res) => {
  const id_modelo = req.params.id;
  const { id_marca, nombre } = req.body;
  db.query('UPDATE modelos SET id_marca = ?, nombre = ? WHERE id_modelo = ?', [id_marca, nombre, id_modelo], (err) => {
    if (err) throw err;
    res.redirect('/modelos');
  });
});
app.get('/modelos/eliminar/:id', (req, res) => {
  const id_modelo = req.params.id;
  db.query('DELETE FROM modelos WHERE id_modelo = ?', [id_modelo], (err) => {
    if (err) throw err;
    res.redirect('/modelos');
  });
});

// Rutas para la gestión de Tipo de Vehículos
app.get('/tipo_vehiculo', (req, res) => {
    db.query('SELECT * FROM tipo_vehiculo', (err, result) => {
      if (err) throw err;
      res.render('tipo_vehiculo', { tipos: result });
    });
  });

app.get('/tipo_vehiculo/nuevo', (req, res) => {
  res.render('nuevoTipoVehiculo');
});

app.post('/tipo_vehiculo/nuevo', (req, res) => {
  const { tipo } = req.body; // Cambié 'nombre' por 'tipo' para que coincida con el campo en la base de datos

  // Verificamos que el tipo sea válido (si es 'nuevo' o 'usado')
  if (tipo !== 'nuevo' && tipo !== 'usado') {
    return res.status(400).send('Tipo de vehículo no válido');
  }

  db.query('INSERT INTO tipo_vehiculo (tipo) VALUES (?)', [tipo], (err) => {
    if (err) {
      console.error(err);  // Mejor manejar el error para evitar que se cierre la app
      return res.status(500).send('Error al agregar tipo de vehículo');
    }
    res.redirect('/tipo_vehiculo');
  });
});

  
  app.get('/tipo_vehiculo/editar/:id', (req, res) => {
    const id_tipo = req.params.id;
    db.query('SELECT * FROM tipo_vehiculo WHERE id_tipo = ?', [id_tipo], (err, tipo) => {
      if (err) throw err;
      res.render('editarTipoVehiculo', { tipo: tipo[0] });
    });
  });
  
  app.post('/tipo_vehiculo/editar/:id', (req, res) => {
    const id_tipo = req.params.id;
    const { nombre } = req.body;
    db.query('UPDATE tipo_vehiculo SET nombre = ? WHERE id_tipo = ?', [nombre, id_tipo], (err) => {
      if (err) throw err;
      res.redirect('/tipo_vehiculo');
    });
  });
  
  app.get('/tipo_vehiculo/eliminar/:id', (req, res) => {
    const id_tipo = req.params.id;
    db.query('DELETE FROM tipo_vehiculo WHERE id_tipo = ?', [id_tipo], (err) => {
      if (err) throw err;
      res.redirect('/tipo_vehiculo');
    });
  });

// Rutas para la gestión de Antiguos Dueños
app.get('/anteriores_duenos', (req, res) => {
    db.query('SELECT * FROM anteriores_duenos', (err, result) => {
      if (err) throw err;
      res.render('anteriores_duenos', { duenos: result });
    });
  });
  
  app.get('/anteriores_duenos/nuevo', (req, res) => {
    db.query('SELECT * FROM vehiculos', (err, vehiculos) => {
      if (err) throw err;
      res.render('nuevoAnteriorDueno', { vehiculos });
    });
  });
  
  app.post('/anteriores_duenos/nuevo', (req, res) => {
    const { id_vehiculo, nombre } = req.body;
    db.query('INSERT INTO anteriores_duenos (id_vehiculo, nombre) VALUES (?, ?)', [id_vehiculo, nombre], (err) => {
      if (err) throw err;
      res.redirect('/anteriores_duenos');
    });
  });
  
  app.get('/anteriores_duenos/editar/:id', (req, res) => {
    const id_dueno = req.params.id;
    db.query('SELECT * FROM anteriores_duenos WHERE id_dueno = ?', [id_dueno], (err, dueno) => {
      if (err) throw err;
      db.query('SELECT * FROM vehiculos', (err, vehiculos) => {
        if (err) throw err;
        res.render('editarAnteriorDueno', { dueno: dueno[0], vehiculos });
      });
    });
  });
  
  app.post('/anteriores_duenos/editar/:id', (req, res) => {
    const id_dueno = req.params.id;
    const { id_vehiculo, nombre } = req.body;
    db.query('UPDATE anteriores_duenos SET id_vehiculo = ?, nombre = ? WHERE id_dueno = ?', [id_vehiculo, nombre, id_dueno], (err) => {
      if (err) throw err;
      res.redirect('/anteriores_duenos');
    });
  });
  
  app.get('/anteriores_duenos/eliminar/:id', (req, res) => {
    const id_dueno = req.params.id;
    db.query('DELETE FROM anteriores_duenos WHERE id_dueno = ?', [id_dueno], (err) => {
      if (err) throw err;
      res.redirect('/anteriores_duenos');
    });
  });

// Rutas para la gestión de Ventas
app.get('/ventas', (req, res) => {
    db.query(`
      SELECT v.id_vehiculo, v.vin, ve.fecha_venta, ve.precio_final, 
             m.nombre AS marca, md.nombre AS modelo
      FROM ventas ve
      JOIN vehiculos v ON ve.id_vehiculo = v.id_vehiculo
      JOIN modelos md ON v.id_modelo = md.id_modelo
      JOIN marcas m ON md.id_marca = m.id_marca;
    `, (err, result) => {
      if (err) throw err;
      // Asegurar que precio_final sea numérico
      const ventas = result.map(venta => ({
        ...venta,
        precio_final: parseFloat(venta.precio_final),
      }));
      res.render('ventas', { ventas });
    });
  });
  
// Ruta para mostrar el formulario de nueva venta
app.get('/ventas/nueva', (req, res) => {
    // Consultamos los vehículos con su VIN, Marca y Modelo
    db.query(`
      SELECT 
        v.id_vehiculo, 
        v.vin, 
        m.nombre AS marca, 
        mo.nombre AS modelo
      FROM vehiculos v
      JOIN modelos mo ON v.id_modelo = mo.id_modelo
      JOIN marcas m ON mo.id_marca = m.id_marca
    `, (err, vehiculos) => {
      if (err) throw err;
      // Pasamos los vehículos a la vista
      res.render('nuevaVenta', { vehiculos });
    });
  });
  
  
// Ruta para mostrar el formulario de nueva venta
app.get('/ventas/nueva', (req, res) => {
    // Consultamos los vehículos con su VIN, Marca y Modelo
    db.query(`
      SELECT 
        v.id_vehiculo, 
        v.vin, 
        m.nombre AS marca, 
        mo.nombre AS modelo
      FROM vehiculos v
      JOIN modelos mo ON v.id_modelo = mo.id_modelo
      JOIN marcas m ON mo.id_marca = m.id_marca
    `, (err, vehiculos) => {
      if (err) throw err;
      // Pasamos los vehículos a la vista
      res.render('nuevaVenta', { vehiculos });
    });
  });
  
  // Ruta para registrar una nueva venta
  app.post('/ventas/nueva', (req, res) => {
    const { id_vehiculo, fecha_venta, precio_final } = req.body;
  
    // Validación de los datos del formulario
    if (!id_vehiculo || !fecha_venta || !precio_final) {
      return res.status(400).send('Faltan datos en el formulario');
    }
  
    // Insertar los datos en la base de datos
    db.query(
      'INSERT INTO ventas (id_vehiculo, fecha_venta, precio_final) VALUES (?, ?, ?)', 
      [id_vehiculo, fecha_venta, precio_final], 
      (err) => {
        if (err) throw err;
        res.redirect('/ventas'); // Redirigir al listado de ventas después de guardar
      }
    );
  });
  
  
  
  app.get('/ventas/editar/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM ventas WHERE id_vehiculo = ?', [id], (err, result) => {
      if (err) throw err;
      res.render('editar_venta', { venta: result[0] });
    });
  });
  
  app.post('/ventas/editar/:id', (req, res) => {
    const id = req.params.id;
    const { fecha_venta, precio_final } = req.body;
    db.query(
      'UPDATE ventas SET fecha_venta = ?, precio_final = ? WHERE id_vehiculo = ?',
      [fecha_venta, precio_final, id],
      (err) => {
        if (err) throw err;
        res.redirect('/ventas'); // Redirige a la lista actualizada
      }
    );
  });
  
  
  app.get('/ventas/eliminar/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM ventas WHERE id_vehiculo = ?', [id], (err) => {
      if (err) throw err;
      res.redirect('/ventas'); // Redirige a la lista actualizada
    });
  });
  

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
