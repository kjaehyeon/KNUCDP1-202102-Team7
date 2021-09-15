var request = require('request');

exports.login = (fdata, callback) => {
    request.post({
        url: `http://${fdata.ip}/User/Login`,
        body: {memberID: fdata.id, password: fdata.pw},
        json: true,
        jar: fdata.jar
    }, (error, response, body) => {
        if (body === 'loginSuccess') callback();
        else if (body === 'loginError01') console.log('login: id error');
        else if (body === 'loginError02') console.log('login: pw error');
        else if (!body) console.log(`unable to connect: ${fdata.ip}`);
        else console.log(`login error: ${body}\n`);
    });
}

exports.sendrfid = (rfid, fdata, callback) => {
    request.post({
        url: `http://${fdata.ip}/Iot/RFID`,
        body: {memberID: fdata.id, rfid: rfid},
        json: true,
        jar: fdata.jar
    }, (error, response, body) => {
        if (body === 'success') {
            console.log(`rfid ${rfid}: success`);
        } else if (body === 'unauthorized') {
            console.log(`rfid ${rfid}: need to login`);
            callback(fdata, () => {});
            module.exports.sendrfid(rfid, fdata, callback);
        } else if (body === 'rfid not exist') {
            console.log(`rfid ${rfid}: ${body}`);
        }
    });
}
