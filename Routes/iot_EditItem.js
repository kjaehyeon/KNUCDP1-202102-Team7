exports.editItem = function (req, res, db) {
    var RFID = req.body.RFID;
    var name = req.body.name;
    var num = req.body.num;

    var check = db.query(`Select rfid from iot where rfid='` + RFID + `'`);
    console.log(check);
    if (check.length == 0) {
        console.log("err: editItem no RFID");
        res.send("error1")
    } else {
        var editSQL = `UPDATE iot SET name='${name}',num='${num}' WHERE rfid='${RFID}'`
        var row = db.query(editSQL);
        if (!row) {
            console.log("err: editItem");
            res.send("error")
        } else {
            res.send("success")
        }
    }
}
