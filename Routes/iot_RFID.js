exports.receive = async function (req, res, pool) {
    var rfid = req.body.rfid;
    var id = req.body.memberID;
    var connection = null;
    try {
        connection = await pool.getConnection(async conn => conn);
        var [results] = await connection.query('SELECT * FROM iot where rfid=?', [rfid]);
        if (!results.length) {
            throw new Error('rfid not exist');
        } else {
            [results] = await connection.query('SELECT * FROM Provider, iot'
                                                + ' where Provider.warehouseID = iot.warehouseID'
                                                + ' and iot.rfid=? and Provider.memberID=?;', [rfid, id]);
            if (results.length) {
                throw new Error('unauthorized');
            } else {
                await connection.query('UPDATE iot SET received=1 WHERE rfid=?;', [rfid]);
            }
        }
        res.send('success');
    } catch (err) {
        console.log(err.message);
        res.send(err.message);
    } finally {
        connection.release();
    }
}