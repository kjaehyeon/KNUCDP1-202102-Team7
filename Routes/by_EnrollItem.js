const qrCode = require('qrcode');
const crypto = require('crypto');

exports.enrollItem = async function (req, res, pool) {
    //connection 생성
    connection = await pool.getConnection(async conn => conn);

    const name = req.body.name;
    //var num = req.body.num;
    let received = 0;
    //var picture = `./${RFID}.jpg`;
    const bid = req.session['memberID'];
    let wid = req.session['warehouseID'];
    

    //var check = db.query(`Select rfid from iot where rfid='` + RFID + `'`);
    //console.log(check);
    
    let row = await connection.query(`Insert Into Item(buyer_id, name, warehouseID, size, received, picture) VALUES('${id}', '${name}', ${wid}, ${num}, ${received}, '${picture}');`);
    if (!row) {
        console.log("err: registerItem");
        res.send("error")
    } else {
        res.send("success")
    }
    //마지막 auto increment 값을 가져옴
    let it_id = await connection.query(`Select last_insert_id()`);

    const qr = crypto.createHash('sha512').update(`${wid}${bid}${it_id}${it_id}`).digest('base64');
    row = await connection.query(`Update Item Set qrcode = '${qrcode}' where id = '${it_id}'`);
    if (!row) {
        console.log("err: QR Hash create Failed");
        res.send("error");
    } else {
        res.send("success");
    }
}
