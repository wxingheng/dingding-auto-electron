<template>
  <div id="wrapper">
    <el-row>
      <el-col :span="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>打卡设备</span>
          </div>
          <el-form :inline="true" ref="form" :model="form" label-width="120px">
            <el-form-item label="手机设备号">
              <el-input v-model="form.devices"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit">测试(点亮设备)</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        devices: "91QEBP8563ST"
      }
    };
  },
  methods: {
    onSubmit() {
      console.log("submit!");
      this.$electron.ipcRenderer.send("render-event", {
        type: "test-devices",
        data: { devices: this.form.devices }
      });
      // this.$electron.ipcRenderer.on("render-event", (event, arg) => {
      //   console.log("on render-event");
      // });
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
