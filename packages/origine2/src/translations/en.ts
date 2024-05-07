export const en = {
  common: {
    delete: 'Delete',
    exit: 'Exit',
    create: 'Create',
    revise: 'Modify',
    cancel: 'Cancel',
    rename: 'Rename',
  },
  dashBoard: {
    createNewGame: {
      button: 'New game',
      dialog: {
        title: 'Create new game',
        text: 'Name of new game',
        defaultName: 'New game',
      }
    },
    preview: {
      noneChecked: 'No game selected',
      editGame: 'Edit game'
    },
    titles: {
      gameList: 'Game list',
    },
    msgs: {
      created: 'Created'
    },
    menu: {
      openInFileExplorer: 'Open in File Explorer',
      previewInNewTab: 'Preview in new tab',
      renameDir: 'Rename dir',
      deleteGame: 'Delete game',
    },
    dialogs: {
      renameDir: {
        title: 'Rename dir'
      },
      deleteGame: {
        title: "Delete game",
        subtext: `Are you sure you want to delete "{{gameName}}"?`
      },
    }
  },
  editor: {
    topBar: {
      editing: 'Editing:',
      editMode: {
        title: 'Script editing mode',
        onText: 'On, use script editing',
        offText: 'Off, use graphical editing'
      },
      commandBar: {
        items: {
          source: "Source code",
          language: {
            text: 'Language'
          },
          help: {
            text: 'Guide'
          },
          release: {
            text: "Export game",
            items: {
              web: "Export as Web",
              exe: "Export as Windows App",
              android: "Export as Android App"
            }
          }
        }
      },
      about: {
        about: 'About',
        checkedForNewVersion: 'Checked for new version',
        slogan: 'Galgame Editing. Redefined',
        currentVersion: 'Current Version',
        latestVersion: 'Latest Version',
        homePage: 'Project HomePage',
        document: 'Document',
        downloadLatest: 'Download Latest Version',
      },
    },
    sideBar: {
      preview: {
        title: 'Game preview',
        refresh: 'Refresh',
        previewInNewTab: 'Preview in new tab',
        livePreview: 'Live preview',
        notice: 'Live preview fast-forwards the game to the edited statement, but with limitations. The effects of statements from previous scenes, such as variables, won\'t be reflected in the preview.'
      },

      file: {
        dialogs: {
          editName: {
            title: 'Edit file name',
            text: 'New file name',
          },
          delete: {
            text: 'Are you sure you want to delete "{{name}}" ?'
          }
        }
      },
      assets: {
        title: 'Assets management',
        supportFileTypes: 'File types supported by this folder',
        buttons: {
          createNewFolder: 'New folder',
          openFolder: 'Open assets folder by game',
          rename: 'Rename',
          deleteSure: 'Sure to delete',
          upload: 'Upload',
          uploadAsset: 'Upload asset'
        },
        folders: {
          animation: 'Animation',
          background: 'Background',
          bgm: 'BGM',
          figure: 'Figure',
          scene: 'Scene',
          tex: 'Tex',
          video: 'Video',
          vocal: 'Vocal'
        }
      },
      gameConfigs: {
        title: 'Game configs',
        options: {
          name: 'Game name',
          id: 'Game ID',
          description: 'Game description',
          packageName: 'Game package name',
          textboxTheme: 'Textbox theme',
          bg: 'Background image of title',
          bgm: 'BGM of title',
          logoImage: 'Logo',
        }
      },
      scenes: {
        title: 'Scene management',
        dialogs: {
          create: {
            button: 'New scene',
            title: 'Create new scene',
            text: 'Name of new scene',
          }
        }
      }
    },
    mainArea: {
      noFileOpened: 'No file opened, now',
      canNotPreview: 'Can\'t preview this file'
    },
    graphical: {
      buttons: {
        delete: 'Delete',
        addForward: 'Add sentence forward this',
        add: 'Add sentence'
      },
      sentences: {
        say: {
          title: 'General dialogue',
          initText: "Role name, leave a void to extends last dialogue: Dialogue;",
          descText: 'Add a dialogue, can be accompanied by voice',
          options: {
            speaker: {
              placeholder: {
                voiceover: "Voiceover mode, no role name",
                role: "Role name, leave a void to extends last dialogue"
              }
            },
            tips: {
              edit: "Tip:Line breaks can be up to three lines",
            },
            dialogue: {
              placeholder: "Dialogue"
            },
            add: {
              button: 'Add Line'
            },
            voiceover: {
              title: "Voiceover mode",
              on: "Hide the role name",
              off: "Show the role name"
            },
            vocal: {
              title: "Vocal"
            },
            volume: {
              title: 'Vocal volume',
              placeholder: 'Percentage. 0-100 valid',
            },
            font: {
              size: "FontSize",
              options: {
                default: 'Default',
                small: 'Small',
                medium: 'Medium',
                large: 'Large',
              }
            },
            position: {
              title: "Position of associated figure",
              options: {
                none: 'None',
                left: 'Left',
                center: 'Center',
                right: 'Right',
                id: 'Figure ID'
              }
            },
            id: {
              title: "Associated figure ID",
              placeholder: "Figure ID"
            }
          }
        },
        common: {
          options: {
            goNext: {
              title: "Go next",
              on: "Play next sentence after this",
              off: "Wait after this"
            }
          }
        },
        bgm: {
          title: "BGM",
          initText: "bgm: Choose a BGM;",
          descText: 'Play, toggle or stop the BGM',
          options: {
            stop: {
              title: "Stop the BGM",
              on: "Stop the BGM",
              off: 'Play the BGM',
              choose: 'Choose the BGM'
            },
            file: {
              title: 'File of the BGM',
            },
            volume: {
              title: 'BGM volume',
              placeholder: 'Percentage. 0-100 valid',
            },
            enter: {
              title: 'Fade in and out',
              placeholder: 'Milliseconds. 0~ valid',
            },
            name: {
              title: "Name of BGM unlocking",
              placeholder: "Name of BGM unlocking"
            }
          }
        },
        changeBg: {
          title: "Change background",
          initText: 'changeBg: Choose a background;',
          descText: 'Change background image',
          options: {
            hide: {
              title: "Hide the background",
              on: "Hide the background",
              off: "Show the background",
              choose: "Choose a background image",
            },
            file: {
              title: 'File of background'
            },
            name: {
              title: "Name of CG unlocking",
              placeholder: "Name of CG unlocking"
            },
            displayEffect: {
              title: "Effect",
              on: "On",
              off: "Off"
            }
          }
        },
        changeCallScene: {
          title: "Call scene",
          initText: "callScene: Choose a scene;",
          descText: 'Call a scene, back to parent scene when it end',
          options: {
            file: {
              title: "File of scene",
            },
            call: {
              title: 'Call/Change scene',
              on: "Call scene, back to parent scene when it end",
              off: "Change scene, new scene will replace old scene"
            }
          }
        },
        changeFigure: {
          title: 'Change figure',
          initText: "changeFigure: Choose a file of figure;",
          descText: 'Add or change the figure which is at somewhere',
          options: {
            hide: {
              title: "Hide the figure",
              on: "Hide the figure",
              off: 'Show the figure',
              choose: 'Choose the file of figure'
            },
            file: {
              title: 'File of figure',
            },
            position: {
              title: "Position of figure",
              options: {
                left: 'Left',
                center: 'Center',
                right: 'Right'
              }
            },
            id: {
              title: "Figure ID (optional)",
              placeholder: "Figure ID"
            },
            displayEffect: {
              title: "Effect",
              on: "On",
              off: "Off"
            },
            tips: {
              setEffect: "Tip: Effects only take effect when you switch to a different figure or close the previous figure and re-add it. If you want to set an effect for an existing figure, use a separate Set Effect command",
            },
            duration: {
              title: "Duration",
              placeholder: "Duration (Milliseconds)"
            },
            animationType: {
              title: "AnimationSetting",
              flag: "AnimationFlag",
              lipSync: {
                title: "LipSync",
                mouthOpen: "mouthOpen",
                mouthHalfOpen: "mouthHalfOpen",
                mouthClose: "mouthClose",
              },
              blink: {
                title: "Blink",
                eyesOpen: "eyesOpen",
                eyesClose: "eyesClose",
              },
            }
          }
        },
        changeScene: {
          title: "Change scene",
          initText: "changeScene: Choose a file of scene;",
          descText: 'Turn to new scene, and clear this scene',
        },
        getUserInput: {
          title: "Get Input",
          initText: "getUserInput:;",
          titleOption: "Dialog Title",
          varOption: "Write Variable",
          buttonText: "Confirm Button Text",
          descText: 'Get Character Input from User',
        },
        setAnime: {
          title: "Set animation",
          initText: "setAnimation: Choose a file of animation;",
          descText: 'Set the animation effect for the figure or background',
          options: {
            tips: {
              set: "Tip: Set the figure/background first, then set the animation for it, otherwise can\'t find the target.",
              select: "Choose a animation file to apply, one of the animation files named \"animationTable\" is animation definition file, don\'t choose it"
            },
            file: {
              title: "File of animation"
            },
            preparedTarget: {
              title: "Use prepared target",
              on: "Use prepared apply target, if target set the ID, it won't apply",
              off: "Input ID",
              choose: {
                title: "Choose prepared target",
                options: {
                  figLeft: "Figure at left",
                  figCenter: "Figure at center",
                  figRight: "Figure at right",
                  bgMain: "Background image"
                }
              }
            },
            targetId: {
              title: "Input the target ID",
              placeholder: "Figure ID",
            },
            duration: {
              title: "Duration (Milliseconds)",
            }
          }
        },
        video: {
          title: "Play video",
          initText: "playVideo: Choose a video file;",
          descText: 'Play video',
          options: {
            file: {
              title: "Video file"
            },
            video: {
              option: "Video Option",
              skipOff: "Disable skipping of videos",
              skipOn: "Enable video skipping"
            }
          }
        },
        specialEffect: {
          title: "Apply special effect",
          initText: "pixiPerform:snow;",
          descText: 'Apply the special effect for stage',
          options: {
            clear: {
              title: "Clear special effect",
              on: "Clear special effect",
              off: "Apply special effect"
            },
            usePrepared: {
              title: "Use prepared special effects",
              on: "Use the special effects prepared in engine",
              off: "Use the special effects defined by user",
              effects: {
                snow: "Snow",
                rain: "Rain",
                cherryBlossoms: "CherryBlossoms"
              }
            },
            useUser: {
              title: "Name of user defined special effect",
            },

          }
        },
        clearSpecialEffect: {
          title: "Clear special effect",
          initText: "pixiInit;",
          descText: 'Clear the special effects of stage',
        },
        intro: {
          title: "Full-screen text",
          initText: "intro:;",
          descText: 'Show some texts on Full-screen',
          options: {
            value: {
              placeholder: "Intro texts",
            },
            add: {
              button: 'Add line'
            },
            option: {
              title: 'Other option'
            },
            colorPicker: {
              backgroundColor: 'Background color',
              fontColor: 'Font color',
              submit: 'Apply color changes'
            },
            font: {
              size: 'Font size',
              animation: 'Animation',
              delayTime: 'Delay time(sec)'
            }
          }
        },
        miniAvatar: {
          title: "Avatar at the corner",
          initText: "miniAvatar: Choose a file of avatar;",
          descText: 'Show a avatar at the left bottom corner',
          options: {
            close: {
              title: "Hide avatar",
              on: "Hide the avatar",
              off: "Show the avatar",
              choose: 'Choose a avatar'
            },
            file: {
              title: "File of Avatar",
            }
          }
        },
        setTextBox: {
          title: "Text box",
          initText: "setTextbox:hide;",
          descText: 'Control the text box\'s display',
          options: {
            hide: {
              title: "Hide text box",
              on: "Hide text box",
              off: "Show text box"
            }
          }
        },
        choose: {
          title: "Choose branch",
          initText: "choose: Choose a scene file;",
          descText: 'Turn to different scene by different option',
          delete: 'Delete',
          option: {
            name: 'Name of option',
            option: 'Option',
            chooseFile: 'Choose scene'
          },
          add: 'Add',
        },
        soundEffect: {
          title: "Sound effect",
          initText: "playEffect: Choose a sound effect file;",
          descText: 'Play a sound effect',
          options: {
            stop: {
              title: "Stop sound effect",
              on: "Stop the sound effect",
              off: "Play the sound effect",
              choose: "Choose a sound effect file"
            },
            file: {
              title: 'Sound effect file',
            },
            id: {
              title: "Effect ID (Input ID makes this effect loop, you can\'t stop it by this ID after)",
              placeholder: "Effect ID"
            },
            volume: {
              title: 'Sound effect volume',
              placeholder: 'Percentage. 0-100 valid',
            }
          }
        },
        unlockCg: {
          title: "Extra CG",
          initText: "unlockCg:;",
          descText: 'Add a picture to CG extra guide',
          options: {
            tips: {
              afterEdit: "Tip: If there are CG/BGM ineffective after edited, clear them in \"Clear All Data\" in options of WebGAL Game"
            },
            type: {
              title: "Unlock CG type",
              options: {
                cg: "CG",
                bgm: "BGM"
              }
            },
            file: {
              title: "CG file"
            },
            name: {
              title: "Name of CG unlocking",
              placeholder: "Name of CG/BGM unlocking"
            }
          }
        },
        unlockBgm: {
          title: "Extra BGM",
          initText: "unlockBgm:;",
          descText: 'Add a BGM to extra guide',
        },
        comment: {
          title: "Line comment",
          initText: ";Comment",
          descText: 'Add a line comment',
          options: {
            value: {
              title: "Comment",
              tip: 'Comments only show when editing, it will hide when game play',
            }
          }
        },
        transition: {
          title: "Set transition",
          initText: "setTransition:;",
          descText: 'Set transition effects',
          options: {
            enterfile: {
              title: "Select animation for entering",
            },
            exitfile: {
              title: "Select animation for exiting",
            },
            preparedTarget: {
              title: "Use prepared target",
              on: "Use prepared apply target, if target set the ID, it won't apply",
              off: "Input ID",
              choose: {
                title: "Choose prepared target",
                options: {
                  figLeft: "Figure at left",
                  figCenter: "Figure at center",
                  figRight: "Figure at right",
                  bgMain: "Background image"
                }
              }
            },
            targetId: {
              title: "Input the target ID",
              placeholder: "Figure ID",
            }
          }
        },
        transform: {
          title: "Set effect",
          initText: "setTransform: -duration=0;",
          descText: 'Set effect for figure or background',
          transform: {
            title: "Transform",
            x: " X：",
            y: " Y：",
          },
          scale: {
            title: "Scale",
            x: " Scale x：",
            y: " Scale y：",
          },
          effect: {
            title: "Effect",
            alpha: "Alpha (0-1)：",
            rotation: "Rotation：",
            blur: "Blur：",
          },
          filter: {
            title: "Filter",
            oldFilm: "Old film",
            dotFilm: "Dot film",
            reflectionFilm: "Reflection film",
            glitchFilm: "Glitch film",
            rgbFilm: "RGB film",
            godrayFilm: "Godray film",
          },
        },
        end: {
          title: "End game",
          initText: "end;",
          descText: 'End game and turn to title guide',
          tip: 'This command will end game',
        },
        unknown: {
          title: "Unrecognized",
          options: {
            tip: {
              title: "The command which is unrecognized",
              text: 'This command is unrecognized, please edit it in script editing mode'
            }
          }
        }
      },

      components: {
        upload: {
          text: 'Click or drag file to this area to upload'
        },
        addSentence: {
          dialogs: {
            add: {
              text: {
                forward: "Add a sentence forward the sentence which is selected",
                backward: 'Add a sentence backward the last sentence'
              }
            }
          }
        },
        template: {
          title: "Edit Component",
          text: 'Place the Component here'
        }
      },
    },

    fileChoose: {
      cancel: "Cancel",
      choose: "Choose",
      fileSearch: 'Search file'
    }
  },
  "文件": "File",
  "配置": "Configuration",
  "视图": "View",
  "设置": "Settings",
  "帮助": "Help",
  "导出": "Export",
  "侧边栏": "Sidebar",
  "侧边栏游戏预览": "Sidebar Game Preview",
  "显示侧边栏": "Show Sidebar",
  "隐藏侧边栏": "Hide Sidebar",
  "刷新游戏": "Refresh Game",
  "新标签页预览": "Preview in New Tab",
  "代码编辑器": "Code Editor",
  "永不换行": "Never Wrap",
  "自动换行": "Auto Wrap",
  "常规演出": "Regular Performance",
  "舞台对象控制": "Stage Object Control",
  "特殊演出": "Special Performance",
  "场景与分支": "Scenes and Branches",
  "鉴赏": "Appreciation",
  "游戏控制": "Game Control",
  "执行到此句": "Execute to This Statement",
  "打开效果编辑器": "Open Effect Editor",
  "效果编辑器": "Effect Editor",
  "效果选项": "Effect Options",
  "一直显示功能区": "Always Show Toolbar",
  "自动隐藏功能区": "Auto-hide Toolbar",
  "源代码": "Source Code",
  "主页": "WebGAL Home",
  "实时预览": "Live Preview",
  "实时预览关闭": "Live Preview Off",
  "实时预览打开": "Live Preview On",
  "添加语句": "Add Statement",
  "效果提示": "Tip: Effects only take effect when switching to a different background or after closing and re-adding the previous background. If you want to set effects for an existing background, please use a separate set effect command.",
  "脚本编辑器": "Script Editor",
  "图形编辑器": "Graphical Editor",
  "行脚本": "Line of Scripts, ",
  "个字": " Words",
  "默认值0":"Default Value is 0",
  "默认值1":"Default Value is 1",
  "持续时间（单位为毫秒）":"Duration (milliseconds)",
  "结束后保持":"Hold after end",
  createNewFile:'Create New File',
  createNewFolder:'Create New Folder',
  newFileName:'New File Name',
  newFolderName:'New Folder Name',
  upload:'Upload',
  uploadAsset:'Upload Asset',
  refresh:'Refresh',
  openFolder:'Open Folder',
  assets:'Assets',
  animation: 'Animation',
  background: 'Background',
  bgm: 'BGM',
  figure: 'Figure',
  scene: 'Scene',
  tex: 'Tex',
  video: 'Video',
  vocal: 'Vocal',
  gameConfig: 'Game Config',
  extensionName: 'Extension Name',
  null: 'Null',
  sureToDeleteGame: "I'm sure to delete the game",
};
