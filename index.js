import HID from 'node-hid'
import pkg from './libnut-core-develop/index.js';
const { typeString } = pkg


const parseSwipeData = (data) => {
try {
    data.replace(/\./g, "");
    console.log(`This should have the dots removed: ${data}`)
    const regex = /(?<=\^)(.*?)(?=\^)/;
    const rawName = regex.exec(data);
    const name = rawName[0].trim();
    const onecardRegex = /(\d{7})\s{3}/;
    const onecard = onecardRegex.exec(data);
    return { onecard: onecard[0].trim(), name};
} catch (error) {
    console.log(error.message)
    throw new Error('Unable to determine Onecard/Name from provided input')
}
 };
 // get device list
const devices = await HID.devicesAsync()
const swiperPath = devices.find(device => device.vendorId === 2049 || device.manufacturer === 'Mag-Tek').path
console.log('Found Mag-Tek Swiper. Opening Device at ' + JSON.stringify(swiperPath))
const swiper = await HID.HIDAsync.open(swiperPath)
swiper.on('data', function(dataBuffer) {
    const swipeData = dataBuffer.toString('utf8')
    const onecardData = parseSwipeData(swipeData)
    typeString(onecardData.onecard)
} )
