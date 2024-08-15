const { app, BrowserWindow, nativeImage, ipcMain } = require("electron");
if (require('electron-squirrel-startup')) app.quit();
const path = require("path");
const HID = require("node-hid");
const nut = require("./libnut.node");
const { typeString } = nut;

let mainWindow;

const appIcon = nativeImage.createFromPath(
  path.join(__dirname, "img", "favicon-32.png")
);

function createWindow() {
  try {
    console.log("creating main window");
    mainWindow = new BrowserWindow({
      width: 400,
      height: 500,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      title: "Onecard Swiper",
      alwaysOnTop: true, // Make the window always on top
    });
    mainWindow.setIcon(appIcon);
    mainWindow.loadFile("index.html");
    mainWindow.on("closed", function () {
      console.log("main window closed");
      mainWindow = null;
      app.quit(); // Ensure the application exits when the window is closed
    });
  } catch (error) {
    console.log('Error creating main window:', error.message);
    app.quit();
  }
}

app.on("ready", createWindow);
app.on("will-quit", function () {
  console.log("all windows closed");
  if (process.platform !== "darwin") {
    console.log('Process exit code 0, should close now');
    app.quit();
  }
});
app.on("quit", async () => {
  await app.exit();
});
app.on("activate", function () {
  console.log("app is activated");
  if (mainWindow === null) {
    createWindow();
  }
});

const parseSwipeData = (data) => {
  try {
    data.replace(/\./g, "");
    const regex = /(?<=\^)(.*?)(?=\^)/;
    const rawName = regex.exec(data);
    const name = rawName[0].trim();
    const onecardRegex = /(\d{7})\s{3}/;
    const onecard = onecardRegex.exec(data);
    return { onecard: onecard[0].trim(), name };
  } catch (error) {
    console.log(error.message);
    throw new Error("Unable to determine Onecard/Name from provided input");
  }
};

const getMagtekSwiper = async () => {
  try {
    const devices = await HID.devicesAsync();
    if (devices.length > 0) {
      return devices.find(
        (device) =>
          device.vendorId === 2049 || device.manufacturer === "Mag-Tek"
      ).path;
    } else {
      throw new Error("No Mag-Tek MSR was detected. Exiting Application");
    }
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

const startListeningToSwiper = async () => {
  try {
    const swiperPath = await getMagtekSwiper();
    const swiper = new HID.HID(swiperPath);
    swiper.on("data", (dataBuffer) => {
      try {
        const swipeData = dataBuffer.toString("utf8");
        const onecardData = parseSwipeData(swipeData);
        typeString(onecardData.onecard);
        mainWindow.webContents.send("swipe-data", onecardData);
      } catch (error) {
        mainWindow.webContents.send("error", error.message);
      }
    });
  } catch (error) {
    mainWindow.webContents.send("error", error.message);
  }
};

startListeningToSwiper();

ipcMain.on("reload-swiper", startListeningToSwiper);
