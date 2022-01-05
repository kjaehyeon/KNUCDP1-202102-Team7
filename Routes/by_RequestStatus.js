exports.RequestForBuy = async function (req, res, app, pool) {
    var items = {};
    var sql = `select * from RequestForBuy where buyerID='${req.session['memberID']}'`;
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
                buyerID: results[step].buyerID,
                area: results[step].area,
                startDate: results[step].startDate.substring(0, 10),
                endDate: results[step].endDate.substring(0, 10),
                rejectCmt: results[step].rejectCmt,
                amount: results[step].amount
            };
        }
    }
    return JSON.stringify(items);
}

exports.ReqBuyWithAnswer = async function (req, res, app, pool) {
    var reqID = req.body.reqID;
    var reqType = req.body.reqType;
    var answer = req.body.answer;
    var reason = req.body.reason;
    var connection = null;
    try {
        connection = await pool.getConnection(async conn => conn);
        await connection.beginConnection();
        if (answer == 'Cancel') {
            var cnlType = reqType === 'ReqByBuyer' ? 'CnlByBuyer1' : 'CnlByBuyer5';
            await connection.query('UPDATE RequestForBuy SET reqType=?, rejectCmt=? WHERE reqID =?', [cnlType, reason, reqID]);
            var now = new Date(new Date().getTime() + 32400000).toISOString().replace(/T/, ' ').replace(/\..+/, '');
            var cols = 'reqID, reqDate, reqType, warehouseID, buyerID, area, startDate, endDate, rejectCmt, amount';
            await connection.query(`INSERT INTO DeletedBuy (${cols}, rejectTime)`
                                    + ` (SELECT ${cols}, ? FROM RequestForBuy WHERE reqID=?)`, [now, reqID]);
        } else if (answer == 'Confirm') {
            var viewState = parseInt(reqType.charAt(reqType.length - 1));
            viewState -= 2; // flag_buyer
            if (viewState === 0) {
                await connection.query('DELETE FROM RequestForBuy WHERE reqID=?', [reqID]);
            } else {
                reqType = reqType.substring(0, reqType.length - 1) + viewState.toString();
                await connection.query(`UPDATE RequestForBuy SET reqType=? WHERE reqID =?`, [reqType, reqID]);
            }
        } else if (answer == 'Accept') {
            await connection.query('DELETE FROM RequestForBuy WHERE reqID=?', [reqID]);
            var contract = {
                reqID: reqID,
                buyerID: req.session['memberID'],
                warehouseID: req.body.whID,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                area: req.body.area,
                amount: req.body.amount
            };
            await connection.query('INSERT INTO Contract SET ?', [contract]);
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