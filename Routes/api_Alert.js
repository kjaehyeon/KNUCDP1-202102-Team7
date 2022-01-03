exports.alert = async (req, res, pool) => {
    const crypto = require('crypto');
    const request = require('request');
    
    const to_list = [];
    const ip = req.headers['client-ip'];
    if(!ip){
        res.status(400).json({err: 'Cannot Access'});
    } else{
        try {
            const connection = await pool.getConnection(async conn => conn);
            const [result] = await db.query('SELECT warehouseName FROM Warehouse'
                                                + ' WHERE iotServer = ?', [ip])
            const warehouse_name = result[0].warehouseName;
            const admin_phone = await connection.query("SELECT contactNumber FROM Member WHERE type = 'admin'");
            const provider_phone = await connection.query('SELECT M.contactNumber'
                                                        + ' FROM Member M, Provider P, Warehouse W'
                                                        + ' WHERE M.memberID = P.memberID'
                                                        + ' AND P.warehouseID = W.warehouseID'
                                                        + ' AND W.iotServer = ?', [ip]);
            const buyer_phone = await connection.query('SELECT M.contactNumber'
                                                    + ' FROM Member M, Contract C, Warehouse W' 
                                                    + ' WHERE M.memberID = C.buyerID'
                                                    + ' AND C.warehouseID = W.warehouseID'
                                                    + ' AND W.iotServer = ?', [ip]);
            admin_phone.map((data)=>{
                to_list.push({'to': data.contactNumber.replace(/-/g, '')});
            })
            provider_phone.map((data)=>{
                to_list.push({'to': data.contactNumber.replace(/-/g, '')});
            })
            buyer_phone.map((data)=>{
                to_list.push({'to': data.contactNumber.replace(/-/g, '')});
            })

            const ncp_accessKey = process.env.ACCESS_KEY;          
            const ncp_secretKey = process.env.SECRET_KEY;    
            const ncp_serviceID = process.env.SERVICE_ID;
            const phone_number = process.env.PHONE_NUMBER;
        
            const space = " ";
            const newLine = "\n";
            const method = "POST";
        
            const url = `https://sens.apigw.ntruss.com/sms/v2/services/${ncp_serviceID}/messages`;  
            const url2 = `/sms/v2/services/${ncp_serviceID}/messages`;
        
            const timestamp = Date.now().toString();
            let message = [];
            let hmac=crypto.createHmac('sha256',ncp_secretKey);
        
            message.push(method);
            message.push(space);
            message.push(url2);
            message.push(newLine);
            message.push(timestamp);
            message.push(newLine);
            message.push(ncp_accessKey);
            const signature = hmac.update(message.join('')).digest('base64');
        
            request({
                method: method,
                json: true,
                uri: url,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'x-ncp-iam-access-key' : ncp_accessKey,
                    'x-ncp-apigw-timestamp': timestamp,
                    'x-ncp-apigw-signature-v2': signature.toString()
                },
                body: {
                    "type":"LMS",
                    "contentType":"COMM",
                    "countryCode":"82",
                    "from": phone_number,
                    "content": `[Autoinven]\n\n창고 ${warehouse_name}에서 현재 긴급상황이 발생했습니다.` 
                                + `사이트 "autoinven.com"에 방문하여 확인 후 이상상황이 지속된다면,` 
                                + `필히 방문 점검 부탁드립니다.\n\n감사합니다.\n-autoinven`,
                    "messages": to_list
                }
            },function (err, res, html) {
                if(err) console.log(err);
                else res.status(200).json({message: 'ok'});
            });
        } catch (err) {
            console.log(err.message);
        } finally {
            connection.release();
        }
    }
}