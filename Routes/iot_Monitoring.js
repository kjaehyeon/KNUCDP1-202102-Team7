exports.init = async function(req, res, pool) {
    if (req.headers.referer.includes('Admin/IoTTest')) {
        res.render('IoT/iot_Monitoring', { 'iotServer': req.session['iotServer'], 'session': req.session });
    } else {
        var connection = null;
        var warehouse_result = null;
        try {
            connection = await pool.getConnection(async conn => conn);
            [warehouse_result] = await connection.query('SELECT IFNULL(SUM(C.area), 0) AS usedArea, W.useableArea,'
                                                        + ' W.latitude, W.longitude, W.iotServer, W.cctvServer'
                                                        + ' FROM Contract C, Warehouse W'
                                                        + ' WHERE C.warehouseID = W.warehouseID'
                                                        + ' AND W.warehouseID = ?', [req.session['warehouseID']]);             
        } catch (err) {
            console.log(err.message);
        } finally {
            connection.release();
        }
        req.session['iotServer'] = warehouse_result[0].iotServer;
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

exports.sessionCheck = async function(req, res, pool) {
    if (req.session['type'] === 'admin') {
        var wid = req.body.wid;
        req.session['warehouseID'] = wid;
        req.session['iotServer'] = req.body.iotServer;
        var connection = null;
        var results = null;
        try {
            connection = await pool.getConnection(async conn => conn);
            [results] = await connection.query('select warehouseName from Warehouse where warehouseID=?', [wid]);
            if (!results.length) throw new Error('err: iot.getWarehouseName');
            else {
                var WName = results[0].warehouseName;
                req.session['warehouseName'] = WName;
                res.redirect('/IoT');
            }
        } catch (err) {
            console.log(err.message);
        } finally {
            connection.release();
        }
    } else {
        var wid = req.body.wid;
        var id = req.session['memberID'];
        var connection = null;
        var results = null;
        try {
            connection = await pool.getConnection(async conn => conn);
            [results] = await connection.query('select warehouseName from Warehouse where warehouseID=?', [wid]);
            if (!results.length) throw new Error('err: iot.getWarehouseName');
            else {
                var WName = results[0].warehouseName;
                req.session['warehouseName'] = WName;
                var [row] = await connection.query('select count(*) as num'
                                                    + ' from (select memberID, warehouseID'
                                                                + ' from Provider' 
                                                                + ' union select buyerID as memberID, warehouseID'
                                                                + ' from Contract) as pb where memberID=? and warehouseID=?', [id, wid]);
                if (!row.length) throw new Error('err: iot.sessionCheck');
                else if (!row[0].num) res.render('Alert/cannotAccess');
                else {
                    [row] = await connection.query('select iotServer from Warehouse where warehouseID=?', [wid]);
                    if (!row.length) throw new Error('err: iot.sessionCheck2');
                    else {
                        req.session['warehouseID'] = wid;
                        req.session['iotServer'] = row[0].iotServer;
                        res.redirect('IoT/Monitoring');
                    }
                }
            }
        } catch (err) {
            console.log(err.message);
        } finally {
            connection.release();
        }
    }
}