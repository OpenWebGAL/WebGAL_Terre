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
      button: 'New Game',
      dialog: {
        title: 'Create New Game',
        text: 'Name of new game',
        defaultName: 'New Game',
      }
    },
    preview: {
      noneChecked: 'No Game Selected',
      editGame: 'Edit Game'
    },
    titles: {
      gameList: 'Game List',
    },
    msgs: {
      created: 'Created'
    },
    dialogs: {
      deleteGame: {
        title: "Delete Game",
        subtext: `Are you sure you want to delete "{{gameName}}"?`
      },
    }
  },

  editor: {
    topBar: {
      editing: 'Editing:',
      editMode: {
        title: 'Script Editing Mode',
        onText: 'On, use script editing',
        offText: 'Off, use graphical editing'
      },
      commandBar: {
        items: {
          source:"Source Code",
          language: {
            text: 'Language'
          },
          help: {
            text: 'Guide'
          },
          release: {
            text: "Export Game",
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
        title: 'Game Preview',
        refresh: 'Refresh',
        previewInNewTab: 'Preview in new tab',
        livePreview:'Live Preview',
        notice:'Live preview fast-forwards the game to the edited statement, but with limitations. The effects of statements from previous scenes, such as variables, won\'t be reflected in the preview.'
      },

      file: {
        dialogs: {
          editName: {
            title: 'Edit File Name',
            text: 'New file name',
          },
          delete: {
            text: 'Are you sure you want to delete "{{name}}" ?'
          }
        }
      },

      assets: {
        title: 'Assets Management',
        supportFileTypes: 'File types supported by this folder',
        buttons: {
          createNewFolder: 'New Folder',
          openFolder: 'Open Assets Folder by Game',
          rename: 'Rename',
          deleteSure: 'Sure to Delete',
          upload: 'Upload',
          uploadAsset: 'Upload Asset'
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
        title: 'Game Configs',
        options: {
          name: 'Game name',
          id: 'Game ID',
          packageName: 'Game package name',
          bg: 'Background image of title',
          bgm: 'BGM of title',
        }
      },

      scenes: {
        title: 'Scene Management',
        dialogs: {
          create: {
            button: 'New Scene',
            title: 'Create New Scene',
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
        addForward: 'Add Sentence Forward This',
        add: 'Add Sentence'
      },

      sentences: {
        say: {
          title: 'General Dialogue',
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
              title: "Voiceover Mode",
              on: "Hide the role name",
              off: "Show the role name"
            },
            vocal: {
              title: "Vocal"
            },
            font: {
              size: "FontSize"
            }
          }
        },
        common: {
          options: {
            goNext: {
              title: "Go Next",
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
              title: 'volume',
              placeholder: 'Percentage. 0-100 valid',
            },
            enter: {
              title: 'Fade in and out',
              placeholder: 'Milliseconds. 0~ valid',
            }
          }
        },
        changeBg: {
          title: "Change BackGround",
          initText: 'changeBg: Choose a BackGround;',
          descText: 'Change background image',
          options: {
            hide: {
              title: "Hide the Background",
              on: "Hide the background",
              off: "Show the background",
              choose: "Choose a background image",
            },
            file: {
              title: 'File of BackGround'
            }
          }
        },
        changeCallScene: {
          title: "Call Scene",
          initText: "callScene: Choose a scene;",
          descText: 'Call a scene, back to parent scene when it end',
          options: {
            file: {
              title: "File of Scene",
            },
            call: {
              title: 'Call/Change Scene',
              on: "Call scene, back to parent scene when it end",
              off: "Change scene, new scene will replace old scene"
            }
          }
        },
        changeFigure: {
          title: 'Change Figure',
          initText: "changeFigure: Choose a file of figure;",
          descText: 'Add or change the figure which is at somewhere',
          options: {
            hide: {
              title: "Hide the Figure",
              on: "Hide the figure",
              off: 'Show the figure',
              choose: 'Choose the file of figure'
            },
            file: {
              title: 'File of Figure',
            },
            position: {
              title: "Position of Figure",
              options: {
                left: 'Left',
                center: 'Center',
                right: 'Right'
              }
            },
            id: {
              title: "Figure ID (optional)",
              placeholder: "Figure ID"
            }
          }
        },
        changeScene: {
          title: "Change Scene",
          initText: "changeScene: Choose a file of scene;",
          descText: 'Turn to new scene, and clear this scene',
        },
        setAnime: {
          title: "Set Animation",
          initText: "setAnimation: Choose a file of animation;",
          descText: 'Set the animation effect for the figure or background',
          options: {
            tips: {
              set: "Tip: Set the figure/background first, then set the animation for it, otherwise can\'t find the target.",
              select: "Choose a animation file to apply, one of the animation files named \"animationTable\" is animation definition file, don\'t choose it"
            },
            file: {
              title: "File of Animation"
            },
            preparedTarget: {
              title: "Use Prepared Target",
              on: "Use prepared apply target, if target set the ID, it won't apply",
              off: "Input ID",
              choose: {
                title: "Choose Prepared Target",
                options: {
                  figLeft: "Figure at Left",
                  figCenter: "Figure at Center",
                  figRight: "Figure at Right",
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
        video: {
          title: "Play Video",
          initText: "playVideo: Choose a video file;",
          descText: 'Play video',
          options: {
            file: {
              title: "Video File"
            }
          }
        },
        effect: {
          title: "Apply Effect",
          initText: "pixiPerform:snow;",
          descText: 'Apply the effect for stage',
          options: {
            clear: {
              title: "Clear Effect",
              on: "Clear effect",
              off: "Apply effect"
            },
            usePrepared: {
              title: "Use Prepared Effects",
              on: "Use the effects prepared in engine",
              off: "Use the effects defined by user",
              effects: {
                snow: "Snow",
                rain: "Rain",
                cherryBlossoms: "CherryBlossoms"
              }
            },
            useUser: {
              title: "Name of User Defined Effect",
            },

          }
        },
        clearEffect: {
          title: "Clear Effect",
          initText: "pixiInit;",
          descText: 'Clear the effects of stage',
        },
        intro: {
          title: "Full-screen Text",
          initText: "intro:;",
          descText: 'Show some texts on Full-screen',
          options: {
            value: {
              placeholder: "Intro Texts",
            },
            add: {
              button: 'Add Line'
            },
            option: {
              title:'other option'
            },
            colorPicker: {
              backgroundColor:'backgroundColor',
              fontColor:'fontColor',
              submit: 'Apply color changes'
            },
            font: {
              size:'fontSize'
            }
          }
        },
        miniAvatar: {
          title: "Avatar at The Corner",
          initText: "miniAvatar: Choose a file of avatar;",
          descText: 'Show a Avatar at the left bottom corner',
          options: {
            close: {
              title: "Hide Avatar",
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
          title: "Text Box",
          initText: "setTextbox:hide;",
          descText: 'Control the text box\'s display',
          options: {
            hide: {
              title: "Hide Text Box",
              on: "Hide text box",
              off: "Show text box"
            }
          }
        },
        choose: {
          title: "Choose Branch",
          initText: "choose: Choose a scene file;",
          descText: 'Turn to different scene by different option',
          delete: 'Delete',
          option: {
            name: 'Name of Option',
            option: 'Option',
            chooseFile: 'Choose Scene'
          },
          add: 'Add',
        },
        soundEffect: {
          title: "Sound Effect",
          initText: "playEffect: Choose a sound effect file;",
          descText: 'Play a sound effect',
          options: {
            stop: {
              title: "Stop Sound Effect",
              on: "Stop the sound effect",
              off: "Play the sound effect",
              choose: "Choose a sound effect file"
            },
            file: {
              title: 'Sound Effect File',
            },
            id: {
              title: "Effect ID (Input ID makes this effect loop, you can\'t stop it by this ID after)",
              placeholder: "Effect ID"
            },
            volume: {
              title: 'Sound Effect Volume',
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
              afterEdit: "tip: If there are CG/BGM ineffective after edited, clear them in \"Clear All Data\" in options of WebGAL Game"
            },
            type: {
              title: "Unlock CG Type",
              options: {
                cg: "CG",
                bgm: "BGM"
              }
            },
            file: {
              title: "CG File"
            },
            name: {
              title: "Name of CG Unlocking",
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
          title: "Line Comment",
          initText: ";Comment",
          descText: 'Add a line comment',
          options: {
            value: {
              title: "Comment",
              tip: 'Comments only show when editing, it will hide when game play',
            }
          }
        },
        end: {
          title: "End Game",
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
      cancel: "Cancel Choose",
      choose: "Choose File",
    }
  }
};
