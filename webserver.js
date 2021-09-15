// 0. 모듈 불러오기
// 1) Express Module 불러오기
const express = require('express');
const app = express();
//
require('dotenv').config();
// 2) bodyParser Module 불러오기
const bodyParser = require('body-parser');
// 3) MySQL Module 불러오기
const mySQL = require('./Module/db');
// 4) EJS Module 불러오기
const ejs = require('ejs');
const fileUpload = require('express-fileupload');
const fs = require('fs');
// const bcsock = require('./Module/bcsocket');
var apolloServer = require('./apollo');
var http = require('http');

// 1. 설정
// 1) View 경로 설정
app.set('views', __dirname + '/Views');
// 2) 화면 Engine을 ejs로 설정
app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);
// 3) Session 설정(생성)
var session = require('express-session');
// 4) 중첩된 객체허용 여부 결정
app.use(bodyParser.urlencoded({extended: true}));
// 5) JSON 방식의 Content-Type 데이터를 받기
app.use(bodyParser.json());
// 6) 'Public' Directory에 정적 파일(사진, 이미지)을 위치시키기
app.use(express.static('Public'));
// 7) CORS 허용
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    next();
});
app.use(fileUpload({
    limits: {fileSize: 50 * 1024 * 1024}
}));

// apollo
var server = http.createServer(app);
apolloServer.applyMiddleware({app});
apolloServer.installSubscriptionHandlers(server);

var MySQLStore = require('express-mysql-session')(session);


// 8) 세션을 적용
app.use(session({
    // 8-1) 세션 암호화
    secret: '@#@$SIGN#@$#$',
    // 8-2) 수정사항이 생기지 않은 세션 요청이 왔을 때 다시 저장할지
    resave: false,
    // 8-3) 세션에 저장할 내역이 없더라도, 세션 저장할지
    saveUninitialized: true,
    // 8-4) 서버가 재시작되어도 세션 유지
    store: new MySQLStore(mySQL.info)
}));
// 9) mySQL Connection 변수를 저장
var dbConnection = mySQL.init();

// 10) 각 라우터에 인자값을 넘겨주는 것
app.use('/', require('./Routes/main')(app, dbConnection));
app.use('/User', require('./Routes/user')(app, dbConnection));
app.use('/Admin', require('./Routes/ad')(app, dbConnection));
app.use('/Provider', require('./Routes/pv')(app, dbConnection));
app.use('/Buyer', require('./Routes/by')(app, dbConnection));
app.use('/Iot', require('./Routes/iot')(app, dbConnection));

app.get('/Public/Upload/:filename', function (req, res) {
    fs.readFile(__dirname + `/Public/Upload/${req.params.filename}`, function (err, data) {
        if (err) throw err;
        res.write(data);
    })
});

// 없는 페이지 alert 띄우기
app.use((req, res, next) => {
    console.log(`${req.path}: not found`);
    res.render('Alert/cannotAccess');
});

// 11) 서버를 열 때 설정 함수
server.listen(5000, function (req, res) {
    console.log('connected!!');
});
