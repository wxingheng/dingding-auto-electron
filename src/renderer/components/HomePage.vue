<template>
  <div id="wrapper">
    <el-row>
      <el-col :span="16">
        <el-row>
          <!-- <el-col :span="24">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>打卡设备</span>
              </div>
              <el-form :inline="true" label-width="120px">
                <el-form-item label="手机设备号">
                  <el-input :disabled="true" v-model="form.devices"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleTest()">测试(点亮设备)</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>-->
          <el-col :span="24">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>基本配置</span>
              </div>
              <p style="text-align: center;margin-bottom: 10px;">
                <el-tag v-if="!holiday" type="success" size="medium">我在工作，请放心！</el-tag>
                <el-tag v-if="holiday" type="warning" size="medium">你休息的时候我不打卡^-^ !</el-tag>
              </p>
              <el-form label-width="120px">
                <el-form-item label="上班时间">
                  <el-time-select
                    v-model="form.startTime"
                    :picker-options="{
                  start: '00:00',
                  step: '00:01',
                  end: '23:59'
                }"
                    placeholder="选择时间"
                  ></el-time-select>
                </el-form-item>
                <el-form-item label="下班时间">
                  <el-time-select
                    v-model="form.endTime"
                    :picker-options="{
                  start: '00:00',
                  step: '00:01',
                  end: '23:59'
                }"
                    placeholder="选择时间"
                  ></el-time-select>
                </el-form-item>
                <el-form-item label="邮箱账号">
                  <el-input v-model="form.email"></el-input>
                </el-form-item>
                <el-form-item label="邮箱秘钥">
                  <el-input v-model="form.emailPWD"></el-input>
                </el-form-item>
                <!-- <el-form-item label="截图保存路径">
                  <el-input :disabled="true" v-model="form.screenPath"></el-input>
                </el-form-item>-->
                <el-form-item>
                  <el-button type="primary" @click="testScreen()">测试(截屏并发送邮箱)</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
          <el-col :span="24" class="mg-top">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>流程配置</span>
              </div>
              <el-form :inline="true" label-width="40px">
                <el-form-item :label="'延迟'">
                  <el-input v-model="add.duration"></el-input>
                </el-form-item>
                <el-form-item label="名称">
                  <el-input v-model="add.text"></el-input>
                </el-form-item>
                <el-form-item label="点位">
                  <el-input v-model="add.positon"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="addStep(0)">插入</el-button>
                  <el-button type="primary" @click="addStep(1)">追加</el-button>
                </el-form-item>
              </el-form>
              <el-form v-for="(item, i) in form.flows" :key="i" :inline="true" label-width="120px">
                <el-form-item :label="(i+1) + ' 延迟等待'">
                  <el-input v-model="item.duration"></el-input>
                </el-form-item>
                <el-form-item label>毫秒，{{item.text}}</el-form-item>
                <el-form-item label="像素点">
                  <el-input v-model="item.positon"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="removeStep(i)">删除</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
          <el-col :span="24" class="mg-top mg-bt">
            <el-button type="primary" @click="save()">保存</el-button>
            <el-button type="primary" @click="testFlows()">测试流程</el-button>
            <el-button type="primary" @click="startRun()">开始运行</el-button>
            <el-button type="primary" @click="stopRun()">结束运行</el-button>
          </el-col>
          <el-col :span="24" class="mg-top mg-bt">
            <a
              href="javascript:void(0)"
              @click="send('https://github.com/wxingheng/dingding-auto-electron/releases')"
            >获取最新版本</a>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="8">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>运行日志</span>
          </div>
          <div class="logs">
            <el-alert
              v-for="(item, i) in logs"
              :key="i"
              :title="`${i}: ${item.text}`"
              type="info"
              :closable="false"
              show-icon
            ></el-alert>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as moment from "moment";
const { ipcRenderer } = require("electron");
const form = localStorage.getItem("DINGDINGCONFIG")
  ? {
      ...JSON.parse(localStorage.getItem("DINGDINGCONFIG"))
    }
  : {
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
export default {
  data() {
    return {
      form,
      logs: [],
      add: {
        duration: 10000,
        text: "点击“xxxx”",
        positon: "x y"
      },
      holiday: 0
    };
  },
  methods: {
    handleTest() {
      this.$electron.ipcRenderer.send("render-event", {
        type: "test-devices",
        data: { devices: this.form.devices }
      });
      // this.$electron.ipcRenderer.on("render-event", (event, arg) => {
      //   console.log("on render-event");
      // });
    },
    save() {
      console.log(this.form);
      const data = JSON.stringify({
        ...this.form
      });
      localStorage.setItem("DINGDINGCONFIG", data);
      // this.$electron.ipcRenderer.send("render-event", {
      //   type: "save-config",
      //   data
      // });
    },
    startRun() {
      const data = {
        ...this.form
      };
      console.log("startTun---", data);

      this.$electron.ipcRenderer.send("render-event", {
        type: "start-run",
        data
      });
    },
    stopRun() {
      this.$electron.ipcRenderer.send("render-event", {
        type: "stop-run"
      });
    },
    testScreen() {
      const data = {
        ...this.form
      };
      this.$electron.ipcRenderer.send("render-event", {
        type: "test-screen",
        data
      });
    },
    testFlows() {
      const data = {
        ...this.form
      };
      this.$electron.ipcRenderer.send("render-event", {
        type: "test-flows",
        data
      });
    },
    addStep(type) {
      switch (type) {
        case 0:
          this.form.flows.unshift(this.add);
          break;
        case 1:
          this.form.flows.push(this.add);
          break;
      }
    },
    removeStep(i) {
      console.log(123);
      this.form.flows.splice(i, 1);
    },
    send(url) {
      this.$electron.ipcRenderer.send("render-event", {
        type: "open-url",
        data: { url }
      });
    }
  },
  mounted() {
    console.log(this.$electron);
    this.$electron.ipcRenderer.on("render-event123", (event, arg) => {
      switch (arg.type) {
        case "default":
          if (this.logs.length >= 1000) {
            this.logs.splice(0, 1);
            this.logs.push(arg);
          } else {
            this.logs.push(arg);
          }
          break;
        case "holiday":
          this.holiday = arg.holiday;
      }
    });
  }
};
</script>

<style scoped lang="scss">
#wrapper {
  background: radial-gradient(
    ellipse at top left,
    rgba(255, 255, 255, 1) 40%,
    rgba(229, 229, 229, 0.9) 100%
  );
  height: 100vh;
  padding: 10px 10px;
  // width: 100vw;
}
.el-row {
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}
.el-col {
  border-radius: 4px;
}
.bg-purple-dark {
  background: #99a9bf;
}
.bg-purple {
  background: #d3dce6;
}
.bg-purple-light {
  background: #e5e9f2;
}
.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}
.mg-top {
  margin-top: 8px;
}
.mg-bt {
  text-align: center;
  margin-bottom: 20px;
}
.logs {
  height: 1036px;
  overflow-y: scroll;
}
</style>
