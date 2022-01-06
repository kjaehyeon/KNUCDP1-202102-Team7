

// 물품 등록
exports.enrollItem = async function enrollItem(req, res, app, pool) {
    //connection 생성
    connection = await pool.getConnection(async conn => conn);
    //1. 고유 ID 생성하여 DB에 저장
    wid = req.warehouse_id
    const it_id = warehouse_id + "_" + buyer_id ;
    await connection.query('INSERT INTO RequestForBuy SET ?', [reqItem]);
    //2. 고유 ID에 해당하는 QR생성하여 qr_img폴더에 저장
}

// 물품 입고
function receivedItem() {

}

//물품 출고
function releaseItem() {

}