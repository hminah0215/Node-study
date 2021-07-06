const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const passport = require("passport");

// env 파일 참조
const dotenv = require("dotenv");

// page 라우터 참조
const pageRouter = require("./routes/page");
// auth 라우터 참조
const authRouter = require("./routes/auth");

// express-ejs-layouts 노드 패키지를 참조한다.
const expressLayouts = require("express-ejs-layouts");

// env 파일 참조
dotenv.config();

// 시퀄라이즈 ORM  객체 참조하기
const sequelize = require("./models/index.js").sequelize;

// passport 패키지 참조
const passportConfig = require("./passport");

const app = express();

// 시퀄라이즈 ORM 객체를 이용해 지정한 MySQL 연결 동기화 하기
sequelize.sync();

// 패스포트 설정
passportConfig();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// 기본 레이아웃 페이지를 views 폴더 내 layout.ejs파일로 지정한다.
app.set("layout", "layout");
// 컨텐츠 페이지내 스크립트를 레이아웃 페이지에서 사용하게 하고, 외부 스크립트 파일도 사용 할 수 있게 설정한다.
app.set("layout extractScripts", true);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// 요청(req 객체)에 passport 설정을 심는 미들웨어
app.use(passport.initialize());

// req.session 객체에 passport 정보를 저장한다.
app.use(passport.session());

// page
app.use("/", pageRouter);
// auth
app.use("/auth", authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
