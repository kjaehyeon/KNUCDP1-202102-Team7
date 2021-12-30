exports.initWarehouse = async function (req, res, pool) {
    var items = {};
    var type = req.session['type']
    var wid = req.session['warehouseID']
    var id = req.session['memberID']
    var connection = null;
    var results = null;
    try {
        connection = await pool.getConnection(async conn => conn);
        if (type == "provider" || type == "admin") {
            [results] = await connection.query('SELECT * FROM iot WHERE warehouseID=?', [wid]);
            if (!results.length) throw new Error('err: warehousing init');
            else {
                for (var step = 0; step < results.length; step++) {
                    results[step].received = results[step].received ? 'Arrived' : 'Not arrived';
                    items[`item${step}`] = {
                        id: results[step].id,
                        rfid: results[step].rfid,
                        name: results[step].name,
                        num: results[step].num,
                        received: results[step].received,
                        picture: results[step].picture
                    };
                }
            }
        }
        else {
            [results] = await connection.query("SELECT * FROM iot WHERE id=? and warehouseID=?", [id, wid]);
            if (!results.length) {
                for (var step = 0; step < results.length; step++) {
                    results[step].received = results[step].received ? 'Arrived' : 'Not arrived';
                    items[`item${step}`] = {
                        id: results[step].id,
                        rfid: results[step].rfid,
                        name: results[step].name,
                        num: results[step].num,
                        received: results[step].received,
                        picture: results[step].picture
                    };
                }
            }
        }
    } catch (err) {
        console.log(err.message);
    } finally {
        connection.release();
    }
    return JSON.stringify(items);
}

exports.delItem = async function (req, res, pool) {
    var rfid = req.body.itemDel;
    var delSQL = `DELETE FROM iot WHERE rfid='${rfid}';`
    var connection = null;
    var check = null;
    try {
        connection  = await pool.getConnection(async conn => conn);
        [check] = await connection.query(delSQL);
    } catch (err) {
        console.log(err.message);
    } finally {
        connection.release();
    }
    if (!check) {
        console.log("error ocurred");
        res.redirect('Warehousing');
    } else {
        res.redirect('Warehousing');
    }
}

exports.randomTest = async function (req, res, pool) {
    var types = ['aaa', 'bbb', 'ccc', 'ddd', 'eee', 'fff', 'ggg'];
    var rfid = Math.random().toString(16).substr(2, 8).toUpperCase();
    var name = types[Math.floor(Math.random() * types.length)];
    var num = Math.floor(Math.random() * 100) + 1;
    var received = Math.floor(Math.random() * 2);
    var picture = `./${rfid}.jpg`;
    var id = req.session['memberID'];
    var wid = req.session['warehouseID'];
    var connection = null;
    try {
        connection = await pool.getConnection(async conn => conn);
        await connection.query(`INSERT INTO iot VALUES('${rfid}', '${id}', '${name}', ${num}, ${received}, '${picture}', ${wid})`);
    } catch (err) {
        console.log(err.message);
    } finally {
        connection.release();
    }
    res.redirect('Warehousing');
}
