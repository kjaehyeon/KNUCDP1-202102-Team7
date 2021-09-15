exports.Show = function (req, res, app, db) {
    const viewInfo = require('./viewInfo');
    const wid = req.body.wid;
    let WHInfo = viewInfo.getWHInfo(db, wid);
    WHInfo = JSON.parse(WHInfo);
    res.render('User/WHEdit', {session: req.session, wh: WHInfo});
}

exports.Save = function (req, res, app, db) {
    var mysql = require('mysql');
    var fs = require('fs');
    var connection = mysql.createConnection(require('../Module/db').info);
    connection.connect();
    var onlyNum = /^[0-9]*$/;
    var onlyNumDot = /^[0-9.]*$/; // 숫자와 점만 받는 정규식
    var emailReg = /[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]$/i;
    var phoneReg = /^(01(?:0|1|[6-9])|02|0[3-9]\d{1})-(?:\d{3}|\d{4})-\d{4}$/;
    var wid = req.body.warehouseID;
    var item = {
        warehouseTEL: req.body.warehouseTel,
        warehouseEmail: req.body.warehouseEmail,
        landArea: req.body.landArea,
        floorArea: req.body.floorArea,
        useableArea: req.body.useableArea,
        price: req.body.price,
        infoComment: req.body.infoComment,
        etcComment: req.body.etcComment
    }
    //예외처리를 위한 정규식
    if (onlyNum.test(item.landArea) === false) res.send("errortype2");
    else if (onlyNum.test(item.floorArea) === false) res.send("errortype3");
    else if (onlyNum.test(item.useableArea) === false) res.send("errortype11");
    else if (onlyNumDot.test(item.price) === false) res.send("errortype4");
    else if (emailReg.test(item.warehouseEmail) === false) res.send("errortype9");
    else if (phoneReg.test(item.warehouseTEL) === false) res.send("errortype10");
    else {
        connection.query(`UPDATE Warehouse SET ? WHERE warehouseID=?`, [item, wid], function (error, results, fields) {
            if (error) {
                console.log('update error:', error);
                res.send(error);
            } else {
                let upLoadFile = req.files;
                if (upLoadFile) {
                    connection.query('SELECT filename FROM FileInfo WHERE warehouseID=?', wid, function (error, results, fields) {
                        if (error) {
                            console.log("error:", error.message);
                            res.send('error');
                        }
                        let fileName = results[0].filename;
                        fs.unlink(`./Public/Upload/${fileName}`, (error) => {
                            if (error) {
                                console.log('file mv error' + error);
                                res.send(error);
                            } else {
                                upLoadFile.profile_img.mv(`./Public/Upload/${fileName}`, error => {
                                    if (error) {
                                        console.log('file mv error' + error);
                                        res.send(error);
                                    } else {
                                        res.send('success');
                                    }
                                });
                            }
                        });
                    });
                } else {
                    res.send('success');
                }
            }
        });
    }
}
