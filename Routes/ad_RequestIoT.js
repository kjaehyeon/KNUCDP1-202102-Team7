exports.RequestForIoT = async function(req, res, app, pool) {
    var items = {};
    var connection = null;
    var results = null;

    try {
        connection = await pool.getConnection(async conn => conn);
        [results] = await connection.query('SELECT * from RequestForIoT, Member, Warehouse, Provider'
                                            + ' WHERE Warehouse.warehouseID=Provider.warehouseID'
                                            + ' and RequestForIoT.warehouseID=Warehouse.warehouseID'
                                            + ' and RequestForIoT.providerID=Member.MemberID');
    } catch (err) {
        console.log(err.message);
    } finally {
        connection.release();
    }

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

exports.withAnswer = async function(req, res, app, pool) {
    var warehouseID = req.session['warehouseID'];
    var answer = req.body.answer;
    var iotServer = req.body.iotServer;
    var cctvServer = req.body.cctvServer;
    var reqID = req.body.reqID;
    var connection = null;

    try {
        connection = await pool.getConnection(async conn => conn);
        await connection.beginTransaction();
        if (answer == 'Approve') {
            await connection.query(`UPDATE Warehouse SET iotStat='Y', iotServer=?, cctvServer=? WHERE warehouseID=?`,
                                    [iotServer, cctvServer, warehouseID]);
            await connection.query(`DELETE FROM RequestForIoT WHERE warehouseID=?`, [warehouseID]);
        } else if (answer == 'Reject') {
            var reason = req.body.reason;
            await connection.query(`UPDATE RequestForIoT SET reqType='RejByAdmin', rejectCmt=? WHERE warehouseID=?`,
                                    [reason, warehouseID]);
            await connection.query(`UPDATE Warehouse SET iotStat='R' WHERE warehouseID=?`, [warehouseID]);
            var now = new Date(new Date().getTime() + 32400000).toISOString().replace(/T/, ' ').replace(/\..+/, '');
            var cols = 'reqID, reqDate, reqType, providerID, warehouseID, rejectCmt';
            await connection.query(`INSERT INTO DeletedIoT (${cols}, rejectTime)` 
                            + ` (SELECT ${cols}, ? FROM RequestForIoT WHERE warehouseID=?)`,
                            [now, warehouseID]);
        } else if (answer == 'Confirm') {
            await connection.query(`DELETE FROM RequestForIoT WHERE reqID=?`, [reqID]);
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