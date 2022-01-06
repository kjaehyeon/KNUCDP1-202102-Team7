exports.delete = async function (req, res, app, pool) {

    var memberID = req.session.memberID;
    var memberType = req.session.type;
    var name = req.session.name;
    var email = req.session.email;
    var contactNumber = req.session.contactNumber;
    var address = req.session.address;
    var national = req.session.national;
    var deletedDate = new Date();

    var insertSQL = `INSERT INTO Deletedmember SET memberID=?, type=?, password=?, email=?, contactNumber=?, address=?, nationa=?, DeletedDate=?`;
    var deleteSQL = `DELETE FROM Member WHERE memberID='${req.session.memberID}'`;
    var connection = null;
    var check = null;

    try {
        connection = await pool.getConnection(async conn => conn);
        await connection.beginTransaction();
        await connection.query(insertSQL, [memberID, memberType, name, email, contactNumber, address, national, deletedDate]);
        await connection.query(deleteSQL);
        await connection.commit();
        check = true;
    } catch (err) {
        console.log(err.message);
        await connection.rollback();
        check = false;
    } finally {
        connection.release();
    }

    if (!check) {
        res.redirect('/User/Edit');
    } else {
        req.session.destroy();
        res.redirect('/');
    }
}
