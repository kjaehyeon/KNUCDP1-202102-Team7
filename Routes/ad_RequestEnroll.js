exports.RequestForEnroll = function (req, res, app, db) {
    var items = {};
    let results = db.query('select * from RequestForEnroll, Member, Warehouse where RequestForEnroll.providerID=Member.memberID and RequestForEnroll.warehouseID=Warehouse.warehouseID');
    if (results.length > 0) {
        for (var step = 0; step < results.length; step++) {
            items[`item${step}`] = {
                reqID: results[step].reqID,
                reqDate: results[step].reqDate,
                reqType: results[step].reqType,
                warehouseID: results[step].warehouseID,
                providerID: results[step].providerID,
                national: results[step].national,
                address: results[step].address,
                name: results[step].name,
                warehouseName: results[step].warehouseName,
                floorArea: results[step].floorArea,
                rejectCmt: results[step].rejectCmt
            };
        }
    }
    return JSON.stringify(items);
}

exports.withAnswer = function (req, res, app, db) {
    var providerID = req.body.providerID;
    var reqID = req.body.reqID;
    var warehouseID = req.body.warehouseID;
    var reqType = req.body.reqType;
    var answer = req.body.answer;
    var reason = req.body.reason;
    var mysql = require('mysql');
    var connection = mysql.createConnection(require('../Module/db').info);
    connection.connect();
    if (answer == "Approve") {
        var info = {
            "memberID": providerID,
            "warehouseID": req.body.warehouseID,
        };
        connection.query('INSERT INTO Provider SET ?', info, function (error, results, fields) {
            if (error) {
                console.log(error);
                res.send(false);
                connection.end();
            } else {
                connection.query('DELETE FROM RequestForEnroll WHERE reqID=?', reqID, function (error, results, fields) {
                    if (error) {
                        console.log('Error at Delete from RQFEnroll');
                        res.send(false);
                        connection.end();
                    } else {
                        connection.query('UPDATE Warehouse SET enroll=? WHERE warehouseID=?', ['Y', info.warehouseID], function (error, results, fields) {
                            if (error) {
                                console.log('Error at Update Warehouse' + error);
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
    } else if (answer == "Reject") {
        connection.query(`UPDATE RequestForEnroll SET reqType='RejByAdmin', rejectCmt=? WHERE reqID =?`, [reason, reqID], function (error, results, fields) {
            if (error) {
                res.send(false);
                connection.end();
            } else {
                var now = new Date(new Date().getTime() + 32400000).toISOString().replace(/T/, ' ').replace(/\..+/, '');
                var cols = 'reqID, reqDate, reqType, providerID, warehouseID, rejectCmt';
                connection.query(`INSERT INTO DeletedEnroll (${cols}, rejectTime) (SELECT ${cols}, ? FROM RequestForEnroll WHERE reqID=?)`, [now, reqID], function (error, results, fields) {
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
    } else if (answer === "Confirm") {
        connection.query(`DELETE FROM RequestForEnroll WHERE reqID=?`, reqID, function (error, results, fields) {
            if (error) {
                res.send(false);
                connection.end()
            } else {
                connection.query(`DELETE FROM Warehouse WHERE warehouseID=?`, warehouseID, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                        res.send(false);
                        connection.end();
                    } else {
                        connection.query(`DELETE FROM FileInfo WHERE warehouseID=?`, warehouseID, function (error, results, fields) {
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
    }
}
