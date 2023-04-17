// Load module
import mysql from 'mysql'
// Initialize pool
var pool = mysql.createPool({
    connectionLimit : 10,
    host     : 'localhost',
    user     : 'admin_admin',
    password : '2#Fex7i55',
    database : 'admin_letzconnect',
    debug    :  false
});
export default pool;