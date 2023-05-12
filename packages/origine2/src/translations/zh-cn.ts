export const zhCn = {
  common: {
    delete: '删除',
    exit: '返回',
    create: '创建',
    revise: '修改',
    cancel: '取消'
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
    },

    sideBar: {
      preview: {
        title: '游戏预览',
        refresh: '刷新',
        previewInNewTab: '在新标签页预览'
      },

      file: {
        dialogs: {
          editName: {
            title: '修改文件名',
            text: '新文件名',
          },
          delete: {
            text: '确定删除 "{{name}}" 吗？'
          }
        }
      },

      gameConfigs: {
        title: '游戏配置',
        options: {
          name: '游戏名称',
          id: '游戏识别码',
          packageName: '游戏包名',
          bg: '标题背景图片',
          bgm: '标题背景音乐',
        }
      },

      scenes: {
        title: '场景管理',
        dialogs: {
          create: {
            button: '新建场景',
            title: '创建新场景',
            text: '新场景名',
          }
        }
      }
    },

    graphical: {
      buttons: {
        delete: '删除本句',
        addBefore: '本句前插入句子',
        add: '添加语句'
      },

      sentences: {
        say: {
          title: '普通对话',
          initText: "角色名，留空以继承上句:对话;",
          descText: '添加一句对话，可以附带语音',
        },
        common: {
          options: {
            goNext: {
              title: "连续执行",
              on: "本句执行后执行下一句",
              off: "本句执行后等待"
            }
          }
        },
        bgm: {
          title: "背景音乐",
          initText: "bgm:选择背景音乐;",
          descText: '启动、切换或停止背景音乐的播放',
          options: {
            stop: {
              title: "停止 BGM",
              on: "结束当前 BGM 的播放",
              off: '正常播放 BGM',
              choose: '选择背景音乐'
            },
            file: {
              title: '背景音乐文件',
            }
          }
        },
        changeBg: {
          title: "切换背景",
          initText: 'changeBg: 选择背景图片;',
          descText: '切换背景图片',
          options: {
            hide: {
              title: "关闭背景",
              on: "关闭背景",
              off: "显示背景",
              choose: "选择背景图片",
            },
            file: {
              title: '背景文件'
            }
          }
        },
        changeCallScene: {
          title: "调用场景",
          initText: "callScene:选择场景文件;",
          descText: '调用一段场景文件，在结束后返回父场景',
          options: {
            file: {
              title: "场景文件",
            },
            call: {
              title: '调用/切换场景',
              on: "调用场景，新场景结束后返回父场景",
              off: "切换场景，新场景直接替换父场景"
            }
          }
        },
        changeFigure: {
          title: '切换立绘',
          initText: "changeFigure:选择立绘文件;",
          descText: '添加或切换指定位置的立绘',
          options: {
            close: {
              title: "关闭立绘",
              on: "关闭立绘",
              off: '显示立绘',
              choose: '选择立绘文件'
            },
            file: {
              title: '立绘文件',
            },
            position: {
              title: "立绘位置",
              options: {
                left: '左侧',
                center: '中间',
                right: '右侧'
              }
            },
            id: {
              title: "立绘ID（可选）",
              id: "立绘 ID"
            }
          }
        },
        changeScene: {
          title: "切换场景",
          initText: "changeScene:选择场景文件;",
          descText: '切换到另一个场景文件，并清除当前场景',
        },
        setAnime: {
          title: "设置动画",
          initText: "setAnimation:选择动画文件;",
          descText: '为立绘或背景图片设置动画效果',
        },
        video: {
          title: "播放视频",
          initText: "playVideo:选择视频文件;",
          descText: '播放一小段视频',
        },
        effect: {
          title: "使用特效",
          initText: "pixiPerform:snow;",
          descText: '为当前的舞台添加特殊效果',
        },
        clearEffect: {
          title: "清除特效",
          initText: "pixiInit;",
          descText: '清除当前舞台的特殊效果',
        },
        intro: {
          title: "黑屏文字",
          initText: "intro:;",
          descText: '黑屏显示一段文字，用于独白或引出场景',
          options: {
            value: {
              title: "Intro 文本",
            },
            add: {
              button: '添加新行'
            }
          }
        },
        miniAvatar: {
          title: "角落头像",
          initText: "miniAvatar:选择小头像;",
          descText: '在对话框的左下角显示一个小头像',
          options: {
            close: {
              title: "关闭小头像",
              on: "关闭小头像",
              off: "展示小头像",
              choose: '选择小头像'
            },
            file: {
              title: "小头像文件",
            }
          }
        },
        setTextBox: {
          title: "文本显示",
          initText: "setTextbox:hide;",
          descText: '控制是否要显示文本框',
        },
        choose: {
          title: "分支选择",
          initText: "choose:选项:选择场景文件;",
          descText: '通过选项进入不同的场景',
          delete: '删除本句',
          option: {
            name: '选项名称',
            option: '选项',
            chooseFile: '选择场景文件'
          },
          add: '添加语句',
        },
        soundEffect: {
          title: "效果声音",
          initText: "playEffect:选择效果音文件;",
          descText: '播放一段效果音',
        },
        unlockCg: {
          title: "鉴赏图片",
          initText: "unlockCg:;",
          descText: '添加一张图片到 CG 鉴赏界面',
        },
        unlockBgm: {
          title: "鉴赏音乐",
          initText: "unlockBgm:;",
          descText: '添加一首音乐到音乐鉴赏界面',
        },
        comment: {
          title: "单行注释",
          initText: ";注释",
          descText: '添加一行注释',
          options: {
            value: {
              title: "注释",
              tip: '注释仅在编辑时可见，游戏中不会执行',
            }
          }
        },
        end: {
          title: "结束游戏",
          initText: "end;",
          descText: '结束当前游戏并回到标题画面',
          tip: '此指令将结束游戏',
        },
        unknown: {
          title: "未识别"
        }
      },

      components: {
        addSentence: {
          dialogs: {
            add: {
              text: {
                before: "在所选句子前添加一条语句",
                after: '在场景末尾添加一条语句'
              }
            }
          }
        },
      },
    },

    fileChoose: {
      cancel: "取消选择",
      choose: "选择文件",
    }
  },
};