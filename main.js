const { app, BrowserWindow, Menu, ipcMain, clipboard } = require('electron')
const { webContents, globalShortcut } = require('electron/main')
const path = require('path')
const {execFile } = require( 'child_process')

function createWindow () {
  let win = new BrowserWindow({
    width: 453,
    height: 365,
    frame:false, // 是否无边框
    transparent: true, // 透明窗口
    backgroundColor: "#00000000", // 窗口底色为透明色
    resizable: true,
    // show: false,// 显示窗口将没有视觉闪烁（配合下面的ready-to-show事件）
		center:false,	// 是否剧中居中
    webPreferences: {
      nodeIntegration: true,
      //devTools: true,//客户端可以打开开发者工具（在客户端打开快捷键：ctrl+shift+i）
      // contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  // 打开开发工具
  // win.webContents.openDevTools()
  win.loadFile('./html/login.html')
  win.setMenu( null )
  // 关闭窗口
  win.on("closed", () => {
    win = null
  })
  let win_id = win.webContents.id
  ipcMain.on("win_close", () => {
    win.close()
  })
  // 登录成功
  ipcMain.on("win_new",() => {
    // 关闭当前页页
    win.setSize( 683,508, )
    win.center( true)
    win.loadFile('./html/index.html')
  })
  // 最小化
  ipcMain.on("win_min", () => {
    win.minimize();
  })

  // 最大化
  ipcMain.on("win_max", () => {
    if( !win.isMaximized() ) {
      win.maximize ()
    } else {
      win.restore()
    }
  } )
// 退出聊天界面，到登录页
  ipcMain.on("win_login", () => {
    win.setSize( 453, 365)
    // win.setMinimumSize( 453, 365 )
    win.setResizable(true);
    win.loadFile('./html/login.html')
  })
  // 
  ipcMain.on("chat_hist", () => {
    win.setSize( 1013, 508, )
  })

  ipcMain.on("close_hist", () => {
    win.setSize( 683,508)
  })

  let child_id, imageData
  ipcMain.on("child_app", ( _events, v) => {
    if( BrowserWindow.getAllWindows().length < 2) {
      let child = null
      child = new BrowserWindow({
        width: v.ow + 13,
        height: v.oh + 13,
        show:true,
        parent: win,
        frame:false, // 是否无边框
        transparent:true,
        resizable:false,
        webPreferences: {
          preload: path.join(__dirname, 'preload.js')
        }
      })
      imageData = JSON.stringify( v )
      child.loadFile("./html/imageView.html")
      child.setMenu( null )
      child.show()
      win.show()
      // child.webContents.openDevTools()
      child_id = child.webContents.id
      child.on("closed", e => {
        child = null
      })
    }
  })
  ipcMain.on("is_open_child", () => {
    let ChildId = BrowserWindow.fromId( child_id)
    ChildId.webContents.send("ImgView",imageData )
  })
  ipcMain.on("child_close", () => {
    let ChildId = BrowserWindow.fromId( child_id)
    ChildId.close()
  })
  // 截图
  ipcMain.on("screen", () => {
    var screen_window = execFile(__dirname+ '/static/__static/PrintScr.exe')
    screen_window.on('exit', function (code) {
      // 执行成功返回 1，返回 0 没有截图
      if (code) {
        let imageObj = ""
        imageObj = clipboard.readImage()
        if(!imageObj.isEmpty()) {
            screen( imageObj )
        }
      }
    })
  })

  screen = ( imageObj ) => {
    let dataurl = imageObj.toDataURL();
    BrowserWindow.fromId( win_id).webContents.send("screen", {"dataurl": dataurl, "size": imageObj.getSize()})
  }
  app.on("browser-window-blur", () => {
    win.webContents.send("win_blur", 1)
  })
}
app.whenReady().then(() => {
  /*let win_id = BrowserWindow.getFocusedWindow()
  globalShortcut.register( 'Ctrl+E', () => {
    win_id.webContents.reload()
  })
  */
}).then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
