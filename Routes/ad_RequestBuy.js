exports.RequestForBuy = function (req, res, app, db) {
    var items = {};
    var sql = `select * from RequestForBuy`;
    let results = db.query(sql);
    if (results.length > 0) {
        for (var step = 0; step < results.length; step++) {
            items[`item${step}`] = {
                reqID: results[step].reqID,
                reqDate: results[step].reqDate,
                reqType: results[step].reqType,
                warehouseID: results[step].warehouseID,
                buyerID: results[step].buyerID,
                amount: results[step].amount,
                startDate: results[step].startDate.substring(0, 10),
                endDate: results[step].endDate.substring(0, 10),
                area: results[step].area,
                rejectCmt: results[step].rejectCmt
            };
        }
    }
    return JSON.stringify(items);
}

exports.withAnswer = function (req, res, app, db) {
    var reqID = req.body.reqID;
    var reqType = req.body.reqType;
    var answer = req.body.answer;
    var reason = req.body.reason;
    var mysql = require('mysql');
    var connection = mysql.createConnection(require('../Module/db').info);
    connection.connect();
    if (answer == "Approve") {
        connection.query(`UPDATE RequestForBuy SET reqType='ReqByAdmin' WHERE reqID=?`, reqID, function (error, results, fields) {
            if (error) {
                res.send(false);
                connection.end()
            } else {
                res.send(true);
                connection.end();
            }
        });
    } else if (answer == "Reject") {
        connection.query(`UPDATE RequestForBuy SET reqType='RejByAdmin', rejectCmt=? WHERE reqID =?`, [reason, reqID], function (error, results, fields) {
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
        viewState -= 1;  // flag_admin
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
