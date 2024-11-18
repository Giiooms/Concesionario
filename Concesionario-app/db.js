const mysql = require('mysql2');

// Configuración de la base de datos
const connection = mysql.createConnection({
  host: 'localhost',   // Cambia si tu base de datos está en otro servidor
  user: 'root',        // Cambia por el usuario de tu base de datos
  password: '',        // Cambia por la contraseña de tu base de datos
  database: 'concesionario'
});

// Verifica la conexión
connection.connect((err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.stack);
    return;
  }
  console.log('Conectado a la base de datos');
});

module.exports = connection;
