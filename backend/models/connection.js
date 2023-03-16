// Load module
import mysql from 'mysql'
// Initialize pool
var pool = mysql.createPool({
    connectionLimit : 10,
    host     : 'localhost',
    user     : 'conference2',
    password : 'Pa$$W0rd',
    database : 'conference2',
    debug    :  false
});
export default pool;