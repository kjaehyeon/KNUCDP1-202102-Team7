exports.registerItem = function (req, res, db) {
    var RFID = req.body.RFID.toUpperCase();
    var name = req.body.name;
    var num = req.body.num;
    var received = 0;
    var picture = `./${RFID}.jpg`;
    var id = req.session['memberID'];
    var wid = req.session['warehouseID'];

    var check = db.query(`Select rfid from iot where rfid='` + RFID + `'`);
    console.log(check);
    if (check.length > 0) {
        console.log("err: registerItem duplicate RFID");
        res.send("error1")
    } else {
        var row = db.query(`INSERT INTO iot VALUES('${RFID}', '${id}', '${name}', ${num}, ${received}, '${picture}',${wid});`);
        if (!row) {
            console.log("err: registerItem");
            res.send("error")
        } else {
            res.send("success")
        }
    }
}
