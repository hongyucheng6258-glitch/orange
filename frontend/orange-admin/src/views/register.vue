<template>
  <div class="register">
    <!-- 左侧品牌区 -->
    <div class="register-brand">
      <div class="brand-inner">
        <div class="brand-logo">
          <img src="@/assets/logo/logo.svg" alt="logo" class="brand-logo-img" />
        </div>
        <h1 class="brand-title">{{ title }}</h1>
        <p class="brand-slogan">高效、稳定、易用的企业级后台管理解决方案</p>
      </div>
      <div class="brand-deco brand-deco-1"></div>
      <div class="brand-deco brand-deco-2"></div>
      <div class="brand-deco brand-deco-3"></div>
    </div>

    <!-- 右侧表单区 -->
    <div class="register-panel">
      <div class="register-card">
        <h3 class="register-title">创建账号</h3>
        <p class="register-sub">注册后即可登录系统</p>
        <el-form ref="registerRef" :model="registerForm" :rules="registerRules" class="register-form">
          <el-form-item prop="username">
            <el-input 
              v-model="registerForm.username" 
              type="text" 
              size="large" 
              auto-complete="off" 
              placeholder="账号"
            >
              <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password" :rules="registerPwdValidator">
            <el-input
              v-model="registerForm.password"
              type="password"
              size="large" 
              auto-complete="off"
              placeholder="密码"
              @keyup.enter="handleRegister"
            >
              <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              size="large" 
              auto-complete="off"
              placeholder="确认密码"
              @keyup.enter="handleRegister"
            >
              <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="code" v-if="captchaEnabled">
            <el-input
              size="large" 
              v-model="registerForm.code"
              auto-complete="off"
              placeholder="验证码"
              style="width: 63%"
              @keyup.enter="handleRegister"
            >
              <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
            </el-input>
            <div class="register-code">
              <img :src="codeUrl" @click="getCode" class="register-code-img"/>
            </div>
          </el-form-item>
          <el-form-item style="width:100%;">
            <el-button
              :loading="loading"
              size="large" 
              type="primary"
              style="width:100%;"
              @click.prevent="handleRegister"
            >
              <span v-if="!loading">注 册</span>
              <span v-else>注 册 中...</span>
            </el-button>
            <div style="float: right;">
              <router-link class="link-type" :to="'/login'">使用已有账户登录</router-link>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!--  底部  -->
    <div class="el-register-footer">
      <span>{{ footerContent }}</span>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox } from "element-plus"
import { getCodeImg, register } from "@/api/modules/auth"
import defaultSettings from '@/settings'
import { usePasswordRule } from "@/utils/passwordRule"

const title = import.meta.env.VITE_APP_TITLE
const footerContent = defaultSettings.footerContent
const router = useRouter()
const { proxy } = getCurrentInstance()
const { registerPwdValidator } = usePasswordRule()

const registerForm = ref({
  username: "",
  password: "",
  confirmPassword: "",
  code: "",
  uuid: ""
})

const equalToPassword = (rule, value, callback) => {
  if (registerForm.value.password !== value) {
    callback(new Error("两次输入的密码不一致"))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, trigger: "blur", message: "请输入您的账号" },
    { min: 2, max: 20, message: "用户账号长度必须介于 2 和 20 之间", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, trigger: "blur", message: "请再次输入您的密码" },
    { required: true, validator: equalToPassword, trigger: "blur" }
  ],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
}

const codeUrl = ref("")
const loading = ref(false)
const captchaEnabled = ref(true)

function handleRegister() {
  proxy.$refs.registerRef.validate(valid => {
    if (valid) {
      loading.value = true
      register(registerForm.value).then(res => {
        const username = registerForm.value.username
        ElMessageBox.alert("<font color='red'>恭喜你，您的账号 " + username + " 注册成功！</font>", "系统提示", {
          dangerouslyUseHTMLString: true,
          type: "success",
        }).then(() => {
          router.push("/login")
        }).catch(() => {})
      }).catch(() => {
        loading.value = false
        if (captchaEnabled) {
          getCode()
        }
      })
    }
  })
}

function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img
      registerForm.value.uuid = res.uuid
    }
  })
}

getCode()
</script>

<style lang='scss' scoped>
.register {
  display: flex;
  min-height: 100vh;
  background: #ffffff;
}

/* 左侧品牌区 */
.register-brand {
  position: relative;
  flex: 0 0 55%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
}

.brand-inner {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 40px;
}

.brand-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.brand-logo-img {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.25);
}

.brand-title {
  font-size: 28px;
  font-weight: 600;
  color: #1D2129;
  margin: 0 0 12px;
  letter-spacing: 1px;
}

.brand-slogan {
  font-size: 15px;
  color: #4E5969;
  margin: 0;
  letter-spacing: 0.5px;
}

/* 几何装饰 */
.brand-deco {
  position: absolute;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.08);
}

.brand-deco-1 {
  width: 360px;
  height: 360px;
  top: -120px;
  right: -80px;
}

.brand-deco-2 {
  width: 240px;
  height: 240px;
  bottom: -80px;
  left: -60px;
  background: rgba(16, 185, 129, 0.06);
}

.brand-deco-3 {
  width: 120px;
  height: 120px;
  top: 50%;
  left: 8%;
  background: rgba(59, 130, 246, 0.05);
}

/* 右侧表单区 */
.register-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  padding: 40px;
}

.register-card {
  width: 380px;
}

.register-title {
  font-size: 20px;
  font-weight: 600;
  color: #1D2129;
  margin: 0 0 6px;
}

.register-sub {
  font-size: 13px;
  color: #86909C;
  margin: 0 0 32px;
}

.register-form {
  .el-input {
    height: 44px;
    input {
      height: 44px;
    }
  }
  .input-icon {
    height: 43px;
    width: 14px;
    margin-left: 0px;
  }
}

.register-code {
  width: 33%;
  height: 44px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}

.register-code-img {
  height: 44px;
  padding-left: 12px;
}

.el-register-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #86909C;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}

/* 暗黑模式 */
html.dark .register {
  background: #141414;

  .register-brand {
    background: linear-gradient(135deg, #18212b 0%, #1e293b 100%);
  }

  .brand-title {
    color: #ffffff;
  }

  .brand-slogan {
    color: #d0d0d0;
  }

  .brand-deco {
    background: rgba(59, 130, 246, 0.12);
  }

  .brand-deco-2 {
    background: rgba(16, 185, 129, 0.1);
  }

  .register-panel {
    background: #141414;
  }

  .register-title {
    color: #ffffff;
  }

  .register-sub {
    color: #86909C;
  }
}
</style>
