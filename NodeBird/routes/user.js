const express = require("express");

const { isLoggedIn } = require("./middlewares");
const User = require("../models/user");

const router = express.Router();

// 와일드카드 방식
router.post("/:id/follow", isLoggedIn, async (req, res, next) => {
  try {
    // 1. 팔로우 할 사용자를 db에서 조회한다.
    const user = await User.findOne({ where: { id: req.user.id } });

    if (user) {
      // 2. 시퀄라이즈에서 추가한 addFollowing 메서드로 현재 로그인한 사용자와의 관계를 지정한다.
      // 이 후 req.user에 팔로워와 팔로잉 목록을 저장해야 하므로 passport/index.js에서 deserializeUser를 조작해야함
      await user.addFollowing(parseInt(req.params.id, 10));
      res.send("success");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
