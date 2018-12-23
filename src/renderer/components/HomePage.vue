<template>
  <div id="wrapper">
    <el-row>
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>打卡设备</span>
          </div>
          <el-form :inline="true" label-width="120px">
            <el-form-item label="手机设备号">
              <el-input v-model="form.devices"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleTest()">测试(点亮设备)</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>基本配置</span>
          </div>
          <el-form label-width="120px">
            <el-form-item label="上班时间">
              <el-time-picker
                v-model="form.startTime"
                :picker-options="{
                  selectableRange: '6:00:00 - 12:00:00'
                }"
                placeholder="上班时间"
              ></el-time-picker>
            </el-form-item>
            <el-form-item label="下班时间">
              <el-time-picker
                v-model="form.endTime"
                :picker-options="{
                  selectableRange: '12:00:00 - 23:00:00'
                }"
                placeholder="下班时间"
              ></el-time-picker>
            </el-form-item>
            <el-form-item label="邮箱账号">
              <el-input v-model="form.email"></el-input>
            </el-form-item>
            <el-form-item label="邮箱秘钥">
              <el-input v-model="form.emailPWD"></el-input>
            </el-form-item>
            <el-form-item label="截图保存路径">
              <el-input v-model="form.screenPath"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="testScreen()">测试截屏并发送邮箱</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>流程配置</span>
          </div>
          <el-form v-for="(item, i) in form.flows" :key="i" :inline="true" label-width="120px">
            <el-form-item label="延迟等待">
              <el-input v-model="item.duration"></el-input>
            </el-form-item>
            <el-form-item label>秒，{{item.text}}</el-form-item>
            <el-form-item label="像素点">
              <el-input v-model="item.positon"></el-input>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="24">
        <el-button type="primary" @click="save()">保存</el-button>
        <el-button type="primary" @click="startRun()">开始运行</el-button>
        <el-button type="primary" @click="stopRun()">结束运行</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as moment from "moment";
export default {
  data() {
    return {
      form: {
        devices: "91QEBP8563ST",
        startTime: new Date(moment("2018-01-01 09:00:00")),
        endTime: new Date(moment("2018-01-01 18:30:00")),
        email: "1228678518@qq.com",
        emailPWD: "dzurdbumhdlgichd",
        screenPath: "E:\\",
        flows: [
          {
            text: "点击“钉钉打卡”",
            duration: 10,
            positon: "540, 1818"
          },
          {
            text: "点击“考勤打卡”",
            duration: 11,
            positon: "678, 1618"
          },
          {
            text: "点击“上班打卡”",
            duration: 12,
            positon: "552, 801"
          },
          {
            text: "点击“下班打卡”",
            duration: 13,
            positon: "538, 1223"
          }
        ]
      }
    };
  },
  methods: {
    handleTest() {
      console.log("submit!");
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
        ...this.form,
        startTime: moment(this.form.startTime).format("HH:mm:ss"),
        endTime: moment(this.form.endTime).format("HH:mm:ss")
      });
      localStorage.setItem("DINGDINGCONFIG", data);
      // this.$electron.ipcRenderer.send("render-event", {
      //   type: "save-config",
      //   data
      // });
    },
    startRun() {
      console.log("startTun---");
    },
    stopRun() {
      console.log("stopTun---");
    },
    testScreen() {
      const data = {
        ...this.form,
        startTime: moment(this.form.startTime).format("HH:mm:ss"),
        endTime: moment(this.form.endTime).format("HH:mm:ss")
      };
      this.$electron.ipcRenderer.send("render-event", {
        type: "test-screen",
        data
      });
    }
  },
  mounted() {
    console.log(this.$electron);
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
  padding: 60px 80px;
  width: 100vw;
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
</style>
