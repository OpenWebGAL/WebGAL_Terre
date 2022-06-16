import Dialog from "../sentence/dialog";
import Bg from "../sentence/bg";
import Bgm from "../sentence/bgm";
import ChangeScene from "../sentence/changeScene";
import PlayVideo from "../sentence/playVideo";
import ChangeP from "../sentence/changeP";
import ChooseScene from "../sentence/chooseScene";
import Intro from "../sentence/intro";
import SetAnimation from "../sentence/setAnimation";

const sentenceMap = (sentence, index) => {
    let temp;
    switch (sentence.type) {
        case 'dialog':
            temp = <Dialog data={sentence} index={index} key={index}/>;
            break;
        case 'bg':
            temp = <Bg data={sentence} index={index} key={index}/>;
            break;
        case 'bgm':
            temp = <Bgm data={sentence} index={index} key={index}/>;
            break;
        case 'changeScene':
            temp = <ChangeScene data={sentence} index={index} key={index}/>;
            break;
        case 'video':
            temp = <PlayVideo data={sentence} index={index} key={index}/>;
            break;
        case 'changeP':
            temp = <ChangeP data={sentence} index={index} key={index}/>;
            break;
        case 'choose':
            temp = <ChooseScene data={sentence} index={index} key={index}/>;
            break;
        case 'intro':
            temp = <Intro data={sentence} index={index} key={index}/>;
            break;
        case 'setAnimation':
            temp = <SetAnimation data={sentence} index={index} key={index}/>;
            break;
    }
    return temp;
}

export default sentenceMap;
