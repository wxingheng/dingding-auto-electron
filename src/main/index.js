"use strict";

import { app, BrowserWindow, ipcMain, globalShortcut, shell } from "electron";
import { Logger } from "builder-util/out/log";
import { start } from "repl";
const exec = require("child_process").exec;
const moment = require("moment");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const mineType = require("mime-types");
const request = require("request");
var holiday = 13; // 0 需要上班

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

let config = {
  devices: "91QEBP8563ST",
  startTime: "08:40", // new Date(moment("2018-01-01 09:00")),
  endTime: "18:35", //new Date(moment("2018-01-01 19:59")),
  email: "1228678518@qq.com",
  emailPWD: "dzurdbumhdlgichd",
  screenPath: "E:\\",
  flows: [
    {
      text: "点击“钉钉打卡”",
      duration: 15001,
      positon: "540 1818"
    },
    {
      text: "点击“考勤打卡”",
      duration: 11002,
      positon: "678 1618"
    },
    {
      text: "点击“上班打卡”",
      duration: 12003,
      positon: "552 801"
    },
    {
      text: "点击“下班打卡”",
      duration: 13004,
      positon: "538 1223"
    }
  ]
};
let currentScreen = "screen.png";
let defaultDelay = 1000;
let run = null;

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
  process.env.NODE_ENV === "development"
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;

// 打卡相关逻辑

async function queue(arr) {
  let res = null;
  for (let promise of arr) {
    res = await promise(res);
  }
  return await res;
}
// queue([a, b, c])
//   .then(data => {
//     console.log(data)// abc
//   })
const delay = (fun, time) => {
  defaultDelay = defaultDelay + time;
  logs(`defaultDelay--> ${defaultDelay}`);
  setTimeout(() => {
    fun();
  }, defaultDelay);
};

const logs = text => {
  console.log(`log: ${text}`);
  if (mainWindow) {
    mainWindow.webContents.send("render-event123", {
      type: "default",
      text
    });
  }
};

const clickScreen = () => {
  logs("点击电源键");
  exec(`adb shell input keyevent 26`);
};

const openDingding = () => {
  logs("打开钉钉");
  exec(
    `adb  shell monkey -p com.alibaba.android.rimet -c android.intent.category.LAUNCHER 1`
  );
};

const closeDingding = () => {
  logs("关闭钉钉");
  exec(`adb shell am force-stop com.alibaba.android.rimet`);
};

const createScreen = () => {
  logs("截图并保存到手机");
  currentScreen = `screen${moment().format("YYYYMMDDHHmm")}.png`;
  exec(`adb shell screencap -p sdcard/${currentScreen}`);
};

const saveScreen = () => {
  logs("转移截图到电脑");
  exec(`adb pull sdcard/${currentScreen} E:\\`);
};

const clickPosition = item => {
  logs(item.text);
  exec(`adb shell input tap ${item.positon}`);
};

// 用于初始化一些变量
const clear = () => {
  defaultDelay = 1000;
};
const updateHoliDay = date => {
  logs(`识别公休日-----------------》》》 ${date}`);
  request(`http://api.goseek.cn/Tools/holiday?date=${date}`, function(
    error,
    response,
    body
  ) {
    body = JSON.parse(body);
    if (body.code == 10000) {
      holiday = body.data;
      mainWindow.webContents.send("render-event123", {
        type: "holiday",
        holiday
      });
    }
  });
};
// 启动钉钉打卡
const startServer = () => {
  stopServer();
  if (moment().format("HH:mm") > config.endTime) {
    updateHoliDay(
      moment()
        .add(1, "days")
        .format("YYYYMMDD")
    );
  } else {
    updateHoliDay(moment().format("YYYYMMDD"));
  }
  run = setInterval(() => {
    logs(`运行中 ${moment().format("YYYY-MM-DD HH:mm:ss")}`);
    if (holiday) {
      logs(`休息了，不打卡罗！！！`);
      if (moment().format("HH:mm") == "00:02") {
        updateHoliDay(moment().format("YYYYMMDD"));
      }
    } else {
      if (moment().format("HH:mm") <= config.startTime) {
        goWork();
      } else if (
        moment().format("HH:mm") > config.startTime &&
        moment().format("HH:mm") <= config.endTime
      ) {
        offWork();
      } else {
        logs(`明天打卡时间  ${config.startTime} -- ${holiday}`);
      }
    }
  }, 1000);
};

