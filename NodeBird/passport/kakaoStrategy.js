const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;

const User = require("../models/user");

module.exports = () => {
  //
  // 카카오 로그인에 대한 설정
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_ID, // 카카오에서 발급해주는 아이디 (노출되면 안됨 보통 .env 파일에 넣는다.)
        callbackURL: "/auth/kakao/callback", // 카카오로부터 인증결과를 받을 라우터주소
      },

      // 기존에 카카오를 통해 회원가입한 사용자가 있는지 조회한다.
      async (accessToken, refreshToken, profile, done) => {
        console.log("kakao profile", profile);
        try {
          const exUser = await User.findOne({
            where: { snsId: profile.id, provider: "kakao" },
          });
          // 사용자가 있다면 사용자 정보와 함께 done 함수를 호출하고 전략을 종료한다.
          if (exUser) {
            done(null, exUser);

            // 사용자가 없다면 회원가입을 진행한다.
            // 카카오에서는 인증 후 callbackURL에 적힌 곳으로 accessToken, refreshToken, profile을 보낸다.
            // profile에는 사용자 정보들이 들어있음! console.log(profile)로 확인해 볼 것!
          } else {
            const newUser = await User.create({
              email: profile._json && profile._json.kakao_account_email,
              nick: profile.displayName,
              snsId: profile.id,
              provider: "kakao",
            });
            // 카카오를 통해 회원가입이 끝나면 done 함수 호출
            done(null, newUser);
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
