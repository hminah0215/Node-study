// 시퀄라이즈 ORM 프레임워크 패키지 참조
const Sequelize = require("sequelize");

// DB연결정보가 있는 config파일에서 development항목의 DB정보를 조회한다.
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];

// 각종 모델 클래스를 db 객체의 속성으로 노출해줘 Route에서 해당 모델들을 접근하고 사용할 수 있는 환경을 제공한다.
// db객체에 특정 테이블들을 제어하는 모델 클래스를 특정 속성명으로 노출해준다.
const User = require("./user");
const Post = require("./post");
const Hashtag = require("./hashtag");
const Domain = require("./domain");

// DB관리 객체 생성
// db 객체는 실제 ORM 모델을 이용해 DB프로그래밍하는 Routing 메소드에서 사용하는
// db데이터 제어 객체이다.
const db = {};

// 시퀄라이즈 ORM객체 생성
// 시퀄라이즈 ORM객체 생성시 관련 DB연결정보 전달생성
const sequelize = new Sequelize(config.database, config.username, config.password, config);

// DB객체에 시퀄라이즈 객체를 속성에 바인딩한다.
// DB객체에 시퀄라이즈 모듈을 속성에 바인딩한다.
db.sequelize = sequelize;
db.User = User;
db.Post = Post;
db.Hashtag = Hashtag;
db.Domain = Domain;

User.init(sequelize);
Post.init(sequelize);
Hashtag.init(sequelize);
Domain.init(sequelize);

// 테이블 관계 설정
User.associate(db);
Post.associate(db);
Hashtag.associate(db);
Domain.associate(db);

// DB관리객체 모듈 출력
module.exports = db;