const stopServer = () => {
  logs("stop ---");
  // if(run){
  clearInterval(run);
  // }
};

const goWork = () => {
  if (config.startTime === moment().format("HH:mm")) {
    clearInterval(run);
    logs("上班打卡流程开始-------------------------------------");
    clear();
    delay(clickScreen, 1000);
    delay(closeDingding, 10000);
    delay(openDingding, 10000);
    config.flows
      .filter(d => d.text.search("下班") === -1)
      .forEach(item => {
        delay(clickPosition.bind(this, item), item.duration);
      });
    delay(createScreen, 10000);
    delay(saveScreen, 10000);
    delay(
      sendEmail.bind(this, {
        text: "上班打卡"
      }),
      5000
    );
    delay(startServer, 5000);
  } else {
    logs(`等待上班打卡-----${config.startTime}`);
  }
};

const offWork = () => {
  if (config.endTime === moment().format("HH:mm")) {
    clearInterval(run);
    logs("下班打卡流程开始-------------------------------------");
    clear();
    delay(clickScreen, 1000);
    delay(closeDingding, 10000);
    delay(openDingding, 10000);
    config.flows
      .filter(d => d.text.search("上班") === -1)
      .forEach(item => {
        delay(clickPosition.bind(this, item), item.duration);
      });
    delay(createScreen, 10000);
    delay(saveScreen, 10000);
    delay(
      sendEmail.bind(this, {
        text: "下班打卡"
      }),
      5000
    );
    delay(startServer, 5000);
  } else {
    logs(`等待下班打卡-----${config.endTime}`);
  }
};

const sendEmail = data => {
  logs("发送到邮箱");
  let filePath = path.resolve(`E:/${currentScreen}`);
  let image = fs.readFileSync(filePath);
  let text = "";
  image = new Buffer(image).toString("base64");

  let base64 = "data:" + mineType.lookup(filePath) + ";base64," + image;
  const transporter = nodemailer.createTransport(
    `smtps://${config.email}:${config.emailPWD}@smtp.qq.com`
  );

  const mailOptions = {
    from: `${config.email}`, //发信邮箱
    to: `${config.email}`, //接收者邮箱
    subject: `${data ? data.text : ""} 打卡截图`, //邮件主题
    text: `${data ? data.text : ""} Hello！`,
    html: `<p>${text}</p><img src="${base64}">`
  };

  transporter.sendMail(mailOptions, function(error, info) {
    clickScreen();
    if (error) {
      return logs(error);
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
};

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
  //注册快捷键
  globalShortcut.register("ctrl+shift+5", function() {
    mainWindow.webContents.openDevTools(); //页面调试
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

ipcMain.on("render-event", function(event, arg) {
  switch (arg.type) {
    case "test-devices":
      clickScreen();
      break;
    case "save-config":
      // 保存config.json 文件
      break;
    case "test-screen":
      config = arg.data;
      delay(createScreen, 10000);
      delay(saveScreen, 10000);
      delay(sendEmail, 5000);
      break;
    case "test-flows":
      config = arg.data;
      clear();
      delay(clickScreen, 1000);
      delay(closeDingding, 10000);
      delay(openDingding, 10000);
      config.flows.forEach(item => {
        delay(clickPosition.bind(this, item), item.duration);
      });
      delay(createScreen, 10000);
      delay(saveScreen, 10000);
      delay(sendEmail, 5000);
      break;
    case "start-run":
      config = arg.data;
      startServer();
      break;
    case "stop-run":
      stopServer();
      break;
    case "open-url":
      shell.openExternal(arg.data.url);
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
