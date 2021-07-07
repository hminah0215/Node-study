const express = require("express");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");

const { Post, User } = require("../models");

const router = express.Router();

// 라우터용 미들웨어
// res.locals로 값을 설정하는 이유? 각 변수를 모든 템플릿 엔진에서 공통으로 사용하기 때문
router.use((req, res, next) => {
  console.log("+===============================================+");
  console.log("req.user!!!!!", req.user);
  console.log("+===============================================+");
  res.locals.user = req.user;
  res.locals.followerCount = 0;
  res.locals.followingCount = 0;
  res.locals.followerIdList = [];
  console.log("+===============================================+");
  console.log("회원정보!!!!!", res.locals.user);
  console.log("+===============================================+");
  next();
});

router.get("/profile", (req, res) => {
  res.render("profile", { title: "내정보 - NodeBird" });
});

router.get("/join", (req, res) => {
  res.render("join", { title: "회원가입 - NodeBird" });
});

router.get("/", async (req, res, next) => {
  try {
    // db에서 게시글을 작성자의 아이디,닉네임을 join 해서 조회한다.
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ["id", "nick"],
      },
      // 게시글의 순서는 최신순으로 정렬
      order: [["createdAt", "DESC"]],
    });

    // 조회한 결과를 twits에 담는다.
    res.render("main", {
      title: "NodeBird",
      twits: posts,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
