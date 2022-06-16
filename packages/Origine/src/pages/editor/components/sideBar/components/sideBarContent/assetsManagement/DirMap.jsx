import {Avatar, DocDetail, FileMusic, FolderClose, Pic, Video, VoiceMessage} from "@icon-park/react";

const dirMap = {
    background: '背景',
    bgm: '音乐',
    figure: '立绘',
    video: '视频',
    vocal: '语音',
}


const IconMap = (props) => {
    let icon = <FolderClose theme="outline" size="22" fill="#333"/>;
    switch (props.icon) {
        case 'background':
            icon = <Pic theme="outline" size="22" fill="#333"/>;
            break;
        case 'bgm':
            icon = <FileMusic theme="outline" size="22" fill="#333"/>;
            break;
        case 'figure':
            icon = <Avatar theme="outline" size="22" fill="#333"/>;
            break;
        case 'video':
            icon = <Video theme="outline" size="22" fill="#333"/>;
            break;
        case 'vocal':
            icon = <VoiceMessage theme="outline" size="22" fill="#333"/>;
            break;
        case 'file':
            icon = <DocDetail theme="outline" size="22" fill="#333"/>
        default:
            break;
    }
    return icon;
}

export {dirMap, IconMap}