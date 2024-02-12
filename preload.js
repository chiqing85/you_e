const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    closeApp:( title )=> {
        ipcRenderer.send( title)
    },
    minApp:( e) => {
        ipcRenderer.send( e)
    },
    maxApp:( e) => ipcRenderer.send( e) ,
    newApp: e => ipcRenderer.send( e),
    openHist: e => {
        ipcRenderer.send( e)
    },
    CloseHist: e => {
        ipcRenderer.send( e)
    },
    childApp: (e, v) => {
        ipcRenderer.send( e, v)
    },
    IsOpenApp: e => {
        ipcRenderer.send( e)
    },
    closeChild: e => {
        ipcRenderer.send( e)
    },
    screenApp: e => {
        ipcRenderer.send( e )
    },
    // screen
    onscreen:( callback) => ipcRenderer.on( "screen", callback),
    onbule:( callback) => ipcRenderer.on("win_blur", callback),
    imgview:(callback) => ipcRenderer.on('ImgView', (_event, v) => callback(v))
    
})