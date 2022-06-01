const {app, BrowserWindow, Menu, dialog, ipcMain,shell} = require('electron');
const fs = require('fs');
const path = require('path');

//JANELA PRINCIPAL
var mainWindow = null;

async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            nodeIntegrationInWorker: true
        }
    });

    // ON READY
    mainWindow.loadFile("src/pages/editor/index.html");

    //DevTOOLS
    // mainWindow.webContents.openDevTools();

    createNewFile();
// Recebe o update
    ipcMain.on('update-content', function (event, data) {
        file.content = data;
    });

}

// ARQUIVO
var file = {};

//CRIAR NOVO ARQUIVO
function createNewFile() {
    file = {
        name: 'novo-arquivo.txt',
        content: '',
        saved: false,
        path: app.getPath('documents') + '/novo-arquivo.txt'
    };
//Enviando dados para script de visao
    mainWindow.webContents.send('set-file', file);
}

//SALVAR ARQUIVO NO DISCO
function writeFile(filePath) {
    try {
        fs.writeFile(filePath, file.content, function (error) {
            //ERRRO
            if (error) throw error;

            //ARQUIVO SALVO
            file.path = filePath;
            file.saved = true;
            file.name = path.basename(filePath);
        })

    } catch (e) {
        console.log(e);
    }
}

//SALVAR COMO
async function saveFileAs() {
    //DIALOG
    let dialogFile = await dialog.showSaveDialog({
        defaultPath: file.path
    })

    //VERIFICAR CANCELAMENTO
    if (dialogFile.canceled) {
        return false;
    }

    //SALVAR ARQUIVO
    writeFile(dialogFile.filePath);
}

//SALVAR ARQUIVO
function saveFile() {
    //SAVE
    if (file.saved) {
        return writeFile(file.path);
    }

    return saveFileAs();
}

// LER ARQUIVO
function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, "utf8");
    } catch (e) {
        console.log(e);
        return '';
    }
}

//ABRIR ARQUIVO
async function openFile() {
    //DIALOGO
    let dialogFile = await dialog.showOpenDialog({
        defaultPath: file.path
    });

    //VERIFICAR CANCELAMENTO
    if (dialogFile.canceled) return false;

    //ABRIR O ARQUIVO
    file = {
        name: path.basename(dialogFile.filePaths[0]),
        content: readFile(dialogFile.filePaths[0]),
        saved: true,
        path: dialogFile.filePaths[0]


    }
    mainWindow.webContents.send('set-file', file);
}

//TEMPLATE MENU
const templateMenu = [
    {
        label: 'Arquivo',
        submenu: [
            {
                label: "Novo",
                accelerator: 'CmdOrCtrl+N',
                click() {
                    createNewFile();
                }
            },
            {
                label: "Abrir",
                accelerator: 'CmdOrCtrl+O',
                click() {
                    openFile();
                }
            },
            {
                label: 'Selecionar',
                role: 'selectAll'
            },
            {
                label: 'Salvar',
                accelerator: 'CmdOrCtrl+S',
                click() {
                    saveFile();
                }

            },
            {
                label: 'Salvar Como',
                accelerator: 'CmdOrCtrl+Shift+S',
                click() {
                    saveFileAs();
                }

            },
            {
                label: "Separador",
                type: "separator"
            },
            {
                label: 'Fechar',
                role: process.platform === 'darwin' ? 'close' : 'quit'
            }

        ]

    },
    {
        label: 'Editar',
        submenu: [
            {
                label: 'Desfazer',
                role: 'undo'
            },
            {
                label: 'Refazer',
                role: 'redo'
            },
            {
                type:'separator'
            },
            {
                label: 'Copiar',
                role: 'copy'
            },
            {
                label: 'Recortar',
                role: 'cut'
            },
            {
                label: 'Colar',
                role: 'paste'
            }

        ]
    },
    {
    label: 'Ajuda',
        submenu: [
            {
               label: "Canal ADVFW" ,
                click() {
                   shell.openExternal('https://github.com/adventureandre')
                }
            }
        ]
    }
];

//MENU
const menu = Menu.buildFromTemplate(templateMenu);
Menu.setApplicationMenu(menu)

//ON READY
app.whenReady().then(createWindow);


//ACTIVATE
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
})
