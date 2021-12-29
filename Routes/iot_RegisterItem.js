exports.registerItem = async function (req, res, pool) {
    var RFID = req.body.RFID.toUpperCase();
    var name = req.body.name;
    var num = req.body.num;
    var received = 0;
    var picture = `./${RFID}.jpg`;
    var id = req.session['memberID'];
    var wid = req.session['warehouseID'];
    var connection = null;
    try {
        connection = await pool.getConnection(async conn => conn);
        var [check] = await connection.query(`Select rfid from iot where rfid='` + RFID + `'`);
        if (check.length > 0) {
            throw new Error('err: registerItem');
        } else {
            var [row] = await connection.query(`INSERT INTO iot VALUES('${RFID}', '${id}', '${name}', ${num}, ${received}, '${picture}',${wid})`);
            if (!row) {
                throw new Error('err: registerItem');
            }
        }
        res.send('success');
    } catch (err) {
        console.log(err.message);
        res.send('error');
    } finally {
        connection.release();
    }
}
