exports.initWarehouse = function (req, res, db) {
    var items = {};
    var type = req.session['type']
    var wid = req.session['warehouseID']
    var id = req.session['memberID']

    if (type == "provider" || type == "admin") {
        var results = db.query("SELECT * FROM iot WHERE warehouseID=?;", [wid]);
        if (!results) console.log('err: warehousing init');
        else {
            if (results.length > 0) {
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
    } else {
        var results = db.query("SELECT * FROM iot WHERE id=? and warehouseID=?;", [id, wid]);
        if (!results) console.log('err: warehousing init');
        else {
            if (results.length > 0) {
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
    }
    return JSON.stringify(items);
}

exports.delItem = function (req, res, db) {
    var rfid = req.body.itemDel;

    var delSQL = `DELETE FROM iot WHERE rfid='${rfid}';`
    var check = db.query(delSQL);
    if (!check) {
        console.log("error ocurred", error);
        res.redirect('Warehousing');
    } else {
        res.redirect('Warehousing');
    }
}

exports.randomTest = function (req, res, db) {
    var types = ['aaa', 'bbb', 'ccc', 'ddd', 'eee', 'fff', 'ggg'];
    var rfid = Math.random().toString(16).substr(2, 8).toUpperCase();
    var name = types[Math.floor(Math.random() * types.length)];
    var num = Math.floor(Math.random() * 100) + 1;
    var received = Math.floor(Math.random() * 2);
    var picture = `./${rfid}.jpg`;
    var id = req.session['memberID'];
    var wid = req.session['warehouseID'];

    var row = db.query(`INSERT INTO iot VALUES('${rfid}', '${id}', '${name}', ${num}, ${received}, '${picture}', ${wid});`);
    if (!row) console.log('err: randomTest');
    else res.redirect('Warehousing');
}
