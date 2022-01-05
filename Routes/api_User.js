exports.login = async (req, res, pool) => {
    const {body: {id, pw}} = req;
    const jwt = require('jsonwebtoken');
    const secret_key = process.env.JWT_SECRET_KEY;

    if (!id || !pw) {
        res.status(401).json({
            message: 'need login information'
        });
    } else {
        let connection = null;
        let results = [];
        const crypto = require('crypto');
        try {
            connection = await pool.getConnection(async conn => conn);
            [results] = await connection.query('SELECT * FROM Member'
                                    + ' WHERE memberID = ?', [id]);
            if (!results.length) {
                throw new Error('login fail');
            } else {
                crypto.pbkdf2(pw, results[0].salt, 100000, 64, 'sha512', (err, key) => {
                    if(key.toString('base64') === results[0].password){
                        const token = jwt.sign({
                            member_id: results[0].memberID,
                            type: results[0].type,
                            username: results[0].name,
                            email: results[0].email,
                            contact_number: results[0].contactNumber,
                            address: results[0].address,
                            zipcode: results[0].zipcode,
                            national: results[0].national
                        }, secret_key, {
                            expiresIn: '5m',
                            issuer: 'autoin.com',
                            subject: 'user_info'
                        });

                        res.status(200).json({
                            token
                        });
                    } else {
                        throw new Error('login fail');
                    }
                });
            }
        } catch (err) {
            console.log(err.message);
            if (err.message === 'login fail') {
                res.status(400).json({
                    message: err.message
                });
            } else {
                res.status(500).json({
                    message: err.message
                });
            }
        } finally {
            connection.release();
        }
    }
};

exports.check = (req, res, next) => {
    const token = req.headers['token'];
    console.log(req.headers);
    const jwt = require('jsonwebtoken');
    const secret_key = process.env.JWT_SECRET_KEY;

    try {
        const user_info = jwt.verify(token, secret_key);
        req.user = user_info;
        next();
    } catch (err) {
        console.log(err);
        res.status(401).json({
            message: err.message
        })
    }
};