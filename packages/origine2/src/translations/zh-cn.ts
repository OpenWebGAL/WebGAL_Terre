export const zhCn = {
    common: {
        delete: '删除',
        exit: '返回',
        create: '创建'
    },

    dashBoard: {
        createNewGame: {
            button: '新建游戏',
            dialog: {
                title: '创建新游戏',
                text: '新游戏名',
                defaultName: '新的游戏',
            }
        },
        preview: {
            noneChecked: '当前没有游戏被选中',
            editGame: '编辑游戏'
        },
        titles: {
            gameList: '游戏列表',
        },
        msgs: {
            created: '已创建'
        },
        dialogs: {
            deleteGame: {
                title: "删除游戏",
                subtext: `是否要删除 "{{gameName}}" ？`
            }
        }
    },

    editor: {
        topBar: {
            editing: '正在编辑：',
            editMode: {
                title: '脚本编辑模式',
                onText: '开启，使用脚本编辑',
                offText: '关闭，使用图形编辑'
            },
            commandBar: {
                items: {
                    language: {
                        text: '语言'
                    },
                    help: {
                        text: '制作指南'
                    },
                    release: {
                        text: "导出游戏",
                        items: {
                            web: "导出为网页",
                            exe: "导出为可执行文件",
                            android: "导出为安卓工程文件"
                        }
                    }
                }
            }
        }
    }
};