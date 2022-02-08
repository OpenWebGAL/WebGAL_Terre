const logger = require("../extend/logger");
const scriptParser = (sceneData) => {
    let txtStr = '';
    //语法生成器
    for (const sentence of sceneData) {
        switch (sentence['type']) {
            case 'dialog':
                let temp;
                let content = sentence['content'];
                if (sentence['vocal'] !== '') {
                    content = `vocal-${sentence['vocal']},` + content;
                }
                if (sentence['ignoreSpeaker']) {
                    temp = `:${content};\n`;
                } else if (sentence['speaker'] === '') {
                    temp = `${content};\n`;
                } else {
                    temp = `${sentence['speaker']}:${content};\n`;
                }
                txtStr = txtStr + temp;
                break;
            case 'bg':
                let tempBg;
                if (sentence['next']) {
                    tempBg = 'changeBG_next:'
                } else {
                    tempBg = 'changeBG:'
                }
                if (sentence['noBg']) {
                    tempBg = tempBg + 'none\n';
                } else {
                    tempBg = tempBg + sentence['bg'] + '\n';
                }
                txtStr = txtStr + tempBg;
                break;
            case 'bgm':
                let tempBgm;
                if (sentence['noBgm']) {
                    tempBgm = `bgm:none;\n`;
                } else {
                    tempBgm = `bgm:${sentence['bgm']};\n`;
                }
                txtStr = txtStr + tempBgm;
                break;
            case 'changeScene':
                txtStr = txtStr + `changeScene:${sentence['newScene']};\n`;
                break;
            case 'video':
                txtStr = txtStr + `playVideo:${sentence['video']};\n`;
                break;
            case 'changeP':
                let tempP;
                tempP = 'changeP';
                if (sentence['pos'] !== '') {
                    tempP = tempP + `_${sentence['pos']}`;
                }
                if (sentence['next']) {
                    tempP = tempP + `_next`;
                }
                tempP = tempP + ':'
                if (sentence['noP']) {
                    tempP = tempP + 'none';
                } else {
                    tempP = tempP + sentence['newP'];
                }
                tempP = tempP + `;\n`;
                txtStr = txtStr + tempP;
                break;
            case 'choose': {
                let tempChoose = 'choose:{'
                for (let i = 0; i < sentence['chooseItem'].length; i++) {
                    if (i !== 0) {
                        tempChoose = tempChoose + ',';
                    }
                    tempChoose = tempChoose + `${sentence['chooseItem'][i].text}:${sentence['chooseItem'][i].scene}`;
                }
                tempChoose = tempChoose + '};\n'
                txtStr = txtStr + tempChoose;
                break;
            }
        }
    }
    return txtStr;
}

module.exports = scriptParser;