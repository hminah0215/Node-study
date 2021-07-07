// jsonwebtoken 패키지 사용
const jwt = require("jsonwebtoken");

// 로그인 여부를 파악한다.
exports.isLoggedIn = (req, res, next) => {
  //
  // req객체에 isAuthenticated 메서드를 추가, 로그인 중이면 true!
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send("로그인 필요");
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    const message = encodeURIComponent("로그인한 상태입니다.");
    res.redirect(`/?error=${message}`);
  }
};

//
exports.verifyToken = (req, res, next) => {
  try {
    // req.headers.authorization -> 요청 헤더에 저장된 토큰 사용
    // verify(첫번째인수,두번째인수) 메서드로 토큰을 검증함. 첫번째인수는 토큰, 두번째 인수는 토큰의 비밀키

    // 인증에 성공하면 req.decoded에 반환된 토큰의 내용을 저장한다.
    req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    // 토큰의 비밀키가 일치 하지 않는다면 catch문

    if (error.name === "TokenExpiredError") {
      // 유효기간초과 에러면..!
      return res.status(419).json({
        code: 419,
        message: "토큰 유효기간이 만료되었습니다.",
      });
    }

    return res.status(401).json({
      code: 401,
      message: "유효하지 않은 토큰입니다.",
    });
  }
};
