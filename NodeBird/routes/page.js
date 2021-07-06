const express = require("express");

const router = express.Router();

// 라우터용 미들웨어
// res.locals로 값을 설정하는 이유? 각 변수를 모든 템플릿 엔진에서 공통으로 사용하기 때문
router.use((req, res, next) => {
  res.locals.user = null;
  res.locals.followerCount = 0;
  res.locals.followingCount = 0;
  res.locals.followerIdList = [];
  next();
});

router.get("/profile", (req, res) => {
  res.render("profile", { title: "내정보 = NodeBird" });
});

router.get("/join", (req, res) => {
  res.render("join", { title: "회원가입 = NodeBird" });
});

router.get("/", (req, res, next) => {
  const twits = [];
  res.render("main", {
    title: "NodeBird",
    twits,
  });
});

module.exports = router;
