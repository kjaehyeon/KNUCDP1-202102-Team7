exports.init = async function (req, res, app, pool) {
    var wid = req.body.wid;
    var connection = null;
    let rows = [];
    try {
        connection = await pool.getConnection(async conn => conn);
        [rows] = await connection.query(`SELECT * FROM Warehouse WHERE warehouseID=${wid}`);
    } catch (err) {
        console.log(err.message);
    } finally {
        connection.release();
    }
    if (!rows.length) res.render('Alert/cannotAccess');
    else {
        req.session['warehouseID'] = wid;
        res.render('User/Admin/ad_IoTTest', {'session': req.session, 'wid': wid});
    }
}
