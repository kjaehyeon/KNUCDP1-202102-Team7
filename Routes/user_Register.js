exports.register = async function (req, res, app, pool) {
    const crypto = require('crypto');
    var connection = null;
    var user = {
        memberID: req.body.memberID,
        type: req.body.type,
        name: req.body.name,
        password: crypto.createHash('sha512').update(req.body.password).digest('base64'),         //레인보우 테이블을 이용한 공격방어를 위해 추후 더 나은 보안기법 필요함.
        email: req.body.email,
        contactNumber: req.body.contactNumber1 + '-' + req.body.contactNumber2 + '-' + req.body.contactNumber3,
        zipcode: req.body.zipcode,
        address: req.body.address,
        national: req.body.national
    }

    try {
        connection = await pool.getConnection(async conn => conn);
        await connection.beginTransaction();
        await connection.query('INSERT INTO Member SET ?', user);
        await connection.commit();
        req.session['memberID'] = user.memberID;
        req.session['type'] = user.type;
        req.session['username'] = user.name;
        req.session['password'] = user.password;
        req.session['contactNumber'] = user.contactNumber;
        req.session['email'] = user.email;
        req.session['zipcode'] = user.zipcode;
        req.session['address'] = user.address;
        req.session['national'] = user.national;

        res.send(true);
    } catch (err) {
        console.log(err.message);
        await connection.rollback();
        res.send(false);
    } finally {
        connection.release();
    }
}


exports.checkID = async function (req, res, app, pool) {
    var memberID = req.body.memberID;
    var connection = null;
    var results = [];

    try {
        connection = await pool.getConnection(async conn => conn);
        [results] = await connection.query(`SELECT * FROM Member WHERE memberID='${memberID}'`);
    } catch (err) {
        console.log(err.message);
    } finally {
        connection.release();
    }
    if (!results.length) res.send(true);
    else res.send(false);
}

exports.checkPW = function (req, res, app, pool) {
    var attr = req.body;
    var id = attr.id;
    var pw = attr.pw;
    var c_p = attr.c_p;
    var pwReg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&-])[A-Za-z\d$@$!%*#?&\-]{8,}$/;
    var koreancheck = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;

    if (false === pwReg.test(pw)) {
        //error all
        res.send("errortype1");
    } else if (id == '') {
        res.send("errortype7");
        //id 필드가 empty일 경우
    } else if (/(\w)\1\1\1/.test(pw)) {
        //length error
        res.send("errortype2");

    } else if (pw.search(id) > -1) {
        //pw have id error
        res.send("errortype3");

    } else if (pw.search(/\s/) != -1) {
        //blank error
        res.send("errortype4");

    } else if (koreancheck.test(pw)) {
        //korean error
        res.send("errortype5");

    } else if (c_p === pw) {
        //success
        res.send("errortype0");
    } else {
        res.send("errortype6");
    }
}
