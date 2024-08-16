const { app, BrowserWindow, nativeImage, ipcMain } = require('electron')
if (require('electron-squirrel-startup')) app.quit()
const path = require('path')
const nut = require('./libnut.node')
const { typeString } = nut
const { startListeningToSwiper, getMagtekSwiper, closeSwiper } = require('./magtekSwiper.js')

let mainWindow

const appIcon = nativeImage.createFromPath(
    path.join(__dirname, 'img', 'favicon-32.png')
)
function createWindow() {
    try {
        console.log('creating main window')
        mainWindow = new BrowserWindow({
            width: 400,
            height: 500,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
            title: 'Onecard Swiper',
        })
        mainWindow.setIcon(appIcon)
        mainWindow.loadFile('index.html')
        mainWindow.on('closed', function () {
            console.log('main window closed')
            mainWindow = null
            app.quit() // Ensure the application exits when the window is closed
        })

        // Once the window is fully loaded, start the HID detection process
        mainWindow.webContents.on('did-finish-load', () => {
            console.log('Window fully loaded, starting HID detection...')
            initializeSwiper()
        })
    } catch (error) {
        console.log('Error creating main window:', error.message)
        app.quit()
    }
}
async function initializeSwiper() {
    console.log('Looking for Mag-Tek Swiper or other HID devices...')
    let HIDPath = await getMagtekSwiper()

    if (Array.isArray(HIDPath)) {
        console.log(
            'Multiple HID devices detected, sending select-hid event to renderer.'
        )
        mainWindow.webContents.send('select-hid', HIDPath)

        ipcMain.once('hid-selection', async (event, selectedPath) => {
            console.log('HID device selected:', selectedPath)
            HIDPath = selectedPath
            try {
                await startListeningToSwiper(HIDPath, onSwipe)
            } catch (error) {
                console.error(
                    'Error starting swiper after selection:',
                    error.message
                )
            }
        })
    } else {
        try {
            console.log('MagTek Swiper detected, starting swiper...')
            await startListeningToSwiper(HIDPath, onSwipe)
        } catch (error) {
            console.error('Error starting swiper:', error.message)
        }
    }
}
const onSwipe = async (error, onecardData) => {
    if (error) {
        console.error('Error during swipe:', error.message)
        mainWindow.webContents.send('error', `Swipe error: ${error.message}`)
        return
    }

    try {
        typeString(onecardData.onecard)
        mainWindow.webContents.send('swipe-data', onecardData)
    } catch (sendError) {
        console.error('Error handling entry:', sendError.message)
        mainWindow.webContents.send(
            'error',
            `Entry error: ${sendError.message}`
        )
    }
}
// Listen for before-quit to close the HID device
app.on('before-quit', () => {
    console.log('Application is quitting, closing HID device...')
    closeSwiper()
})

app.on('ready', createWindow)

app.on('will-quit', function () {
    console.log('all windows closed')
    if (process.platform !== 'darwin') {
        console.log('Process exit code 0, should close now')
        app.quit()
    }
})
app.on('quit', async () => {
    app.exit()
    process.exit()
})
app.on('activate', function () {
    console.log('app is activated')
    if (mainWindow === null) {
        createWindow()
    }
})
