const Sequelize = require("sequelize");

/*
사용자 정보를 저장하는 모델
이메일, 닉네임, 비밀번호를 저장하고, sns 로그인을 했을 경우에는 sns명과 snsId를 저장한다. 
provider가 local이면 로컬로그인, kakao면 카카오 로그인을 한 것.(디폴트는 로컬)
*/

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        email: {
          type: Sequelize.STRING(40),
          allowNull: true,
          unique: true,
        },
        nick: {
          type: Sequelize.STRING(15),
          allowNull: false,
        },
        password: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        provider: {
          type: Sequelize.STRING(10),
          allowNull: false,
          defaultValue: "local",
        },
        snsId: {
          type: Sequelize.STRING(30),
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "User",
        tableName: "users",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  /*
  db.User.hasMany(db.Post) -> user 모델과 post 모델은 1(user):N(post) 이므로 hasMany 관계
  db.User.belongsToMany(db.User, ~~ 
    -> 사용자 한명이 팔로워를 많이 가질수있고, 한사람이 여러사람을 팔로잉 할수도 있으니 N:M 관계(팔로잉기능)
  
    주의!! 
    같은 테이블 간 N:M 관계에서는 모델이름과 컬럼 이름을 따로 정해야 한다. 
    모델이름이 UserUser 인건 좀그러니까 through 옵션으로 생성할 모델이름은 Follow로 정해 줌 
    &
    Follow 모델에서 사용자 아이디를 저장하는 컬럼 이름이 둘 다 UserId이면 팔로워인지 팔로잉 중인 사람인지 헷갈리므로
    foreignKey 옵션에 각각 followerId, followingId를 넣어줘서 두 사용자 아이디 구별 
    &
    같은 테이블간의 N:M 관계에서 as 옵션도 넣어야 한다. 
    둘다 User 모델이라 구분되지 않으므로!! 이때, as는 foreignkey와 반대되는 모델을 가리켜야 함!!! 
    foreignKey가 followerId(팔로워 아이디)면 as는 Followings(팔로잉), 
    팔로워를 찾으려면 먼저 팔로일 하는 사람의 아이디를 찾아야하는 것으로 생각하면 된다고 써져있다.

    좀 헷갈리지만 주석 잘 적어놨으니 틈틈이 확인 할 것.
  */
  static associate(db) {
    db.User.hasMany(db.Post);
    db.User.belongsToMany(db.User, {
      foreignKey: "followingId",
      as: "Followers",
      through: "Follow",
    });
    db.User.belongsToMany(db.User, {
      foreignKey: "followerId",
      as: "Followings",
      through: "Follow",
    });
  }
};
