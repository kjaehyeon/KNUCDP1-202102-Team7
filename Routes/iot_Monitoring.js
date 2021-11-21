exports.init = function (req, res, db) {
    if (req.headers.referer.includes('Admin/IoTTest')) {
        res.render('IoT/iot_Monitoring', {'iotServer': req.session['iotServer'], 'session': req.session});
    } else {
        const warehouse_result = db.query('SELECT IFNULL(SUM(C.area), 0) AS usedArea, W.useableArea,'
                        + ' W.latitude, W.longitude, W.iotServer, W.cctvServer'
                        + ' FROM Contract C, Warehouse W'
                        + ' WHERE C.warehouseID = W.warehouseID'
                        + ' AND W.warehouseID = ?', [req.session['warehouseID']]);
        req.session['iotServer'] = warehouse_result.iotServer;
        res.render('IoT/iot_Monitoring', {
            user_type: req.session['type'],
            user_name: req.session['username'], 
            warehouse_info: JSON.stringify({
                warehouse_id: req.session['warehouseID'],
                ...warehouse_result[0]
            })
        });
    }
}

exports.sessionCheck = function (req, res, db) {
    if (req.session['type'] === 'admin') {
        var wid = req.body.wid;
        req.session['warehouseID'] = wid;
        req.session['iotServer'] = req.body.iotServer;
        var result = db.query(`select warehouseName from Warehouse where warehouseID=?;`, [wid]);
        if (!result) console.log('err: iot.getWarehouseName');
        else {
            var WName = result[0].warehouseName;
            req.session['warehouseName'] = WName;
            res.redirect('/IoT');
        }        
    }
    else {
        var wid = req.body.wid;
        var id = req.session['memberID'];
        var result = db.query(`select warehouseName from Warehouse where warehouseID=?;`, [wid]);
        if (!result) console.log('err: iot.getWarehouseName');
        else {
            var WName = result[0].warehouseName;
            req.session['warehouseName'] = WName;
            var row = db.query(`select count(*) as num from (select memberID, warehouseID from Provider union select buyerID as memberID, warehouseID from Contract) as pb where memberID=? and warehouseID=?;`, [id, wid]);
            if (!row) console.log('err: iot.sessionCheck');
            else if (!row[0].num) res.render('Alert/cannotAccess');  // 창고 provider/buyer가 아님
            else {
                row = db.query(`select iotServer from Warehouse where warehouseID=?;`, [wid]);
                if (!row) console.log('err: iot.sessionCheck2');
                else {
                    req.session['warehouseID'] = wid;
                    req.session['iotServer'] = row[0].iotServer;
                    res.redirect('IoT/Monitoring');
                }
            }
        }
    }
}
