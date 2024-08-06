const { app, BrowserWindow, nativeImage } = require("electron");
const path = require("path");
const HID = require("node-hid");
const nut = require("./libnut.node");
const { typeString } = nut;

let mainWindow;

const appIcon = nativeImage.createFromPath(
  path.join(__dirname, "img", "favicon-32x32.png")
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
    });
    mainWindow.setIcon(appIcon);
    mainWindow.loadFile("index.html");
    mainWindow.on("closed", function () {
      console.log("main window closed");
      mainWindow = null;
      app.quit(); // Ensure the application exits when the window is closed
      return
    });
  } catch {
    console.log('error catcher quitting')
    app.quit()
  }
}

app.on("ready", createWindow);
app.on("will-quit", function () {
  console.log("all windows closed");
  if (process.platform !== "darwin") {
    console.log('process exit code 0 i should close now')
    app.quit()
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
    console.error(error.trace + "/n" + error.message);
  }
};

const startListeningToSwiper = async () => {
  const swiperPath = await getMagtekSwiper();
  const swiper = await HID.HIDAsync.open(swiperPath);
  swiper.on("data", function (dataBuffer) {
    const swipeData = dataBuffer.toString("utf8");
    const onecardData = parseSwipeData(swipeData);
    typeString(onecardData.onecard);
    mainWindow.webContents.send("swipe-data", onecardData);
  });
};

startListeningToSwiper();
