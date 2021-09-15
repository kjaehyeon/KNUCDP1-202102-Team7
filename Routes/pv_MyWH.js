exports.RequestForEnroll = function (req, res, app, db) {
    var items = {};
    var sql = `SELECT * from RequestForEnroll, Warehouse where providerID ='${req.session['memberID']}' and RequestForEnroll.warehouseID=Warehouse.warehouseID`;
    let results = db.query(sql);
    if (results.length > 0) {
        for (var step = 0; step < results.length; step++) {
            items[`item${step}`] = {
                reqID: results[step].reqID,
                reqDate: results[step].reqDate,
                reqType: results[step].reqType,
                warehouseID: results[step].warehouseID,
                warehouseName: results[step].warehouseName,
                providerID: results[step].providerID,
                rejectCmt: results[step].rejectCmt
            };
        }
    }
    return JSON.stringify(items);
}

exports.RequestForBuy = function (req, res, app, db) {
    var items = {};
    var sql = "select * from RequestForBuy, Warehouse, Member where Member.memberID=RequestForBuy.buyerID and RequestForBuy.warehouseID=Warehouse.warehouseID and Warehouse.warehouseID in (SELECT warehouseID from Provider where memberID='" + req.session['memberID'] + "')";
    let results = db.query(sql);
    if (results.length > 0) {
        for (var step = 0; step < results.length; step++) {
            items[`item${step}`] = {
                reqID: results[step].reqID,
                reqDate: results[step].reqDate,
                reqType: results[step].reqType,
                warehouseID: results[step].warehouseID,
                warehouseName: results[step].warehouseName,
                address: results[step].address,
                floorArea: results[step].floorArea,
                useableArea: results[step].useableArea,
                amount: results[step].amount,
                startDate: results[step].startDate.substring(0, 10),
                endDate: results[step].endDate.substring(0, 10),
                buyerID: results[step].buyerID,
                name: results[step].name,
                email: results[step].email,
                contractNumber: results[step].contractNumber,
                national: results[step].national,
                area: results[step].area,
                rejectCmt: results[step].rejectCmt
            };
        }
    }
    return JSON.stringify(items);
}


exports.Mywarehouse = function (req, res, app, db) {
    var items = {};
    let sql = `SELECT * from Warehouse,Provider where Warehouse.warehouseID=Provider.warehouseID and Provider.memberID='${req.session['memberID']}' and enroll='Y'`;
    let results = db.query(sql);
    if (results.length > 0) {
        for (var step = 0; step < results.length; step++) {
            items[`item${step}`] = {
                warehouseID: results[step].warehouseID,
                warehouseName: results[step].warehouseName,
                iotStat: results[step].iotStat
            };
        }
    }
    return JSON.stringify(items);
}

