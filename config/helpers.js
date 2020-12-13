 const Mysqli  =  require ( 'mysqli' );
let conn = new Mysqli({
    host : '3.8.130.64' ,  // IP/domain name
    post : 3306 ,  //port, default 3306
    user : 'root' ,  //user name
    passwd : 'Cirqular2021!@#' ,  //password
    db : 'cirqular'  // You can specify the database or not [optional]
});

let db = conn.emit(false, '');

module.exports = {
    database: db
}