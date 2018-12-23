"use strict";

import {
  app,
  BrowserWindow,
  ipcMain
} from "electron";
const exec = require("child_process").exec;


const moment = require('moment');
const nodemailer = require("nodemailer");
const fs = require('fs');
const path = require('path');
const mineType = require('mime-types');

// const AipOcrClient = require("baidu-aip-sdk").ocr;
// // 设置APPID/AK/SK
// const APP_ID = "14617464";
// const API_KEY = "pxUG2m2KBbN9eq9EhZxhaRc2";
// const SECRET_KEY = "kmWAi5qmsIs6aH4GkWHvZVq9bUBKkRAy";

// // 新建一个对象，建议只保存一个对象调用服务接口
// const client = new AipOcrClient(APP_ID, API_KEY, SECRET_KEY);

// const HttpClient = require("baidu-aip-sdk").HttpClient;

// // 设置request库的一些参数，例如代理服务地址，超时时间等
// // request参数请参考 https://github.com/request/request#requestoptions-callback
// HttpClient.setRequestOptions({
//   timeout: 5000
// });

// // 也可以设置拦截每次请求（设置拦截后，调用的setRequestOptions设置的参数将不生效）,
// // 可以按需修改request参数（无论是否修改，必须返回函数调用参数）
// // request参数请参考 https://github.com/request/request#requestoptions-callback
// HttpClient.setRequestInterceptor(function (requestOptions) {
//   // 查看参数
//   // console.log(requestOptions)
//   // 修改参数
//   requestOptions.timeout = 5000;
//   // 返回参数
//   return requestOptions;
// });

let config = {};
let currentScreen = 'screen.png';
let defaultDelay = 1000;

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== "development") {
  global.__static = require("path")
    .join(__dirname, "/static")
    .replace(/\\/g, "\\\\");
}

let mainWindow;
const winURL =
  process.env.NODE_ENV === "development" ?
  `http://localhost:9080` :
  `file://${__dirname}/index.html`;



// 打卡相关逻辑

async function queue(arr) {
  let res = null
  for (let promise of arr) {
    console.log('----', promise);

    res = await promise(res)
  }
  return await res
}
// queue([a, b, c])
//   .then(data => {
//     console.log(data)// abc
//   })
const delay = (fun, time) => {
  defaultDelay = defaultDelay + time;
  console.log('defaultDelay-->', defaultDelay);
    setTimeout(() => {
      fun();
    }, defaultDelay)
}

const logs = (str) => {
  console.log(`log: ${str}`);
}
const createScreen = () => {
  logs('截图并保存到手机');
  currentScreen = `screen${moment().format('YYYYMMDDHHmm')}.png`
  exec(`adb shell screencap -p sdcard/${currentScreen}`);
}

const saveScreen = () => {
  logs('转移截图到电脑');
  exec(`adb pull sdcard/${currentScreen} E:\\`);
}

const sendEmail = () => {
  logs('发送到邮箱');
  let filePath = path.resolve(`E:/${currentScreen}`);
  let image = fs.readFileSync(filePath);
  let text = '';
  image = new Buffer(image).toString('base64');

  let base64 = 'data:' + mineType.lookup(filePath) + ';base64,' + image;
  const transporter = nodemailer.createTransport(`smtps://${config.email}:${config.emailPWD}@smtp.qq.com`);

  const mailOptions = {
    from: `${config.email}`, //发信邮箱
    to: `${config.email}`, //接收者邮箱
    subject: "打卡截图", //邮件主题
    text: "Hello！",
    html: `<p>${text}</p><img src="${base64}">`
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return console.log(error);
    }
  });

  // 调用通用文字识别, 图片参数为本地图片
  // client.generalBasic(image).then(function (result) {
  //     // console.log(JSON.stringify(result));
  //     const v = result.words_result.filter(d => d.words.search('打卡时间') !== -1);
  //     text = v.map(d => d.words);

  // }).catch(function (err) {
  //     // 如果发生网络错误
  //     console.log(err);
  // });
}

// 打卡相关逻辑


function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
    backgroundColor: "#f5f5f5",
    fullscreenable: false,
    frame: true,
    show: true // isDev ? true : false
  });

  mainWindow.loadURL(winURL);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on("render-event", function (event, arg) {
  console.log("render-event---", arg);
  switch (arg.type) {
    case "test-devices":
      console.log("arg.data.devices", arg.data.devices);
      exec(`adb -s ${arg.data.devices} shell input keyevent 26`);
      break;
    case "save-config":
      // 保存config.json 文件
      break;
    case "test-screen":
      console.log(arg.data);
      config = arg.data;
        delay(createScreen, 1000);
        delay(saveScreen, 6000);
        delay(sendEmail, 5000);
      // sendEmail();
      break;
  }
});



/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
