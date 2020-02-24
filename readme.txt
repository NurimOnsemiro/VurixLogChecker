[소개]
뷰릭스 프로젝트의 루트 디렉토리에 log_checker.exe를 복사한 후에 명령 프롬프트 또는 파워쉘로 해당 디렉토리로 이동한 후 log_checher.exe를 실행하면 자동으로 소스코드를 검사합니다.

[검사대상]
* InnoLogInfo, InnoLogWarn, InnoLogDebug, InnoLogError로 시작하는 코드를 우선적으로 찾습니다.
* 포맷에 지정된 파라미터 개수 (%d, %s 등)와 실제 입력한 파라미터 개수가 동일한지 검사합니다.

[개발환경구성 방법]
터미널에 <npm install>을 입력하여 필요한 모듈을 다운로드 받습니다.

[빌드방법]
터미널에 <npm run pkg-win-x64>을 입력하면 build 폴더에 log_checker.exe 파일이 생성됩니다.

[실행방법]
log_checker.exe 파일을 뷰릭스 서버 프로젝트의 루트 폴더에 복사한 후 터미널에서 실행하면 모든 파일들에 대해 검사를 수행합니다.