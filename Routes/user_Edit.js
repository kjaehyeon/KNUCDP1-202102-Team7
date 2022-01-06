exports.edit = async function (req, res, app, pool) {
    var email = req.body.email;
    var contactNumber = req.body.contactNumber;
    var address = req.body.address;
    var zipcode = req.body.zipcode;
    var national = req.body.national;
    var connection = null;
    var SQL = `UPDATE Member`
            + `SET email=?,`
            + `contactNumber=?,`
            + `address=?,`
            + `zipcode=?,`
            + `national=?` 
            + `WHERE memberID='${req.session.memberID}'`;
    try {
        connection = await pool.getConnection(async conn => conn);
        await connection.beginTransaction();
        await connection.query(SQL, [email, contactNumber, address, zipcode, national]);
        await connection.commit();
        req.session['email'] = email;
        req.session['contactNumber'] = contactNumber;
        req.session['address'] = address;
        req.session['zipcode'] = zipcode;
        req.session['national'] = national;
        res.send('success');
    } catch (err) {
        console.log(err.message);
        await connection.rollback();
        res.send(err);
    } finally {
        connection.release();
    }
}
