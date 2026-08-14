<template>
  <div class="login">
    <!-- 左侧品牌区 -->
    <div class="login-brand">
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
    <div class="login-panel">
      <div class="login-card">
        <h3 class="login-title">欢迎登录</h3>
        <p class="login-sub">请输入您的账号信息</p>
        <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              type="text"
              size="large"
              auto-complete="off"
              placeholder="账号"
            >
              <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              size="large"
              auto-complete="off"
              placeholder="密码"
              @keyup.enter="handleLogin"
            >
              <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="code" v-if="captchaEnabled">
            <el-input
              v-model="loginForm.code"
              size="large"
              auto-complete="off"
              placeholder="验证码"
              style="width: 63%"
              @keyup.enter="handleLogin"
            >
              <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
            </el-input>
            <div class="login-code">
              <img :src="codeUrl" @click="getCode" class="login-code-img"/>
            </div>
          </el-form-item>
          <el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 25px 0px;">记住密码</el-checkbox>
          <el-form-item style="width:100%;">
            <el-button
              :loading="loading"
              size="large"
              type="primary"
              style="width:100%;"
              @click.prevent="handleLogin"
            >
              <span v-if="!loading">登 录</span>
              <span v-else>登 录 中...</span>
            </el-button>
            <div style="float: right;" v-if="register">
              <router-link class="link-type" :to="'/register'">立即注册</router-link>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!--  底部  -->
    <div class="el-login-footer">
      <span>{{ footerContent }}</span>
    </div>
  </div>
</template>

<script setup>
import { getCodeImg } from "@/api/modules/auth"
import Cookies from "js-cookie"
import { encrypt, decrypt } from "@/utils/jsencrypt"
import useUserStore from '@/store/modules/user'
import defaultSettings from '@/settings'

const title = import.meta.env.VITE_APP_TITLE
const footerContent = defaultSettings.footerContent
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

const loginForm = ref({
  username: "admin",
  password: "admin123",
  rememberMe: false,
  code: "",
  uuid: ""
})

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
}

const codeUrl = ref("")
const loading = ref(false)
// 验证码开关
const captchaEnabled = ref(true)
// 注册开关
const register = ref(true)
const redirect = ref(undefined)

watch(route, (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect
}, { immediate: true })

function handleLogin() {
  proxy.$refs.loginRef.validate(valid => {
    if (valid) {
      loading.value = true
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 })
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 })
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 })
      } else {
        // 否则移除
        Cookies.remove("username")
        Cookies.remove("password")
        Cookies.remove("rememberMe")
      }
      // 调用action的登录方法
      userStore.login(loginForm.value).then(() => {
        const query = route.query
        const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
          if (cur !== "redirect") {
            acc[cur] = query[cur]
          }
          return acc
        }, {})
        router.push({ path: redirect.value || "/", query: otherQueryParams })
      }).catch(() => {
        loading.value = false
        // 重新获取验证码
        if (captchaEnabled.value) {
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
      loginForm.value.uuid = res.uuid
    }
  })
}

function getCookie() {
  const username = Cookies.get("username")
  const password = Cookies.get("password")
  const rememberMe = Cookies.get("rememberMe")
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  }
}

getCode()
getCookie()
</script>

<style lang='scss' scoped>
.login {
  display: flex;
  min-height: 100vh;
  background: #ffffff;
}

/* 左侧品牌区 */
.login-brand {
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
.login-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  padding: 40px;
}

.login-card {
  width: 380px;
}

.login-title {
  font-size: 20px;
  font-weight: 600;
  color: #1D2129;
  margin: 0 0 6px;
}

.login-sub {
  font-size: 13px;
  color: #86909C;
  margin: 0 0 32px;
}

.login-form {
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

.login-code {
  width: 33%;
  height: 44px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}

.login-code-img {
  height: 44px;
  padding-left: 12px;
}

.el-login-footer {
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
html.dark .login {
  background: #141414;

  .login-brand {
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

  .login-panel {
    background: #141414;
  }

  .login-title {
    color: #ffffff;
  }

  .login-sub {
    color: #86909C;
  }
}
</style>
