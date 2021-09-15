exports.emailIDF = async function (req, res, app, db) {

    let authNum = Math.random().toString().substr(2, 6);
    const ejs = require('ejs');
    let emailTemplete;

    // 보내진 이메일에 나타나는 부분.
    ejs.renderFile('Views/User/user_EmailIDF.ejs', {'authCode': authNum}, function (err, data) {
        if (err) {console.log('ejs.renderFile err:' + err)}
        emailTemplete = data;
    });

    var nodemailer = require('nodemailer');

    let smtpTransport = nodemailer.createTransport({
        service: process.env.MAIL_SERVICE,
        host: process.env.MAIL_HOST,
        auth: {
            user: process.env.MAIL_ID,
            pass: process.env.MAIL_PW
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: `IDENTIFY YOUR EMAIL <service@autoingroup.com>`,
        to: req.body.email,
        subject: 'identfiy mail',
        html: emailTemplete
    };

    smtpTransport.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.send({"result": false, "authNum": null});
        } else {
            res.send({"result": true, "authCode": authNum});
        }
    });
}
