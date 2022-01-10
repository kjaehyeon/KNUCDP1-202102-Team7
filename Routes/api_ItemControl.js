const qrCode = require('qrcode');
const crypto = require('crypto');

exports.enrollItem = async function (req, res, pool) {
    //connection 생성
    const connection = await pool.getConnection(async conn => conn);
    await connection.beginTransaction();
    const name = req.body.name;
    //var num = req.body.num;
    let received = 0;
    // 사진 받아와야함
    //var picture = `./${RFID}.jpg`;
    const bid = req.session['memberID'];
    let wid = req.session['warehouseID'];
    try {
        let [row] = await connection.query(`Insert Into Item(buyer_id, name, warehouseID, size, received, picture) VALUES('${id}', '${name}', ${wid}, ${num}, ${received}, '${picture}');`);
        if (!row.affectedRows) {
            throw new Error('"err: registerItem');
        } else {
            res.send("success");
        }
        //마지막 auto increment 값을 가져옴
        let [it_id] = await connection.query(`Select last_insert_id()`);
        it_id = it_id[0].it_id;
        const qr = crypto.createHash('sha512').update(`${wid}${bid}${it_id}`).digest('base64');
        [row] = await connection.query(`Update Item Set qrcode = '${qr}' where id = '${it_id}';`);
        if (!row.affectedRows) {
            throw new Error('err: QR Hash create Failed');
        } else {
            res.send("success");
        }
        await connection.commit();
    } catch (err) {
        console.log(err.message);
        await connection.rollback();
        res.send("error");
    } finally {
        await connection.release();
    }
}

// 물품 입고
exports.receivedItem = async function receivedItem(req, res, pool) {
    // TODO: 입고 요청이 왔을 때 해야 할 것
    // 1. Item 테이블 status 1로 업데이트
    // connection 생성
    const connection = await pool.getConnection(async conn => conn);
    const qr = req.body.qr;
    connection.beginTransaction();
    let status = 200;
    try{
        let [it_id] = await connection.query(`SELECT it_id FROM Item WHERE qrcode='${qr}';`);
        // item이 없을 경우엔 에러
        if (it_id.length == 0) {
            status = 400;
            throw new Error('err: Item is empty');
        }
        it_id = it_id[0].it_id;
        let [row] = await connection.query(`UPDATE Item SET status = 1 where it_id = '${it_id}';`);
        if (!row.affectedRows) {
            status = 500;
            throw new Error('err: Item recieved status failed');
        } 
        // 2. ItemTimeStamp 테이블에 (아이템 id, 날짜시간, 1) 삽입
        [row] = await connection.query(`INSERT INTO ItemTimeStamp(it_id, i_date, status) VALUES('${it_id}', '${
            new Date(+new Date() + 3240 * 10000).toISOString().replace("T", " ").replace(/\..*/, '')
        }', 1);`);
        if (!row.affectedRows) {
            status = 500;
            throw new Error('err: ItemTimeStamp Insert failed');
        }
        connection.commit();
        res.status(status).json({
            message : "success"
        });
    } catch(err){
        console.log(err.message);
        await connection.rollback();
        res.status(status).json({
            error : err.message
        });
    } finally {
        await connection.release();
    }
}

//물품 출고
exports.releaseItem = async function releaseItem(req, res, pool) {
    // TODO: 출고 요청이 왔을 때 해야 할 것
    // 1. Item 테이블 status 2로 업데이트
    const connection = await pool.getConnection(async conn => conn);
    const qr = req.body.qr;
    connection.beginTransaction();
    let status = 200;
    try{
        let [it_id] = await connection.query(`SELECT it_id FROM Item WHERE qrcode='${qr}';`);
        // item이 없을 경우엔 에러
        if (it_id.length == 0) {
            status = 400;
            throw new Error('err: Item is empty');
        }
        it_id = it_id[0].it_id;
        let [row] = await connection.query(`UPDATE Item SET status = 2 where it_id = '${it_id}';`);
        if (!row.affectedRows) {
            status = 500;
            throw new Error('err: Item recieved status failed');
        } 
        // 2. ItemTimeStamp 테이블에 (아이템 id, 날짜시간, 2) 삽입
        [row] = await connection.query(`INSERT INTO ItemTimeStamp(it_id, i_date, status) VALUES('${it_id}', '${
            new Date(+new Date() + 3240 * 10000).toISOString().replace("T", " ").replace(/\..*/, '')
        }', 2);`);
        if (!row.affectedRows) {
            status = 500;
            throw new Error('err: ItemTimeStamp Insert failed');
        } 
        connection.commit();
        res.status(status).json({
            message : "success"
        });
    } catch(err){
        console.log(err.message);
        await connection.rollback();
        res.status(status).json({
            error : err.message
        });
    } finally {
        await connection.release();
    }
}

//물품 목록
exports.listItem = async function listItem(req, res, pool) {
    //connection 생성
    const connection = await pool.getConnection(async conn => conn);
    const wid = req.param('wid')
    console.log(`in listitem 1 wid:${wid}`);
    connection.beginTransaction();
    try{
        let [items] = await connection.query(`SELECT I.it_id, I.name as name, I.status, I.create_date as datetime, M.name as buyer_name, I.picture as image 
        FROM Item I, Member M 
        WHERE I.buyer_id = M.memberID AND warehouseID = '${wid}';`);
        for (i in items){
            const date = new Date(items[i]['datetime']).toISOString().split("T")[0];
            const time = new Date(items[i]['datetime']).toTimeString().split(" ")[0];
            items[i]['datetime'] = date + ' ' + time
        }
        console.log(items)
        res.status(200).json(
            items
        );
        connection.commit();
    } catch(err){
        console.log(`error : ${err.message}`);
        await connection.rollback();
        res.status(500).json({
            error : err.message
        });
    } finally {
        await connection.release();
    }
}

// 물품 정보
exports.itemInfo = async function itemInfo(req, res, pool) {
    //connection 생성
    const connection = await pool.getConnection(async conn => conn);
    const qr = req.param('qr');
    connection.beginTransaction();
    try{
        let [items] = await connection.query(`SELECT I.name as it_name, M.name as buyer_name, I.status as current_status, I.size, W.warehouseName as warehouse_name, I.note, I.create_date as created_datetime,  I.picture as image_url 
        FROM Item I, Member M, Warehouse W
        WHERE I.buyer_id = M.memberID AND W.warehouseID = I.warehouseID AND I.qrcode = '${qr}';`);
        const date = new Date(items[0]['created_datetime']).toISOString().split("T")[0];
        const time = new Date(items[0]['created_datetime']).toTimeString().split(" ")[0];
        items[0]['created_datetime'] = date + ' ' + time
        console.log(items[0])
        res.status(200).json(
            items[0]
        );
        connection.commit();
    } catch(err){
        console.log(`error : ${err.message}`);
        await connection.rollback();
        res.status(500).json({
            error : err.message
        });
    } finally {
        await connection.release();
    }
}