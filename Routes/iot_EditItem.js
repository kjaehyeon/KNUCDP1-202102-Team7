exports.editItem = async function (req, res, pool) {
    var RFID = req.body.RFID;
    var name = req.body.name;
    var num = req.body.num;
    var connection = null;
    try {
        connection = await pool.getConnection(async conn => conn);
        var [check] = await connection.query(`Select rfid from iot where rfid='` + RFID + `'`);
        if (check.length === 0) {
            throw new Error('err: editItem');
        } else {
            var editSQL = `UPDATE iot SET name='${name}',num='${num}' WHERE rfid='${RFID}'`;
            var [row] = await connection.query(editSQL);
            if (!row) {
                throw new Error('err: editItem');
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
