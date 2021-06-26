var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// env 파일 참조
const dotenv = require("dotenv");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

// express-ejs-layouts 노드 패키지를 참조한다.
var expressLayouts = require("express-ejs-layouts");

// env 파일 참조
dotenv.config();

var app = express();

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

app.use("/", indexRouter);
app.use("/users", usersRouter);

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
