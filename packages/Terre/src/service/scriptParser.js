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
                    content = content + ` -${sentence['vocal']}`;
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
                tempBg = 'changeBg:'
                if (sentence['noBg']) {
                    tempBg = tempBg + 'none';
                } else {
                    tempBg = tempBg + sentence['bg'];
                }
                if (sentence['next']) {
                    tempBg = tempBg + ' -next\n';
                } else {
                    tempBg = tempBg + '\n';
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
                tempP = 'changeFigure';
                tempP = tempP + ':'
                if (sentence['noP']) {
                    tempP = tempP + 'none';
                } else {
                    tempP = tempP + sentence['newP'];
                }
                if (sentence['pos'] !== '') {
                    tempP = tempP + ` -${sentence['pos']}`;
                }
                if (sentence['next']) {
                    tempP = tempP + ` -next`;
                }
                tempP = tempP + `;\n`;
                txtStr = txtStr + tempP;
                break;
            case 'choose': {
                let tempChoose = 'choose:'
                for (let i = 0; i < sentence['chooseItem'].length; i++) {
                    if (i !== 0) {
                        tempChoose = tempChoose + '|';
                    }
                    tempChoose = tempChoose + `${sentence['chooseItem'][i].text}:${sentence['chooseItem'][i].scene}`;
                }
                tempChoose = tempChoose + ';\n'
                txtStr = txtStr + tempChoose;
                break;
            }
            case 'intro':
                let tempIntro = 'intro:';
                sentence['content'].forEach((e, i) => {
                    if (i !== 0) {
                        tempIntro = tempIntro + '|';
                    }
                    tempIntro = tempIntro + e;
                })
                tempIntro = tempIntro + ';\n'
                txtStr = txtStr + tempIntro;
                break;
            case 'setAnimation':
                let tempSetAnimation = '';
                let tempArg = ' -';
                if(sentence['target'] === 'bg'){
                    tempSetAnimation = 'setBgAni:';
                    tempArg = '';
                }
                if(sentence['target'] === 'left'){
                    tempSetAnimation = 'setFigAni:';
                    tempArg = tempArg+ 'left';
                }
                if(sentence['target'] === 'right'){
                    tempSetAnimation = 'setFigAni:';
                    tempArg = tempArg+ 'right';
                }
                if(sentence['target'] === 'center'){
                    tempSetAnimation = 'setFigAni:';
                    tempArg = tempArg+ 'center';
                }
                tempSetAnimation = tempSetAnimation + sentence['animationName'] +' '+sentence['duration']+'s' + tempArg + ';\n';
                txtStr = txtStr + tempSetAnimation;
        }
    }
    return txtStr;
}

module.exports = scriptParser;
