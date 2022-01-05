exports.login = async function (req, res, app, pool) {
    const crypto = require('crypto');
    var memberID = req.body.memberID;
    var password = req.body.password;
    var connection = null;
    var results = [];

    try {
        connection = await pool.getConnection(async conn => conn);
        [results] = await connection.query('SELECT * FROM Member WHERE memberID = ?', [memberID])
    } catch (err) {
        console.log(err.message);
    } finally {
        connection.release();
    }
    if (results.length > 0) {
        crypto.pbkdf2(password, results[0].salt, 100000, 64, 'sha512', (err, key) => {
            if(key.toString('base64') === results[0].password){
                req.session['memberID'] = results[0].memberID;
                req.session['type'] = results[0].type;
                req.session['username'] = results[0].name;
                req.session['email'] = results[0].email;
                req.session['contactNumber'] = results[0].contactNumber;
                req.session['address'] = results[0].address;
                req.session['zipcode'] = results[0].zipcode;
                req.session['national'] = results[0].national;
                res.send('loginSuccess');
            } else {
                console.log(key.toString('base64'));
                console.log(results[0].salt);
                res.send('loginError02'); //PW가 틀릴 시
            }
        });
    } else {
        res.send('loginError01'); //DB에 해당하는 ID가 없을 시
    }
}
