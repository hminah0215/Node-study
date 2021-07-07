// v1 이라고 네이밍 한 이유? 버전1이라는 뜻으로 1.0.0 이런식으로 정해도 된다.
// 한번 버전이 정해진 후 라우터를 함부로 수정하면, 다른 사람이나 서비스가 기존 API를 사용중일때 영향을 미치므로
// 버전을 올린 라우터를 새로 추가하고 이전 API를 쓰는 사람들에게 새로운 API가 나왔음을 알리는 것이 좋다
const express = require("express");
const jwt = require("jsonwebtoken");

const { verifyToken } = require("./middlewares");
const { Domain, User } = require("../models");

const router = express.Router();

// 토큰을 발급하는 post 라우터
// localhost:3002/v1/token
router.post("/token", async (req, res) => {
  const { clientSecret } = req.body;
  try {
    // 전달받은 클라이언트 비밀키로 등록된 도메인인지 확인한다.
    const domain = await Domain.findOne({
      where: { clientSecret },
      include: {
        model: User,
        attribute: ["nick", "id"],
      },
    });
    // console.log("domain정보 ===============>", domain);

    // 등록되지않은 도메인이면!
    if (!domain) {
      return res.status(401).json({
        code: 401,
        message: "등록되지 않은 도메인입니다. 먼저 도메인을 등록하세요",
      });
    }

    // sign(토큰의 내용, 토큰의 비밀키, 토큰의 설정)
    const token = jwt.sign(
      {
        // sign의 첫번째 인수
        id: domain.User.id,
        nick: domain.User.nick,
      },
      // sign의 두번째 인수
      process.env.JWT_SECRET,
      {
        // sign의 세번째 인수 -> 유효기간,발급자 등의 정보를 설정
        expiresIn: "1m",
        issuer: "nodebird",
      }
    );
    // 등록된 도메인이면 인증토큰을 발급한다.
    return res.json({
      code: 200,
      message: "인증토큰이 발급되었습니다.",
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "서버 에러 관리자에게 문의하세요.",
    });
  }
});

// 사용자가 토큰을 테스트 할 수 있는 get 라우터
// middelware.js에서 만든 토큰을 검증하는 미들웨어를 거친 후,
// 검증이 성공하면 토큰의 내용물을 보낸다.
router.get("/test", verifyToken, (req, res) => {
  res.json(req.decoded);
});

module.exports = router;
