exports.Show = async function (req, res, app, pool) {
    const viewInfo = require('./viewInfo');
    const wid = req.body.wid;
    let WHInfo = await viewInfo.getWHInfo(pool, wid);
    WHInfo = JSON.parse(WHInfo);
    res.render('User/WHEdit', {session: req.session, wh: WHInfo});
}

exports.Save = async function (req, res, app, pool) {
    var fs = require('fs').promises;
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
    var connection = null;
    var results = null;
    //예외처리를 위한 정규식
    if (onlyNum.test(item.landArea) === false) res.send("errortype2");
    else if (onlyNum.test(item.floorArea) === false) res.send("errortype3");
    else if (onlyNum.test(item.useableArea) === false) res.send("errortype11");
    else if (onlyNumDot.test(item.price) === false) res.send("errortype4");
    else if (emailReg.test(item.warehouseEmail) === false) res.send("errortype9");
    else if (phoneReg.test(item.warehouseTEL) === false) res.send("errortype10");
    else {
        try {
            connection = await pool.getConnection(async conn => conn);
            await connection.beginTransaction();
            await connection.query(`UPDATE Warehouse SET ? WHERE warehouseID=?`, [item, wid]);
            let upLoadFile = req.files;
            if (upLoadFile) {
                [results] = await connection.query('SELECT filename FROM FileInfo WHERE warehouseID=?', [wid]);
                let fileName = results[0].filename;
                await fs.unlink(`./Public/Upload/${fileName}`);
                upLoadFile.profile_img.mv(`./Public/Upload/${fileName}`, async (err) => {
                    if (err) {
                        throw err;
                    } else {
                        await connection.commit();
                        res.send('success');
                    }
                });
            } else {
                await connection.commit();
                res.send('success');
            }
        } catch (err) {
            console.log(err.message);
            res.send(err);
            await connection.rollback();
        } finally {
            connection.release();
        }
    }
}