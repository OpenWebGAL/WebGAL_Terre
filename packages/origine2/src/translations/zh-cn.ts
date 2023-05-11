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
          title: '',
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
          title: '',
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
          title: '',
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
          title: '',
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

        choose: {
          delete: '删除本句',
          option: {
            name: '选项名称',
            option: '选项',
            chooseFile: '选择场景文件'
          },
          add: '添加语句',
        }
      },
    },

    fileChoose: {
      cancel: "取消选择",
      choose: "选择文件",
    }
  },
};