const passport = require("passport");

// 각각 로컬 로그인과 카카오 로그인 전략에 대한 파일
// passport는 로그인 시의 동작을 전략(Strategy)라는 용어로 표현한다.
const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");

const User = require("../models/user");

// 이 부분이 Passport를 이해하는 핵심!!
module.exports = () => {
  // serializeUser는 로그인시 실행되면, req.session객체에 어떤 데이터를 저장할지 정하는 메서드!
  // 매개변수로 user를 받고나서, done 함수에 두 번째 인수로 user.id를 넘기고 있다.
  passport.serializeUser((user, done) => {
    // done 함수의 첫 번째 인수는 에러 발생시 사용, 두번째 인수에는 저장하고 싶은 데이터를 넣음
    // 사용자 정보를 모두 저장하면 용량이 커지므로, 사용자의 아이디만 저장하라고 한 것

    console.log("serializeUser 사용자 id = ", user.id);
    done(null, user.id);
  });

  // deserializeUser는 매 요청시마다 실행된다! passpoet.session 미들웨어가 이 메서드를 호출함.
  // serializeUser의 done의 두번 째 인수로 넣었던 데이터가 deserializeUser는의 매개변수가 된다. (사용자 아이디)
  passport.deserializeUser((id, done) => {
    //
    console.log("deserializeUser 사용자 id = ", id);
    // serializeUser에서 세션에 저장했던 아이디를 받아 db에서 사용자 정보를 조회하고, 그 정보를 req.user에 저장함!
    // 그러므로 req.user를 통해서 로그인 한 사용자의 정보를 가져올 수 있다.
    User.findOne({
      where: { id },

      // 사용자 정보 조회시 팔로잉 목록과 팔로워 목록도 같이 조회한다.
      include: [
        {
          model: User,
          attributes: ["id", "nick"],
          as: "Followers",
        },
        {
          model: User,
          // include에서 attributes을 지정하는 이유? 실수로 비밀번호를 조회하는 것을 방지하려고
          attributes: ["id", "nick"],
          as: "Followings",
        },
      ],
    })
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });

  local();
  kakao();
};
