exports.pwEdit = function (req, res, app, db) {
    const crypto = require('crypto');
    var oldPw = crypto.createHash('sha512').update(req.body.oldPw).digest('base64');
    var newPw = req.body.newPw;
    var pwChk = req.body.pwChk;

    //Current Pw Validation Check
    var SQL = `SELECT password FROM Member WHERE memberID='${req.session.memberID}';`
    let curPw = db.query(SQL);
    if (!curPw) {
        console.log("error ocurred. cannot get current PW.", error);
        res.write("<script>alert('Error ocurred. Try again.')</script>");
        res.write("<script>window.location=\"/User/Edit\"</script>");
    } else if (curPw[0].password != oldPw) {
        console.log("Current password doesn't match original password");
        res.write("<script>alert('Current password does not match original password. Please check current password.')</script>");
        res.write("<script>window.location=\"/User/Edit\"</script>");
    } else {
        //Check newPw == pwChk and udate password
        if (newPw == pwChk) {
            var password = crypto.createHash('sha512').update(newPw).digest('base64');
            var SQL = `UPDATE Member SET password=? WHERE memberID='${req.session.memberID}'`
            var check = db.query(SQL, [password]);
            if (!check) {
                console.log("error ocurred. cannot update PW.", error);
                res.write("<script>alert('Error ocurred. Try again.')</script>");
                res.write("<script>window.location=\"/User/Edit\"</script>");
            } else {
                req.session['password'] = password;
                res.redirect('/User/Edit');
            }
        } else {
            console.log("error ocurred. New password does not match password check");
            res.write("<script>alert('New password does not match password check. Please check new password.')</script>");
            res.write("<script>window.location=\"/User/Edit\"</script>");
        }
    }
}
