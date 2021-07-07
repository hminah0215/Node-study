const passport = require("passport");

// passport-local 모듈에서 Strategy 생성자를 불러와 전략을 구현한다.
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const User = require("../models/user");

module.exports = () => {
  // LocalStrategy 생성자의 첫번째 인수로 주어진 객체, 전략에 관한 설정을 한다.
  passport.use(
    new LocalStrategy(
      {
        // 각 필드에는 일치하는 로그인 라우터의 req.body 속성명을 적으면 됨 (name값)
        usernameField: "email",
        passwordField: "password",
      },

      // 실제 전략을 수행하는 함수. LocalStrategy 생성자의 두번째 인수
      // 첫번째 인수에서 넣어준 email,password가 async 함수의 매개변수가 된다.
      // 세번째 매개변수인 done은 passport.authenticate의 콜백 함수
      async (email, password, done) => {
        try {
          // 사용자 db에서 일치하는 이메일이 있는지 찾는다.
          const exUser = await User.findOne({ where: { email } });
          if (exUser) {
            // 일치하는 메일이 있다면 bcrypt의 compare 함수로 비밀번호를 비교한다.
            const result = await bcrypt.compare(password, exUser.password);

            if (result) {
              console.log("비밀번호가 일치합니다. 로그인 성공");
              // 비밀번호가 일치하면 done 함수의 두번째 인수로 사용자 정보를 넣어 보낸다.
              done(null, exUser);
            } else {
              // 비밀번호가 다를때 에러
              done(null, false, { message: "비밀번호가 일치하지 않습니다." });
            }
          } else {
            // 존재하지 않는 회원일때 에러
            done(null, false, { message: "가입되지 않은 회원입니다." });
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
