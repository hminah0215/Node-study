const express = require("express");
const passport = require("passport");

// hash 암호화 알고리즘 적용 암호문자열 저장 패키지 참조
const bcrypt = require("bcrypt");

// middlewares.js 참조
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const User = require("../models/user");

const router = express.Router();

// http://localhost:3000/auth/join
// 회원가입 라우터
router.post("/join", isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    // 기본에 같은 이메일로 가입한 사용자가 있는지 조회
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      // 있다면, 회원가입 페이지로 되돌려 보낸다. 이때 주소뒤에 에러를 쿼리스트링으로 표시
      return res.redirect("/join?error=exist");
    }

    // 같은 이메일로 가입한 사용자가 없다면 비밀번호를 암호화하고 사용자 정보를 생성한다.
    // bcrypt 의 두번째 인수는 숫자가 커질수록 비밀번호를 알아내기 어렵지만, 암호화 시간도 오래걸림!
    // 12 이상을 쓰길 추천하고, 31까지 가능하다.
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.redirect("/");
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

// http://localhost:3000/auth/login
// 로그인 라우터
router.post("/login", isNotLoggedIn, (req, res, next) => {
  // 로그인 요청이 들어오면 passport.authenticate('local') 미들웨어가 로컬 로그인 전략을 수행함
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`/?loginError=${info.message}`);
    }

    // 전략이 성공하거나 실패하면!
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect("/");
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});

// http://localhost:3000/auth/logout
// 로그아웃 라우터
router.get("/logout", isLoggedIn, (req, res) => {
  // req.user 객체를 제거하고
  req.logout();

  // req.session 객체의 내용을 제거한다.
  req.session.destroy();

  // 세션정보를 모두 지운 후 메인 페이지로 돌아감
  res.redirect("/");
});

// http://localhost:3000/auth/kakao
// 카카오 로그인 라우터
// 로그인 전략을 수행하고,
router.get("/kakao", passport.authenticate("kakao"));

// 수행한 성공 여부 결과를 받는다. 이 라우터에서는 카카오 전략을 다시 수행함
router.get(
  "/kakao/callback",

  // 로컬로그인과 다르게 authenticate메서드에서 콜백 함수를 제공하지 않음.
  passport.authenticate("kakao", {
    // 대신, 로그인에 실패했을때 어디로 이동할지를 적는다.
    failureRedirect: "/",
  }),
  (req, res) => {
    res.redirect("/");
  }
);

module.exports = router;
