exports.RequestForEnroll = async function (req, res, app, pool) {
    var items = {};
    var sql = `SELECT * from RequestForEnroll, Warehouse`
                + ` where providerID ='${req.session['memberID']}'`
                + ` and RequestForEnroll.warehouseID=Warehouse.warehouseID`;
    var connection = null;
    var results = [];
    try {
        connection = await pool.getConnection(async conn => conn);
        [results] = await connection.query(sql);
    } catch (err) {
        console.log(err.message);
    } finally {
        connection.release();
    }
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

exports.RequestForBuy = async function (req, res, app, pool) {
    var items = {};
    var sql = 'select * from RequestForBuy, Warehouse, Member'
                + ' where Member.memberID=RequestForBuy.buyerID'
                + ' and RequestForBuy.warehouseID=Warehouse.warehouseID'
                + ' and Warehouse.warehouseID in (SELECT warehouseID from Provider'
                                                + ` where memberID='` + req.session['memberID'] + `')`;
    try {
        connection = await pool.getConnection(async conn => conn);
        [results] = await connection.query(sql);
    } catch (err) {
        console.log(err.message);
    } finally {
        connection.release();
    }
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


exports.Mywarehouse = async function (req, res, app, pool) {
    var items = {};
    var sql = `SELECT * from Warehouse,Provider`
            + ` where Warehouse.warehouseID=Provider.warehouseID`
            + ` and Provider.memberID='${req.session['memberID']}'`
            + ` and enroll='Y'`;
    var connection = null;
    var results = null;
    try {
        connection = await pool.getConnection(async conn => conn);
        [results] = await connection.query(sql);
    } catch (err) {
        console.log(err.message);
    } finally {
        connection.release();
    }
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

exports.ReqIoTAns = async function (req, res, app, pool) {
    var warehouseID = req.body.warehouseID;
    var answer = req.body.answer;
    var reqID = req.body.reqID;
    var connection = null;
    try {
        connection = await pool.getConnection(async conn => conn);
        await connection.beginTransaction();
        if (answer == 'Request') {
            var reqItem = {
                "reqDate": new Date(),
                "reqType": "ReqIoTPv",
                "providerID": req.session['memberID'],
                "warehouseID": warehouseID
            };
            await connection.query(`INSERT INTO RequestForIoT SET ?`, [reqItem]);
            await connection.query(`UPDATE Warehouse SET iotStat='W' WHERE warehouseID=?`, [warehouseID]);
        } else if (answer == 'Confirm') {
            await connection.query(`UPDATE Warehouse SET iotStat='N' WHERE warehouseID=?`, [warehouseID]);
        } else if (answer == 'Cancel') {
            await connection.query(`UPDATE RequestForIoT SET reqType='CnlByPv', rejectCmt=? WHERE reqID=?`, [reason, reqID]);
            await connection.query(`UPDATE Warehouse SET iotStat='N' WHERE warehouseID=?`, [warehouseID]);
            var now = new Date(new Date().getTime() + 32400000).toISOString().replace(/T/, ' ').replace(/\..+/, '');
            var cols = 'reqID, reqDate, reqType, providerID, warehouseID, rejectCmt';
            await connection.query(`INSERT INTO DeletedIoT (${cols}, rejectTime)`
                                + ` (SELECT ${cols}, ? FROM RequestForIoT WHERE reqID=?)`, [now, reqID]);
        }
        await connection.commit();
        res.send(true);
    } catch (err) {
        console.log(err.message);
        await connection.rollback();
        res.send(false);
    } finally {
        connection.release();
    }
}

exports.ReqEnrollAns = async function (req, res, app, pool) {
    var warehouseID = req.body.whID;
    var reqID = req.body.reqID;
    var answer = req.body.answer;
    var reason = req.body.reason;
    var connection = null;
    try {
        connection = await pool.getConnection(async conn => conn);
        await connection.beginTransaction();
        if (answer == 'Confirm') {
            await connection.query(`DELETE FROM RequestForEnroll WHERE reqID =?`, [reqID]);
            await connection.query(`DELETE FROM Warehouse WHERE warehouseID=?`, [warehouseID]);
            await connection.query(`DELETE FROM FileInfo WHERE warehouseID=?`, [warehouseID]);
        } else if (answer == 'Cancel') {
            await connection.query(`UPDATE RequestForEnroll SET reqType='CnlByPv', rejectCmt=? WHERE reqID =?`, 
                                    [reason, reqID]);
            var now = new Date(new Date().getTime() + 32400000).toISOString().replace(/T/, ' ').replace(/\..+/, '');
            var cols = 'reqID, reqDate, reqType, providerID, warehouseID, rejectCmt';
            await connection.query(`INSERT INTO DeletedEnroll (${cols}, rejectTime)` 
                                + ` (SELECT ${cols}, ? FROM RequestForEnroll WHERE reqID=?)`, [now, reqID]);
        }
        await connection.commit();
        res.send(true);
    } catch (err) {
        console.log(err.message);
        res.send(false);
        await connection.rollback();
    } finally {
        connection.release();
    }
}

exports.ReqBuyAns = async function (req, res, app, pool) {
    var reqID = req.body.reqID;
    var reqType = req.body.reqType;
    var answer = req.body.answer;
    var reason = req.body.reason;
    var connection = null;
    try {
        connection = await pool.getConnection(async conn => conn);
        if (answer == 'Approve') {
            await connection.query(`UPDATE RequestForBuy SET reqType='ReqByPv' WHERE reqID=${reqID}`);
        } else if (answer == 'Cancel') {
            await connection.query(`UPDATE RequestForBuy SET reqType='RejByPv3', rejectCmt=? WHERE reqID =?`, [reason, reqID]);
        } else if (answer == 'Confirm') {
            var viewState = parseInt(reqType.charAt(reqType.length - 1));
            viewState -= 4;  // flag_provider
            if (viewState === 0) {
                await connection.query(`DELETE FROM RequestForBuy WHERE reqID=?`, [reqID]);
            }
            else {
                reqType = reqType.substring(0, reqType.length - 1) + viewState.toString();
                await connection.query(`UPDATE RequestForBuy SET reqType=? WHERE reqID =?`, [reqType, reqID]);
            }
        }
        res.send(true);
    } catch (err) {
        console.log(err.message);
        res.send(false);
    } finally {
        connection.release();
    }
}
