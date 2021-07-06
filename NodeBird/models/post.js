const Sequelize = require("sequelize");

/*
게시글 모델.
게시글 내용과 이미지 경로를 저장. 
게시글 등록자의 아이디를 담은 컬럼은 관계 설정하면 알아서 생성한다.
*/

module.exports = class Post extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        content: {
          type: Sequelize.STRING(140),
          allowNull: false,
        },
        img: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Post",
        tableName: "posts",
        paranoid: false,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }
  /*
  db.Post.belongsTo(db.User) -> user,post 모델은 1:N 관계이므로 belongsTo로 연결됨 
  (게시글의 작성자가 누구인지 넣어야 하므로 UserId 컬럼을 추가)

  해시태그는 post 모델과 N:M관계! user.js에 주석 달아놓은 내용 참고. 
*/
  static associate(db) {
    db.Post.belongsTo(db.User);
    db.Post.belongsToMany(db.Hashtag, { through: "PostHashtag" });
  }
};
