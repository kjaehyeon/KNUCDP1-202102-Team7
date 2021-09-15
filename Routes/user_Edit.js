exports.edit = function (req, res, app, db) {
    var email = req.body.email;
    var contactNumber = req.body.contactNumber;
    var address = req.body.address;
    var zipcode = req.body.zipcode;
    var national = req.body.national;
    var SQL = `UPDATE Member SET email=?,contactNumber=?,address=?,zipcode=?,national=? WHERE memberID='${req.session.memberID}'`
    var check = db.query(SQL, [email, contactNumber, address, zipcode, national]);
    if (!check) {
        console.log("error ocurred", error);
        res.send(error);
    } else {
        req.session['email'] = email;
        req.session['contactNumber'] = contactNumber;
        req.session['address'] = address;
        req.session['zipcode'] = zipcode;
        req.session['national'] = national;
        res.send('success');
    }
}
