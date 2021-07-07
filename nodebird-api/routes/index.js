const express = require("express");

// uuid 버전 4를 사용하고 기본으로 되어있는 v4를 uuidv4로 이름을 바꿈
const { v4: uuidv4 } = require("uuid");

const { User, Domain } = require("../models");
const { isLoggedIn } = require("./middlewares");

const router = express.Router();

// 접속시 로그인 화면을 보여주는 get라우터
router.get("/", async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: (req.user && req.user.id) || null },
      include: { model: Domain },
    });
    res.render("login", {
      user,
      domains: user && user.Domains,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 도메인 등록 post 라우터
// 폼으로부터 오는 데이터를 도메인 모델에 저장
router.post("/domain", isLoggedIn, async (req, res, next) => {
  try {
    await Domain.create({
      UserId: req.user.id,
      host: req.body.host,
      type: req.body.type,

      // clientSecret은 uuid 패키지를 통해 생성, 여러 버전이 있는데 버전 4 사용
      // 36자리 문자열 형식으로 생성되고, 세번째마디의 첫번째 숫자4가 버전을 알려준다
      clientSecret: uuidv4(),
    });
    res.redirect("/");
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
