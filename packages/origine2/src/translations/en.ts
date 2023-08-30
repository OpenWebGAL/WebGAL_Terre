export const en = {
  common: {
    delete: 'Delete',
    exit: 'Exit',
    create: 'Create',
    revise: 'Modify',
    cancel: 'Cancel'
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
    dialogs: {
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
          source:"Source code",
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
      }
    },

    sideBar: {
      preview: {
        title: 'Game preview',
        refresh: 'Refresh',
        previewInNewTab: 'Preview in new tab',
        livePreview:'Live preview',
        notice:'Live preview fast-forwards the game to the edited statement, but with limitations. The effects of statements from previous scenes, such as variables, won\'t be reflected in the preview.'
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
          packageName: 'Game package name',
          bg: 'Background image of title',
          bgm: 'BGM of title',
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
              options:{
                default:'Default',
                small:'Small',
                medium:'Medium',
                large:'Large',
              }
            },
            position: {
              title: "Position of associated figure",
              options: {
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
            },
            tips: {
              setEffect: "Tip: Effects only take effect when you switch to a different background or close the previous background and re-add it. If you want to set an effect for an existing background, use a separate Set Effect command",
            },
            duration: {
              title: "Duration",
              placeholder: "Duration (Milliseconds)"
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
            }
          }
        },
        changeScene: {
          title: "Change scene",
          initText: "changeScene: Choose a file of scene;",
          descText: 'Turn to new scene, and clear this scene',
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
              title: "Duration",
              placeholder: "Duration (Milliseconds)"
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
              title:'Other option'
            },
            colorPicker: {
              backgroundColor:'Background color',
              fontColor:'Font color',
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
            title: "Position",
            x: " X：",
            y: " Y：",
          },
          scale: {
            title: "Scale",
            x: " x：",
            y: " y：",
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
      cancel: "Cancel choose",
      choose: "Choose file",
      fileSearch: 'Search file'
    }
  }
};