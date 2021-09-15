exports.getWHInfo = function (db, WID) {
    var items = {};
    let results = db.query(`select * from Warehouse where warehouseID=` + WID + `;`);
    if (results.length > 0) {
        items = {
            warehouseID: results[0].warehouseID,
            warehouseName: results[0].warehouseName,
            address: results[0].address,
            addressDetail: results[0].addressDetail,
            zipcode: results[0].zipcode,
            warehouseEmail: results[0].warehouseEmail,
            warehouseTEL: results[0].warehouseTEL,
            landArea: results[0].landArea,
            floorArea: results[0].floorArea,
            useableArea: results[0].useableArea,
            enrolledDate: results[0].enrolledDate.substring(0, 10),
            perprice: results[0].price,
            infoComment: results[0].infoComment,
            etcComment: results[0].etcComment,
            iotStat: results[0].iotStat
        };
    }
    return JSON.stringify(items);
}

exports.getMemberInfo = function (db, memID) {
    var items = {};
    let results = db.query(`select * from Member where memberID="` + [memID] + `";`);
    if (results.length > 0) {
        items = {
            memberID: results[0].memberID,
            name: results[0].name,
            national: results[0].national,
            email: results[0].email,
            contactNumber: results[0].contactNumber,
            address: results[0].address,
            zipcode: results[0].zipcode,
        };
    }
    return JSON.stringify(items);
}
