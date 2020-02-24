import fs from 'fs';
import path from 'path';

/* INFO: 로그 문자열이 유효한지 검사 */
function checkInnoLogValid(data: string) {
    const logNames = ['InnoLogInfo', 'InnoLogWarn', 'InnoLogError', 'InnoLogDebug'];
    let pos = 0;
    let endPos = 0;
    let originalLog: string;
    for(let logName of logNames){
        pos = data.indexOf(logName, pos);
        /* INFO: 더 이상 없으면 continue */
        if(pos === -1) continue;

        /* INFO: 주석이면 continue */
        if(pos >= 2 && (data.substr(pos - 2, 2) === '//')) continue;

        endPos = data.indexOf(');', pos);
        if(endPos === -1){
            throw new Error('endPos (\");\") not exist');
        }
        endPos += 2;

        let startStrPos = pos + logName.length;

        /* INFO: 포맷 형식이 아니라 그냥 문자열 출력인 경우 continue */
        if(data[startStrPos+1] !== '\"') continue;

        let target = data.substr(startStrPos, endPos - startStrPos);
        originalLog = target;

        let numParam = 0;
        let paramPos = 0;
        /* INFO: %% 문자열을 제거한다 */
        target = target.split('%%').join('');

        while(true){
            paramPos = target.indexOf('%', paramPos + 1);
            if(paramPos === -1) break;

            numParam++;
        }

        /* INFO: \"을 제거해야 한다 */
        target = target.split('\\\"').join('');

        let numRealParam = 0;
        paramPos = target.indexOf('\"');
        if(paramPos === -1){
            throw new Error(`string not exist; ${target}`);
        }
        paramPos = target.indexOf('\"', paramPos + 1);

        //console.log(`param  start: ${target.substr(paramPos, target.length - paramPos)}`);

        //INFO: 소괄호 안의 쉼표는 계산하면 안된다
        let paramStr = target.substr(paramPos + 1, target.length - (paramPos + 1));
        let smallEmbCnt = 0;
        let midEmbCnt = 0;
        let bigEmbCnt = 0;
        for(let i=0;i<paramStr.length;i++){
            if(paramStr[i] === '('){
                smallEmbCnt++;
                continue;
            }
            else if(paramStr[i] === ')') {
                smallEmbCnt--;
                continue;
            }

            if(paramStr[i] === '{'){
                midEmbCnt++;
                continue;
            }
            else if(paramStr[i] === '}') {
                midEmbCnt--;
                continue;
            }

            if(paramStr[i] === '['){
                bigEmbCnt++;
                continue;
            }
            else if(paramStr[i] === ']') {
                bigEmbCnt--;
                continue;
            }

            if(paramStr[i] === ','){
                /* INFO: 괄호 안의 쉼표는 무시한다 */
                if(smallEmbCnt !== 0) continue;
                if(midEmbCnt !== 0) continue;
                if(bigEmbCnt !== 0) continue;

                numRealParam++;
            }
        }
    
        if(numParam !== numRealParam){
            throw new Error(logName + originalLog);
        }
    }
}

/* INFO: 특정 디렉토리에 존재하는 파일들 중 cpp, h 파일을 검사한다 */
function checkFileInDirectory(directory: string){
    //console.log(`checkFileInDirectory START; directory: ${directory}`);
    /* STEP 1: 파일 목록을 조회한다 */
    let files = fs.readdirSync(directory);
    /* INFO: 파일이 하나도 없으면 return */
    if(files.length === 0){
        console.log(`No file exist ${directory}`);
        return;
    }
    
    for(let filename of files){
        /* INFO: 로그 시스템 파일은 continue */
        if(filename === 'log_system.h'){
            continue;
        }
        /* INFO: 전체파일 경로 */
        let filepath = path.join(directory, filename);
        /* INFO: 현재 목록이 파일인지 검사 */
        let isFile = fs.lstatSync(filepath).isFile();
        /* INFO: 현재 목록이 디렉토리인지 검사 */
        let isDirectory = fs.lstatSync(filepath).isDirectory();
        if(isFile){
            console.log(`${filename}`);
            /* INFO: 검사할 파일이 아니면 continue */
            if(filename.indexOf('.cpp') === -1 && filename.indexOf('.h') === -1 && filename.indexOf('.cc') === -1) continue;
            
            let filedata = fs.readFileSync(filepath).toString('utf8');
            checkInnoLogValid(filedata);
            /* INFO: 검사 통과 */
            console.log(`- OK`);
        }
        else if(isDirectory){
            let nextPath = path.join(directory, filename);
            console.log(`next path: ${nextPath}`);
            /* INFO: 자식 디렉토리에 대해 재귀적으로 검사한다 */
            checkFileInDirectory(nextPath);
        }
    }
}

function main(){
    try{
        checkFileInDirectory(process.cwd());
    }
    catch(ex){
        console.error(ex.message);
        return;
    }
    /* INFO: 최종검사 완료 */
    console.log('All files OK');
}
main();