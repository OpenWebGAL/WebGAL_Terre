const createSentence = (sentenceType) => {
    let sentence;
    switch (sentenceType) {
        case 'dialog':
            sentence = {
                type: sentenceType,
                speaker: '',
                content: '',
                vocal: '',
                ignoreSpeaker: false
            }
            break;
        case 'bg':
            sentence = {
                type: sentenceType,
                bg: '',
                noBg: false,
                next: false
            }
            break;
        case 'bgm':
            sentence = {
                type: sentenceType,
                bgm: '',
                noBgm: false
            }
            break;
        case 'changeScene':
            sentence = {
                type: sentenceType,
                newScene: '',
            }
            break;
        case 'video':
            sentence = {
                type: sentenceType,
                video: '',
            }
            break;
        case 'changeP':
            sentence = {
                type: sentenceType,
                newP: '',
                next: false,
                noP: false,
                pos: '',
            }
            break;
        case 'choose':
            sentence = {
                type: sentenceType,
                chooseItem: [
                    {
                        text: '在此填入分支的名称',
                        scene: '',
                    },
                    {
                        text: '在此填入分支的名称',
                        scene: '',
                    }
                ]
            }
            break;
        case 'intro':
            sentence = {
                type: sentenceType,
                content: []
            }
            break;
        case'setAnimation':
            sentence = {
                type:sentenceType,
                target:'',
                animationName:'',
                duration:1,
            }
    }

    return sentence;
}
export default createSentence;
