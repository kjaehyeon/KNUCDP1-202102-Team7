exports.login = function (req, res, app, db) {
    const crypto = require('crypto');
    var memberID = req.body.memberID;
    var password = req.body.password;
    let results = db.query('SELECT * FROM Member WHERE memberID = ?', [memberID]);

    if (results.length > 0) {
        if (results[0].password == crypto.createHash('sha512').update(password).digest('base64')) {
            req.session['memberID'] = results[0].memberID;
            req.session['type'] = results[0].type;
            req.session['username'] = results[0].name;
            req.session['password'] = results[0].password;
            req.session['email'] = results[0].email;
            req.session['contactNumber'] = results[0].contactNumber;
            req.session['address'] = results[0].address;
            req.session['zipcode'] = results[0].zipcode;
            req.session['national'] = results[0].national;
            res.send('loginSuccess');
        } else {
            res.send('loginError02'); //PW가 틀릴 시
        }
    } else {
        res.send('loginError01'); //DB에 해당하는 ID가 없을 시
    }
}