exports.ReqIoTAns = function (req, res, app, db) {
    var warehouseID = req.body.warehouseID;
    var answer = req.body.answer;
    var reqID = req.body.reqID;
    var mysql = require('mysql');
    var connection = mysql.createConnection(require('../Module/db').info);
    connection.connect();

    if (answer === 'Request') {
        var reqItem = {
            "reqDate": new Date(),
            "reqType": "ReqIoTPv",
            "providerID": req.session['memberID'],
            "warehouseID": warehouseID
        };
        connection.query(`INSERT INTO RequestForIoT SET ?`, reqItem, function (error, results, fields) {
            if (error) {
                console.log(error);
                res.send(false);
                connection.end();
            } else {
                connection.query(`UPDATE Warehouse SET iotStat='W' WHERE warehouseID=?`, warehouseID, function (error, results, fields) {
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
    } else if (answer === 'Confirm') {
        connection.query(`UPDATE Warehouse SET iotStat='N' WHERE warehouseID=?`, warehouseID, function (error, results, fields) {
            if (error) {
                console.log(error);
                res.send(false);
                connection.end();
            } else {
                connection.query(`DELETE FROM RequestForIoT WHERE reqID=?`, reqID, function (error, results, fields) {
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
    } else if (answer === 'Cancel') {
        var reason = req.body.reason;
        connection.query(`UPDATE RequestForIoT SET reqType='CnlByPv', rejectCmt=? WHERE reqID=?`, [reason, reqID], function (error, results, fields) {
            if (error) {
                console.log(error);
                res.send(false);
                connection.end();
            } else {
                connection.query(`UPDATE Warehouse SET iotStat='N' WHERE warehouseID=?`, warehouseID, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                        res.send(false);
                        connection.end();
                    } else {
                        var now = new Date(new Date().getTime() + 32400000).toISOString().replace(/T/, ' ').replace(/\..+/, '');
                        var cols = 'reqID, reqDate, reqType, providerID, warehouseID, rejectCmt';
                        connection.query(`INSERT INTO DeletedIoT (${cols}, rejectTime) (SELECT ${cols}, ? FROM RequestForIoT WHERE reqID=?)`, [now, reqID], function (error, results, fields) {
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

exports.ReqEnrollAns = function (req, res, app, db) {
    var warehouseID = req.body.whID;
    var reqID = req.body.reqID;
    var answer = req.body.answer;
    var reason = req.body.reason;
    var mysql = require('mysql');
    var connection = mysql.createConnection(require('../Module/db').info);
    connection.connect();
    if (answer == "Confirm") {
        connection.query(`DELETE FROM RequestForEnroll WHERE reqID =?`, reqID, function (error, results, fields) {
            if (error) {
                console.log(error);
                res.send(false);
                connection.end();
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
    } else if (answer == "Cancel") {
        connection.query(`UPDATE RequestForEnroll SET reqType='CnlByPv', rejectCmt=? WHERE reqID =?`, [reason, reqID], function (error, results, fields) {
            if (error) {
                console.log(error);
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
    }
}

exports.ReqBuyAns = function (req, res, app, db) {
    var reqID = req.body.reqID;
    var reqType = req.body.reqType;
    var answer = req.body.answer;
    var reason = req.body.reason;
    var mysql = require('mysql');
    var connection = mysql.createConnection(require('../Module/db').info);
    connection.connect();
    if (answer == "Approve") {
        connection.query(`UPDATE RequestForBuy SET reqType='ReqByPv' WHERE reqID =${reqID}`, function (error, results, fields) {
            if (error) {
                res.send(false);
                connection.end();
            } else {
                res.send(true);
                connection.end();
            }
        });
    } else if (answer == "Cancel") {
        connection.query(`UPDATE RequestForBuy SET reqType='RejByPv3', rejectCmt=? WHERE reqID =?`, [reason, reqID], function (error, results, fields) {
            if (error) {
                res.send(false);
                connection.end();
            } else {
                var now = new Date(new Date().getTime() + 32400000).toISOString().replace(/T/, ' ').replace(/\..+/, '');
                var cols = 'reqID, reqDate, reqType, warehouseID, buyerID, area, startDate, endDate, rejectCmt, amount';
                connection.query(`INSERT INTO DeletedBuy (${cols}, rejectTime) (SELECT ${cols}, ? FROM RequestForBuy WHERE reqID=?)`, [now, reqID], function (error, results, fields) {
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
        var viewState = parseInt(reqType.charAt(reqType.length - 1));
        viewState -= 4;  // flag_provider
        if (viewState === 0) {
            connection.query(`DELETE FROM RequestForBuy WHERE reqID=?`, reqID, function (error, results, fields) {
                if (error) {
                    res.send(false);
                    connection.end()
                } else {
                    res.send(true);
                    connection.end();
                }
            });
        } else {
            reqType = reqType.substring(0, reqType.length - 1) + viewState.toString();
            connection.query(`UPDATE RequestForBuy SET reqType=? WHERE reqID =?`, [reqType, reqID], function (error, results, fields) {
                if (error) {
                    res.send(false);
                    connection.end()
                } else {
                    res.send(true);
                    connection.end();
                }
            });
        }
    }
}
