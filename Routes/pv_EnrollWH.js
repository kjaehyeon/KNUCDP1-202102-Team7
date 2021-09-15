exports.EnrollWH = function (req, res, app, db) {
    var mysql = require('mysql');
    var connection = mysql.createConnection(require('../Module/db').info);
    connection.connect();
    var onlyNum = /^[0-9]*$/; // 숫자만 받는 정규식
    var onlyNumDot = /^[0-9.]*$/; // 숫자와 점만 받는 정규식
    var engishDigit = /^[a-zA-Z0-9]+$/; // 영어 대소문자 및 숫자 받는 정규식
    var emailReg = /[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]$/i;
    var phoneReg = /^(01(?:0|1|[6-9])|02|0[3-9]\d{1})-(?:\d{3}|\d{4})-\d{4}$/;
    var item = {
        warehouseName: req.body.warehouseName,
        warehouseTEL: req.body.warehouseTel,
        warehouseEmail: req.body.warehouseEmail,
        enrolledDate: new Date(),
        zipcode: req.body.zipcode,
        address: req.body.address,
        addressDetail: req.body.addressDetail,
        latitude: req.body.lat,
        longitude: req.body.lng,
        landArea: req.body.landArea,
        floorArea: req.body.floorArea,
        useableArea: req.body.useableArea,
        price: req.body.price,
        infoComment: req.body.infoComment,
        etcComment: req.body.etcComment,
        iotStat: "N",
        enroll: "N"
    }
    //예외처리를 위한 정규식
    if (onlyNum.test(item.landArea) == false) {
        res.send("errortype2");
        console.log('errortype2');
    } else if (onlyNum.test(item.floorArea) == false) {
        res.send("errortype3");
        console.log('errortype3');
    } else if (onlyNum.test(item.useableArea) == false) {
        res.send("errortype11");
        console.log('errortype11');
    } else if (onlyNumDot.test(item.price) == false) {
        res.send("errortype4");
        console.log('errortype4');
    } else if ((engishDigit.test(item.warehouseName) || (engishDigit.test(item.infoComment)) || (engishDigit.test(item.etcComment))) == false) {
        res.send("errortype6");
    } else if (emailReg.test(item.warehouseEmail) == false) {
        res.send("errortype9");
    } else if (phoneReg.test(item.warehouseTEL) == false) {
        res.send("errortype10");
    } else {
        connection.query('INSERT INTO Warehouse SET ?', item, function (error, results, fields) {
            if (error) {
                console.log("error ocurred Warehouse set error", error.message);
                res.redirect('/Provider/EnrollWH');
            } else {
                connection.query('SELECT LAST_INSERT_ID() as wid;', function (error, results, fields) {
                    if (error) {
                        console.log("error ocurred LAST_INSERT_ID() error", error);
                        res.redirect('/Provider/EnrollWH');
                    } else {
                        let upLoadFile = req.files;
                        let fileName = req.files.profile_img.name;
                        let username = req.session.username;
                        var fileExt = fileName.substring(fileName.lastIndexOf('.'), fileName.length).toLowerCase();
                        fileName = new Date().getTime().toString() + fileExt;
                        upLoadFile.profile_img.mv(`./Public/Upload/${username}_${fileName}`, err => {
                            if (err) {
                                res.send(err);
                                console.log('file mv error' + err);
                            } else {
                                warehouseID = results[0].wid;
                                var fileInfo = {
                                    "warehouseID": warehouseID,
                                    "filename": `${username}_${fileName}`
                                };
                                connection.query('INSERT INTO FileInfo SET ?', fileInfo, function (error, results, fields) {
                                    if (error) {
                                        console.log("error ocurred FileInfo error", error);
                                        res.redirect('/Provider/EnrollWH');
                                    } else {
                                        var reqItem = {
                                            "reqDate": new Date(),
                                            "reqType": "ReqEnrollPV",
                                            "providerID": req.session['memberID'],
                                            "warehouseID": warehouseID
                                        };
                                        connection.query('INSERT INTO RequestForEnroll SET ?', reqItem, function (error, results, fields) {
                                            if (error) {
                                                console.log("error ocurred RequsetForEnroll error", error);
                                                res.send("errortype5");
                                            } else {
                                                res.send("errortype0");
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
}
