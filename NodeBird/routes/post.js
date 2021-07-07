const express = require("express");

// 파일 업로드 처리를 위한 multer 패키지 참조
const multer = require("multer");

const path = require("path");
const fs = require("fs");

const { Post, Hashtag } = require("../models");
const { isLoggedIn } = require("./middlewares");

const router = express.Router();

try {
  fs.readdirSync("uploads");
} catch (error) {
  console.error("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
  fs.mkdirSync("uploads");
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);

      // /img/burger1625634021496.jpg 이런식으로 db에 저장됨
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// 이미지 하나를 업로드받은 뒤 이미지의 저장경로를 클라이언트로 응답한다.
// 이미지는 이때 이미 저장됨!
router.post("/img", isLoggedIn, upload.single("img"), (req, res) => {
  console.log("이미지 저장=======>", req.file);
  res.json({ url: `/img/${req.file.filename}` });
});

const upload2 = multer();

// 게시글 업로드를 처리하는 라우터
router.post("/", isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    // 게시글을 db에 저장
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });

    // 게시글 내용에서 해시태그를 정규표현식으로 추출한다.
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map((tag) => {
          // findOrCreate 메서드는 db에 해시태그가 존재하면 가져오고, 존재하지 않으면 생성한 후 가져옴
          return Hashtag.findOrCreate({
            // 해시태그를 저장할때 해시태그에서 # 을 떼고, 소문자로 바꾼다.
            where: { title: tag.slice(1).toLowerCase() },
          });
        })
      );
      // 결과 값으로 모델과 생성여부를 반환하는데, (result.map((r) => r[0])) 으로 모델만 추출함
      // 그 후, post.addHashtags 메서드로 게시글과 연결한다.
      await post.addHashtags(result.map((r) => r[0]));
    }
    res.redirect("/");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
