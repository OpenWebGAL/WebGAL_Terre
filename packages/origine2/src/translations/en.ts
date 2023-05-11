export const en = {
    common: {
        delete: 'Delete',
        exit: 'Exit',
        create: 'Create'
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
        }
    }
};