exports.RequestForBuy = async function (req, res, app, pool) {
    var items = {};
    var sql = `select * from RequestForBuy`;
    var connection = null;
    let results = [];
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

exports.withAnswer = async function (req, res, app, pool) {
    var reqID = req.body.reqID;
    var reqType = req.body.reqType;
    var answer = req.body.answer;
    var reason = req.body.reason;
    var connection = null;
    try {
        connection = await pool.getConnection(async conn => conn);
        await connection.beginTransaction();
        if (answer == 'Approve') {
            await connection.query(`UPDATE RequestForBuy SET reqType='ReqByAdmin' WHERE reqID=?`, reqID);
        } else if (answer == 'Reject') {
            await connection.query(`UPDATE RequestForBuy SET reqType='RejByAdmin', rejectCmt=? WHERE reqID =?`,
                                    [reason, reqID]);
            var now = new Date(new Date().getTime() + 32400000).toISOString().replace(/T/, ' ').replace(/\..+/, '');
            var cols = 'reqID, reqDate, reqType, warehouseID, buyerID, area, startDate, endDate, rejectCmt, amount';
            await connection.query(`INSERT INTO DeletedBuy (${cols}, rejectTime) (SELECT ${cols}, ? FROM RequestForBuy WHERE reqID=?)`,
                                    [now, reqID]);
        } else if (answer === 'Confirm') {
            var viewState = parseInt(reqType.charAt(reqType.length - 1));
            viewState -= 1;  // flag_admin
            if (viewState === 0) {
                await connection.query('DELETE FROM RequestForBuy WHERE reqID=?', [reqID]);

            } else {
                reqType = reqType.substring(0, reqType.length - 1) + viewState.toString();
                await connection.query('UPDATE RequestForBuy SET reqType=? WHERE reqID =?', [reqType, reqID]);
            }
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
