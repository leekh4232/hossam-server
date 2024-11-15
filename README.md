# mega-server-js

![Badge](https://img.shields.io/badge/Author-Lee%20KwangHo-blue.svg?style=flat-square&logo=appveyor) &nbsp;
![Generic badge](https://img.shields.io/badge/version-1.0.0-critical.svg?style=flat-square&logo=appveyor) &nbsp;
[![The MIT License](https://img.shields.io/badge/license-MIT-orange.svg?style=flat-square&logo=appveyor)](http://opensource.org/licenses/MIT) &nbsp;
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=flat-square&logo=javascript&logoColor=%23F7DF1E) &nbsp;
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=flat-square&logo=node.js&logoColor=white) &nbsp;
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=flat-square&logo=express&logoColor=%2361DAFB) &nbsp;
![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=flat-square&logo=npm&logoColor=white) &nbsp;
![Yarn](https://img.shields.io/badge/yarn-%232C8EBB.svg?style=flat-square&logo=yarn&logoColor=white)


## 메가스터디 IT 아카데미 프론트엔드 수업용 테스트 백엔드 서버

본 프로그램은 메가스터디IT아카데미 프론트엔드 수업에서의 활용을 목적으로 개발되었습니다.

JSON-Server의 응답 결과를 SpringBoot RestAPI 형식으로 맞춰주는 Route 기능을 수행합니다.

수업 외 사용 및 무단 배포를 금합니다.

## 설치 방법

터미널을 소스파일이 있는 폴더로 이동하고 아래 명령으로 의존성 패키지를 설치합니다.

```shell
$ yarn install
```

혹은

```shell
$ npm install
```

## 실행 방법

터미널을 소스파일이 있는 폴더로 이동하고 아래 명령어를 실행합니다.

```shell
$ yarn start
```

혹은

```shell
$ node app.js
```

## 운영 방법

### 데이터 관리

프로그램 폴더의 `data.json` 파일이 DB로 사용됩니다.

CRUD 요청에 따라 실제 데이터 파일이 수정됩니다.

맨 처음 상태로 되돌리고자 할 경우 `data.json` 파일을 삭제하고 `data(원본).json` 파일을 `data.json` 이름으로 복사합니다.

### API외의 URL 접근

`static` 폴더의 파일을 URL로 접근 가능합니다.

백엔드 시스템의 URL은 `.env`파일에 설정된 `NODE_ENV`값을 기준으로 합니다.

### Frontend CORS 설정

`.env` 파일에 설정된 `REACT_FRONTEND_URL`로 부터의 요청은 CORS를 허가합니다.