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
