const express = require("express");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");

const { Post, User, Hashtag } = require("../models");

const router = express.Router();

// 라우터용 미들웨어
// res.locals로 값을 설정하는 이유? 각 변수를 모든 템플릿 엔진에서 공통으로 사용하기 때문
router.use((req, res, next) => {
  // console.log("+===============================================+");
  // console.log("req.user!!!!!", req.user);
  // console.log("+===============================================+");
  res.locals.user = req.user;

  // 로그인 한 경우 req.user가 이미 존재하므로 팔로우,팔로잉 숫자 표시 및 팔로우 버튼 표시
  res.locals.followerCount = req.user ? req.user.Followers.length : 0;
  res.locals.followingCount = req.user ? req.user.Followings.length : 0;
  // 팔로워 아이디 리스트에서 게시글 작성자의 아이디가 존재하지 않으면 팔로우 버튼을 보여준다.
  res.locals.followerIdList = req.user ? req.user.Followings.map((f) => f.id) : [];

  // console.log("+===============================================+");
  // console.log("회원정보!!!!!", res.locals.user);
  // console.log("+===============================================+");
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

// 해시태그 검색 라우터
// 쿼리스트링방식으로 해시태그 이름을 받고, 해시태그 값이 없으면 메인페이지로 돌려보냄
router.get("/hashtag", async (req, res, next) => {
  const query = req.query.hashtag;
  if (!query) {
    return res.redirect("/");
  }
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      // 해시태그가 있다면 모든 게시글을 가져오고, 가져올때 작성자 정보를 합친다.
      posts = await hashtag.getPosts({ include: [{ model: User }] });
      console.log("+===============================================+");
      console.log("트윗post=============>", posts);
      console.log("+===============================================+");
    }

    // 조회 후, 메인페이지를 렌더링 하면서 전체 게시글 대신 조회된 게시글만 twits에 담는다.
    return res.render("main", {
      title: `${query} | NodeBird`,
      twits: posts,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;
