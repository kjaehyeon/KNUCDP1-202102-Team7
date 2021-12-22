exports.receive = function (req, res, db) {
    var mysql = require('mysql');
    var connection = mysql.createConnection(require('../Module/db').info);
    connection.connect();

    var rfid = req.body.rfid;
    var id = req.body.memberID;
    connection.query('SELECT * FROM iot where rfid=?;', [rfid], (error, results, fields) => {
        if (error) {
            console.log("error: rfid 1", error);
            res.send('error1');
            connection.end();
        } else if (results.length === 0) {
            res.send('rfid not exist');
            connection.end();
        } else {
            connection.query('SELECT * FROM Provider, iot where Provider.warehouseID = iot.warehouseID and iot.rfid=? and Provider.memberID=?;', [rfid, id], (error, results, fields) => {
                if (error) {
                    console.log("error: rfid 2", error);
                    res.send('error2');
                    connection.end();
                } else if (results.length === 0) {
                    res.send('unauthorized');
                    connection.end();
                } else {
                    connection.query('UPDATE iot SET received=1 WHERE rfid=?;', [rfid], (error, results, fields) => {
                        if (error) {
                            console.log("error: rfid 3", error);
                            res.send('error3');
                        } else {
                            res.send('success');
                        }
                        connection.end();
                    });
                }
            });
        }
    });
}