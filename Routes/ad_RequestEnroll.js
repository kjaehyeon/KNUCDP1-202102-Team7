exports.RequestForEnroll = async function (req, res, app, pool) {
    var items = {};
    var connection = null;
    var results = null;
    try {
        connection = await pool.getConnection(async conn => conn);
        [results] = await connection.query('select * from RequestForEnroll, Member, Warehouse'
                                        + ' where RequestForEnroll.providerID=Member.memberID'
                                        + ' and RequestForEnroll.warehouseID=Warehouse.warehouseID');
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

exports.withAnswer = async function (req, res, app, pool) {
    var providerID = req.body.providerID;
    var reqID = req.body.reqID;
    var warehouseID = req.body.warehouseID;
    var reqType = req.body.reqType;
    var answer = req.body.answer;
    var reason = req.body.reason;
    var connection = null;

    try {
        connection = await pool.getConnection(async conn => conn);
        await connection.beginTransaction();
        if (answer == "Approve") {
            var info = {
                "memberID": providerID,
                "warehouseID": req.body.warehouseID,
            };
            await connection.query('INSERT INTO Provider SET ?', info);
            await connection.query('DELETE FROM RequestForEnroll WHERE reqID=?', reqID);
            await connection.query('UPDATE Warehouse SET enroll=? WHERE warehouseID=?', ['Y', info.warehouseID]);
        } else if (answer == "Reject") {
            await connection.query('UPDATE RequestForEnroll'
                                    + ` SET reqType='RejByAdmin', rejectCmt=?`
                                    + ' WHERE reqID =?', [reason, reqID]);
            var now = new Date(new Date().getTime() + 32400000).toISOString().replace(/T/, ' ').replace(/\..+/, '');
            var cols = 'reqID, reqDate, reqType, providerID, warehouseID, rejectCmt';
            await connection.query(`INSERT INTO DeletedEnroll (${cols}, rejectTime)`
                                    + ` (SELECT ${cols}, ? FROM RequestForEnroll WHERE reqID=?)`,[now, reqID]);
        } else if (answer === "Confirm") {
            await connection.query('DELETE FROM RequestForEnroll WHERE reqID=?', reqID);
            await connection.query('DELETE FROM Warehouse WHERE warehouseID=?', warehouseID);
            await connection.query('DELETE FROM FileInfo WHERE warehouseID=?');
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
