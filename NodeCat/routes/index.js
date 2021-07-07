const express = require("express");
const axios = require("axios");

const router = express.Router();

// 토큰 테스트 get 라우터
router.get("/test", async (req, res, next) => {
  //
  try {
    // 세션에 토큰이 없으면 토큰 발급을 시도한다.
    if (!req.session.jwt) {
      const tokenResult = await axios.post("http://localhost:3002/v1/token", {
        clientSecret: process.env.CLIENT_SECRET,
      });

      // 토큰 발급 성공이면..!!
      if (tokenResult.data && tokenResult.data.code === 200) {
        // 세션에 토큰을 저장한다
        req.session.jwt = tokenResult.data.token;
        //console.log("세션에 토큰저장=====>", req.session.jwt);
      } else {
        // 토큰 발급 실패면 발급실패사유를 보낸다
        return res.json(tokenResult.data);
      }
    }

    // 발급받은 토큰을 테스트한다.
    const result = await axios.get("http://localhost:3002/v1/test", {
      //
      // jwt 토큰을 본문 요청대신 authorization header에 넣음 -> 보통 인증용 토큰은 이 헤더에 주로 넣어 전송한다
      headers: { authorization: req.session.jwt },
    });
    return res.json(result.data);
  } catch (error) {
    console.error(error);

    // 토큰유효기간이 만료되었다면..!
    if (error.response.status === 419) {
      return res.json(error.response.data);
    }
    return next(error);
  }
});

module.exports = router;
