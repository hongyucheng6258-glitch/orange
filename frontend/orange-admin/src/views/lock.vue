<template>
  <div class="lock-container">
    <!-- 装饰圆 -->
    <div class="lock-deco lock-deco-1"></div>
    <div class="lock-deco lock-deco-2"></div>
    <div class="lock-deco lock-deco-3"></div>

    <!-- 时钟 -->
    <div class="lock-time">{{ currentTime }}</div>
    <div class="lock-date">{{ currentDate }}</div>

    <!-- 锁屏卡片 -->
    <div class="lock-card">
      <div class="avatar-wrap">
        <img :src="userStore.avatar" class="lock-avatar" @error="onAvatarError" />
        <div class="lock-icon">
          <svg-icon icon-class="lock" />
        </div>
      </div>
      <div class="lock-username">{{ userStore.nickName }}</div>
      <div class="lock-hint">系统已锁定，请输入密码解锁</div>

      <div class="input-wrap" :class="{ shake: isShaking, 'has-error': !!errorMsg }">
        <svg-icon icon-class="password" class="input-prefix" />
        <input ref="passwordInput" v-model="password" type="password" placeholder="请输入登录密码" class="lock-input" @keydown.enter="handleUnlock" autocomplete="off" />
        <button class="unlock-btn" @click="handleUnlock" :disabled="loading">
          <span v-if="!loading">→</span>
          <span v-else class="loading-dot">···</span>
        </button>
      </div>

      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

      <div class="lock-footer">
        <a href="javascript:;" @click="goLogin">退出重新登录</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import useUserStore from '@/store/modules/user'
import useLockStore from '@/store/modules/lock'
import { unlockScreen } from '@/api/modules/auth'
import defAva from '@/assets/images/profile.jpg'

const router = useRouter()
const userStore = useUserStore()
const lockStore = useLockStore()

const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const isShaking = ref(false)
const currentTime = ref('')
const currentDate = ref('')
const passwordInput = ref(null)

let timer = null

const onAvatarError = (e) => {
  e.target.src = defAva
}

const startClock = () => {
  const update = () => {
    const now = new Date()
    const pad = n => String(n).padStart(2, '0')
    currentTime.value = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    currentDate.value = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${days[now.getDay()]}`
  }
  update()
  timer = setInterval(update, 1000)
}

const handleUnlock = async () => {
  if (!password.value) {
    showError('请输入密码')
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    await unlockScreen(password.value)
    const lockPath = lockStore.lockPath
    lockStore.unlockScreen()
    router.replace(lockPath)
  } catch (err) {
    const msg = err.message || err.toString()
    showError(msg)
    password.value = ''
    nextTick(() => passwordInput.value?.focus())
  } finally {
    loading.value = false
  }
}

const showError = (msg) => {
  errorMsg.value = msg
  isShaking.value = true
  setTimeout(() => { isShaking.value = false }, 600)
}

const goLogin = () => {
  lockStore.unlockScreen()
  userStore.logOut().then(() => {
    router.push('/login')
  })
}

onMounted(() => {
  startClock()
  nextTick(() => passwordInput.value?.focus())
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.lock-container {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  overflow: hidden;
}

/* 装饰圆（对齐登录页品牌区） */
.lock-deco {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.lock-deco-1 {
  width: 480px;
  height: 480px;
  top: -160px;
  left: -120px;
  background: rgba(59, 130, 246, 0.08);
}

.lock-deco-2 {
  width: 320px;
  height: 320px;
  bottom: -100px;
  right: -80px;
  background: rgba(16, 185, 129, 0.06);
}

.lock-deco-3 {
  width: 200px;
  height: 200px;
  top: 20%;
  right: 12%;
  background: rgba(59, 130, 246, 0.05);
}

.lock-time {
  position: relative;
  z-index: 1;
  font-size: 72px;
  font-weight: 200;
  color: #1D2129;
  letter-spacing: 4px;
  margin-bottom: 8px;
  font-variant-numeric: tabular-nums;
}

.lock-date {
  position: relative;
  z-index: 1;
  font-size: 15px;
  color: #4E5969;
  margin-bottom: 48px;
  letter-spacing: 2px;
}

.lock-card {
  position: relative;
  z-index: 1;
  background: #FFFFFF;
  border: 1px solid #E5E6EB;
  border-radius: 12px;
  padding: 40px 48px;
  width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.avatar-wrap {
  position: relative;
  margin-bottom: 16px;
}

.lock-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #DBEAFE;
  object-fit: cover;
  display: block;
}

.lock-icon {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: #3B82F6;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.35);
}

.lock-username {
  color: #1D2129;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 6px;
  letter-spacing: 1px;
}

.lock-hint {
  color: #86909C;
  font-size: 13px;
  margin-bottom: 28px;
}

.input-wrap {
  width: 100%;
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border: 1px solid #E5E6EB;
  border-radius: 8px;
  padding: 0 6px 0 14px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.input-wrap:focus-within {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.input-wrap.has-error {
  border-color: #EF4444;
}

.input-wrap.shake {
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
}

.input-prefix {
  color: #86909C;
  font-size: 15px;
  margin-right: 8px;
  flex-shrink: 0;
}

.lock-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #1D2129;
  font-size: 15px;
  padding: 11px 0;
}

.lock-input::placeholder {
  color: #A9AEB8;
}

.unlock-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #3B82F6;
  border: none;
  color: #FFFFFF;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s, opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.unlock-btn:hover:not(:disabled) {
  background: #2563EB;
  transform: translateY(-1px);
}

.unlock-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-dot {
  font-size: 13px;
  letter-spacing: 1px;
}

.error-msg {
  margin-top: 14px;
  color: #EF4444;
  font-size: 13px;
  text-align: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.lock-footer {
  margin-top: 24px;
}

.lock-footer a {
  color: #86909C;
  font-size: 13px;
  text-decoration: none;
  transition: color 0.2s;
}

.lock-footer a:hover {
  color: #3B82F6;
}

/* 暗色模式 */
html.dark .lock-container {
  background: linear-gradient(135deg, #18212B 0%, #1E293B 100%);
}

html.dark .lock-deco-1 {
  background: rgba(59, 130, 246, 0.15);
}

html.dark .lock-deco-2 {
  background: rgba(16, 185, 129, 0.12);
}

html.dark .lock-deco-3 {
  background: rgba(59, 130, 246, 0.10);
}

html.dark .lock-time {
  color: #FFFFFF;
}

html.dark .lock-date {
  color: rgba(255, 255, 255, 0.6);
}

html.dark .lock-card {
  background: #1D1E1F;
  border-color: #3A3A3A;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

html.dark .lock-avatar {
  border-color: #2d2d2d;
}

html.dark .lock-username {
  color: #FFFFFF;
}

html.dark .lock-hint {
  color: rgba(255, 255, 255, 0.5);
}

html.dark .input-wrap {
  background: #141414;
  border-color: #3A3A3A;
}

html.dark .input-wrap:focus-within {
  border-color: #3B82F6;
}

html.dark .input-prefix {
  color: rgba(255, 255, 255, 0.45);
}

html.dark .lock-input {
  color: #FFFFFF;
}

html.dark .lock-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

html.dark .lock-footer a {
  color: rgba(255, 255, 255, 0.45);
}

html.dark .lock-footer a:hover {
  color: #7DA8F8;
}
</style>
