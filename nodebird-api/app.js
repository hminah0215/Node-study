const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const morgan = require("morgan");
const session = require("express-session");
const ejs = require("ejs");

// dotenv, env 파일 참조
const dotenv = require("dotenv");
dotenv.config();

// auth 라우터 참조
const authRouter = require("./routes/auth");
// index 라우터 참조
const indexRouter = require("./routes");

// 시퀄라이즈 ORM  객체 참조하기
const { sequelize } = require("./models");
// passport 패키지 참조
const passportConfig = require("./passport");
const exp = require("constants");

const app = express();

// 패스포트 설정
passportConfig();

app.set("port", process.env.PORT || 3002); // 3002번 port 사용

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// 시퀄라이즈 ORM 객체를 이용해 지정한 MySQL 연결 동기화 하기
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.error(err);
  });

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// 클라이언트의 form 값을 req.body에 넣어줌
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser(process.env.COOKIE_SECRET));

// passport를 사용하기 위해서 session이 필요
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      secure: false, // true인 경우 https 에서만 사용가능
      httpOnly: true,
    },
  })
);

// 요청(req 객체)에 passport 설정을 심는 미들웨어
app.use(passport.initialize());

// req.session 객체에 passport 정보를 저장, deserializeUser가 실행되는 곳
app.use(passport.session());

// index
app.use("/", indexRouter);
// auth
app.use("/auth", authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
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

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기중");
});

module.exports = app;
