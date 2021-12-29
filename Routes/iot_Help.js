exports.init = async function (req, res, pool) {
    var id = req.session['memberID'];
    var connection = null;
    try {
        connection = await pool.getConnection(async conn => conn);
        var [row] = await connection.query('SELECT * FROM Member WHERE memberID = ?', [id]);
        if (!row.length) throw new Error('err: help');
        else res.render('IoT/iot_Help', {uname: row[0].name, 'session': req.session});
    } catch (err) {
        console.log(err.message);
    } finally {
        connection.release();
    }
}
