exports.RequestForIoT = function (req, res, app, db) {
    var items = {};
    let results = db.query("SELECT * from RequestForIoT, Member, Warehouse, Provider WHERE Warehouse.warehouseID=Provider.warehouseID and RequestForIoT.warehouseID=Warehouse.warehouseID and RequestForIoT.providerID=Member.MemberID");
    if (results.length > 0) {
        for (var step = 0; step < results.length; step++) {
            results[step].price = results[step].price * results[step].area;
            items[`item${step}`] = {
                warehouseID: results[step].warehouseID,
                warehouseName: results[step].warehouseName,
                memberID: results[step].memberID,
                address: results[step].address,
                national: results[step].national,
                reqType: results[step].reqType,
                reqID: results[step].reqID,
                rejectCmt: results[step].rejectCmt
            };
        }
    }
    return JSON.stringify(items);
}

exports.withAnswer = function (req, res, app, db) {
    var warehouseID = req.session['warehouseID'];
    var answer = req.body.answer;
    var iotServer = req.body.iotServer;
    var reqID = req.body.reqID;
    var mysql = require('mysql');
    var connection = mysql.createConnection(require('../Module/db').info);
    connection.connect();
    if (answer == "Approve") {
        connection.query(`UPDATE Warehouse SET iotStat='Y', iotServer=? WHERE warehouseID=?`, [iotServer, warehouseID], function (error, results, fields) {
            if (error) {
                console.log(error);
                res.send(false);
                connection.end();
            } else {
                connection.query(`DELETE FROM RequestForIoT WHERE warehouseID=?`, warehouseID, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                        res.send(false);
                        connection.end();
                    } else {
                        res.send(true);
                        connection.end();
                    }
                });
            }
        });
    } else if (answer == "Reject") {
        var reason = req.body.reason;
        connection.query(`UPDATE RequestForIoT SET reqType='RejByAdmin', rejectCmt=? WHERE warehouseID=?`, [reason, warehouseID], function (error, results, fields) {
            if (error) {
                console.log(error);
                res.send(false);
                connection.end();
            } else {
                connection.query(`UPDATE Warehouse SET iotStat='R' WHERE warehouseID=?`, warehouseID, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                        res.send(false);
                        connection.end();
                    } else {
                        var now = new Date(new Date().getTime() + 32400000).toISOString().replace(/T/, ' ').replace(/\..+/, '');
                        var cols = 'reqID, reqDate, reqType, providerID, warehouseID, rejectCmt';
                        connection.query(`INSERT INTO DeletedIoT (${cols}, rejectTime) (SELECT ${cols}, ? FROM RequestForIoT WHERE warehouseID=?)`, [now, warehouseID], function (error, results, fields) {
                            if (error) {
                                console.log(error);
                                res.send(false);
                                connection.end();
                            } else {
                                res.send(true);
                                connection.end();
                            }
                        });
                    }
                });
            }
        });
    } else if (answer === "Confirm") {
        connection.query(`DELETE FROM RequestForIoT WHERE reqID=?`, reqID, function (error, results, fields) {
            if (error) {
                console.log(error);
                res.send(false);
                connection.end()
            } else {
                res.send(true);
                connection.end();
            }
        });
    }
}
