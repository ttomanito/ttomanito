# **프로젝트 빌드 및 배포 매뉴얼 (v1.0)**

이 문서는 **`ttomanito`** 프로젝트의 소스 코드를 클론한 후, Docker Compose를 사용하여 전체 서비스를 빌드하고 배포하는 과정을 안내합니다.

## **1. 기술 스택 및 개발 환경 정보**

본 프로젝트는 아래와 같은 기술 스택과 버전으로 구성되어 있습니다. 원활한 빌드 및 배포를 위해 환경을 확인해주세요.

- **통합 개발 환경(IDE)**
    - **Backend**: IntelliJ IDEA Ultimate **`2025.1.3`**
    - **Frontend**: Visual Studio Code
- **런타임 및 가상화**
    - **JVM**: OpenJDK (Temurin) 17.0.16+8 (64-bit)
    - **Docker**: Docker Compose v1.29.2 이상
- **CI/CD**
    - **형상 관리**: GitLab Community Edition 18.0.2
    - **자동화 서버**: Jenkins 2.516.1

## **2. 아키텍처 및 배포 흐름**

- **배포 파이프라인**: GitLab에 소스 코드 Push → Jenkins 파이프라인 트리거 → Docker Compose를 통해 전체 서비스(Nginx, Backend, DB 등) 빌드 및 배포
- **네트워크**: 모든 컨테이너는 **`app-network`**라는 단일 브리지 네트워크를 통해 통신합니다.

## **3. 백엔드(WAS) 빌드 및 설정**

백엔드 애플리케이션은 Spring Boot로 구현되었으며, **`backend`** 서비스 컨테이너로 실행됩니다.

- **프레임워크**: Spring Boot **`3.4.5`** (Spring Framework **`6.2.8`**)
- **내장 WAS**: Apache Tomcat **`10.1.42`**
- **빌드 방법**: **`./backend`** 디렉토리의 **`Dockerfile`**을 사용하여 이미지를 빌드합니다. (세부 빌드 로직은 **`backend/Dockerfile`** 참조)
- **볼륨 마운트**: **`./secrets/prod`** 디렉토리의 인증서 파일(**`firebase-service-account.json`** 등)을 컨테이너 내부의 **`/run/secrets`** 경로로 읽기 전용으로 마운트하여 보안을 강화합니다.
- **환경 변수**: 애플리케이션 실행에 필요한 환경 변수는 **`.env`** 파일로부터 **`docker-compose`**를 통해 아래와 같이 주입됩니다.

| **환경 변수** | **설명** |
| --- | --- |
| SPRING_PROFILES_ACTIVE | **`prod`** 프로파일을 활성화합니다. |
| SPRING_PORT | 애플리케이션이 컨테이너 내부에서 사용하는 포트입니다 (기본값: **`8080`**). |
| SPRING_DATASOURCE_URL | MySQL 데이터베이스 연결 주소입니다. (JDBC URL: `jdbc:mysql://mysql:3306/${MYSQL_DATABASE}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul`) |
| SPRING_DATASOURCE_USERNAME | MySQL 사용자 이름입니다 (**`${MYSQL_USER}`**). |
| SPRING_DATASOURCE_PASSWORD | MySQL 사용자 비밀번호입니다 (**`${MYSQL_PASSWORD}`**). |
| SPRING_DATA_REDIS_HOST | Redis 서버의 호스트 이름입니다. |
| SPRING_DATA_MONGODB_URI | MongoDB 데이터베이스 연결 URI입니다 (**`mongodb://mongo:27017/${MONGO_DATABASE}`**). |
| JWT_SECRET | JWT(JSON Web Token) 서명에 사용되는 시크릿 키입니다. |
| KAKAO_CLIENT_ID | 카카오 소셜 로그인 API의 클라이언트 ID입니다. |
| GOOGLE_APPLICATION_CREDENTIALS | Firebase 서비스 계정 인증서 파일의 컨테이너 내부 경로입니다 (**`/run/secrets/firebase-service-account.json`**). |

## **4. 프론트엔드 빌드**

프론트엔드 애플리케이션은 **`nginx`** 서비스의 빌드 과정에서 생성되며, 정적 파일 형태로 Nginx를 통해 서빙됩니다.

- **프레임워크:** React.js **`v^19.1.0`**
- **개발 환경**: Node.js **`v22.15.0`** (npm **`10.9.3`**)
- **UI 라이브러리**: Chakra UI **`3.23.0`**
- **빌드 방법**: **`./frontend`** 디렉토리의 **`Dockerfile`**을 사용하여 이미지를 빌드합니다. 이때, **`docker-compose.yml`**에 정의된 **`args`**가 Vite 빌드 시 환경 변수로 전달됩니다.
- **환경 변수 (Build Args)**: 프론트엔드 빌드 시점에 주입되는 환경 변수는 다음과 같습니다.

| **빌드 변수** | **설명** |
| --- | --- |
| VITE_BASE_URL | 백엔드 API 서버의 기본 URL입니다. |
| VITE_FIREBASE_* | Firebase 연동에 필요한 모든 키와 ID 값들입니다. (API_KEY, AUTH_DOMAIN, PROJECT_ID 등) |

## **5. 인프라 및 서버 구성**

**`docker-compose.yml`**에 정의된 각 서비스의 역할과 주요 설정은 다음과 같습니다.

| **서비스 (컨테이너명)** | **이미지** | **포트 (외부:내부)** | **주요 설정 및 역할** |
| --- | --- | --- | --- |
| **Nginx** (nginx) | **`project-nginx`** | 80:80, 443:443 | - **역할**: 웹 서버 및 리버스 프록시- **설정**: **`./nginx/default.conf`** 파일을 마운트하여 커스텀 설정 적용- **`/etc/letsencrypt`** 볼륨을 마운트하여 SSL 인증서 사용 |
| **Backend** (backend-app) | **`project-backend`** | **`(expose: 8080)`** | - **역할**: Spring Boot 기반 API 서버- **`expose`** 옵션으로 내부 8080 포트를 개방하며, Nginx를 통해서만 외부와 통신 |
| **MySQL** (mysql) | **`mysql:8.0`** | 3306:3306 | - **역할**: 주 데이터베이스 (RDBMS)- **`mysql-data`** 볼륨을 통해 데이터 영속성 보장 |
| **Redis** (redis) | **`redis:latest`** | 6379:6379 | - **역할**: 인메모리 캐시 및 세션 저장소- **`appendonly`** 옵션을 활성화하여 데이터 안정성 확보 |
| **MongoDB** (mongo) | **`mongo:latest`** | 27017:27017 | - **역할**: NoSQL Document DB- **`mongo-data`** 볼륨을 통해 데이터 영속성 보장 |
| **Mongo-Express** (mongo-express) | **`mongo-express:latest`** | 8081:8081 | - **역할**: MongoDB 웹 기반 관리 도구- **`ssafy/ssafy`** 계정으로 로그인 |