const Sequelize = require("sequelize");

module.exports = class Domain extends Sequelize.Model {
  static init(sequelize) {
    //
    // domain모델에는 인터넷주소(host), 도메인종류(type), 클라이언트 비밀키(clientSecret)이 들어감
    return super.init(
      {
        host: {
          type: Sequelize.STRING(80),
          allowNull: false,
        },
        type: {
          // ENUM 컬럼속성은 넣을 수 있는 값을 제한하는 데이터 형식
          // 무료free, 프리미엄premium 중에서 하나의 종류만 선택할 수 있게 쓴거고 어기면 에러가 발생한다.
          // 무료와 프리미엄의 차이는 나중에 사용량 제한을 구현하기 위한 구분 값
          type: Sequelize.ENUM("free", "premium"),
          allowNull: false,
        },
        clientSecret: {
          // 클라이언트 비밀키는 다른 개발자들이 api를 사용할 때 필요한 비밀키 (카카오 로그인구현시 인증키 같은것)
          // 유출되지 않아야 하므로, 안전 장치로써, 요청을 보낸 도메인 까지 일치해야 요청을 보낼 수 있게 제한을 둔다.
          // UUID 타입은 충돌가능성이 매우 적은 랜덤한 문자열!
          type: Sequelize.UUID,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        modelName: "Domain",
        tableName: "domains",
      }
    );
  }

  // 사용자 모델과 1:N 관계를 가진다. 사용자 한명이 여러 도메인을 소유 할 수도있기 때문
  static associate(db) {
    db.Domain.belongsTo(db.User);
  }
};
