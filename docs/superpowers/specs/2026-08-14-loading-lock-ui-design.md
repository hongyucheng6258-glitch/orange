# 跳转加载与锁屏页优化设计文档

日期：2026-08-14
项目：橙子管理系统（RuoYi-Vue3 前端）

## 背景

系统已完成"清新极简"主题改造（见 `2026-08-14-fresh-minimal-ui-design.md`），但存在两处体验不统一：

1. **首页功能模块卡片跳转**：`src/views/index.vue` 的 `goTarget` 使用 `window.open(path, '_self')` 触发整页刷新，导致白屏重载、进度条从头开始，与侧边栏 SPA 跳转（fade-transform 过渡）体验脱节；路由过渡参数（0.5s + 30px 位移）偏慢生硬；NProgress 进度条为默认蓝色未定制。

2. **锁屏页**：`src/views/lock.vue` 为深紫黑渐变 + 白色粒子动画 + 毛玻璃卡片，属"炫酷风"，与清新极简体系（浅灰底 `#F7F8FA`、品牌蓝 `#3B82F6`、白底圆角卡片）完全不统一。

## 设计目标

- 卡片跳转与侧边栏跳转体验一致：SPA 路由跳转 + 轻快过渡 + 主题色进度条
- 锁屏页采用浅色清新风，与登录页视觉语言完全统一，支持暗色模式

## 方案 A：卡片跳转加载体验优化

### A1. 跳转方式改为 SPA 路由

`src/views/index.vue`：

```js
function goTarget(path) {
  if (path) {
    router.push(path)  // 替代 window.open(path, '_self')
  }
}
```

效果：消除整页刷新，路由切换走 `AppMain.vue` 的 `fade-transform` 过渡，与侧边栏点击体验一致。

### A2. 路由过渡参数优化

`src/styles/transition.scss` 中 `fade-transform`：

- 时长：`0.5s` → `0.3s`
- 位移：`±30px` → `±12px`
- 叠加轻微透明度渐变，形成"轻快淡入"而非"平移滑动"

```scss
.fade-transform--move,
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(12px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
```

### A3. NProgress 进度条主题化

在 `src/styles/fresh-theme.scss` 追加（全局生效）：

- 高度 4px、圆角收尾
- 颜色随 `--el-color-primary` 联动（亮色 `#3B82F6`，暗色模式自动柔化）
- 轻量阴影增强质感

## 方案 B：锁屏页浅色清新风

重写 `src/views/lock.vue`，视觉语言对齐登录页：

### B1. 布局

```
┌────────────────────────────────────────────┐
│         （浅蓝渐变背景 + 装饰圆）            │
│                                            │
│           22:14:36   ← 时钟 72px 深色      │
│      2026年8月14日 星期五  ← 日期 灰        │
│                                            │
│   ┌──────────────────────────────────┐     │
│   │      (头像 + 品牌蓝描边)           │     │
│   │         橙子管理员                │     │
│   │   系统已锁定，请输入密码解锁        │     │
│   │   [ 请输入登录密码  ] (解锁按钮)   │     │
│   │   错误提示 / 退出重新登录          │     │
│   └──────────────────────────────────┘     │
└────────────────────────────────────────┘
```

### B2. 设计令牌

| 元素 | 亮色 | 暗色 |
|---|---|---|
| 页面背景 | `linear-gradient(135deg, #EFF6FF, #DBEAFE)` | `linear-gradient(135deg, #18212B, #1E293B)` |
| 装饰圆 | `rgba(59,130,246,0.08)` | `rgba(59,130,246,0.15)` |
| 时钟 | `#1D2129` 72px 细体 | `#FFFFFF` |
| 日期 | `#4E5969` | `rgba(255,255,255,0.6)` |
| 卡片 | `#FFFFFF` 10px 圆角 `#E5E6EB` 边框 柔和阴影 | `#1D1E1F` `#3A3A3A` 边框 |
| 用户名 | `#1D2129` 600 | `#FFFFFF` |
| 提示文字 | `#86909C` | `rgba(255,255,255,0.5)` |
| 输入框 | 白底 `#E5E6EB` 边框 6px 圆角，聚焦 `#3B82F6` | 深色输入框 |
| 解锁按钮 | `#3B82F6` 白字圆角 8px | 同左 |
| 错误提示 | `#EF4444` | 同左 |

### B3. 交互细节

- 密码输入框自动聚焦，回车解锁
- 密码错误：输入框红色描边 + 抖动动画 + 错误文案
- 解锁中：按钮 loading 态
- 头像加载失败回退默认图
- 保留"退出重新登录"链接（灰色弱化）
- 移除 canvas 粒子动画（性能 + 风格统一）

## 影响文件

| 文件 | 改动 |
|---|---|
| `src/views/index.vue` | `goTarget` 改用 `router.push`，引入 `useRouter` |
| `src/styles/transition.scss` | `fade-transform` 过渡参数 |
| `src/styles/fresh-theme.scss` | 追加 NProgress 主题样式 |
| `src/views/lock.vue` | 整体重写为浅色清新风 |

## 验收标准

1. 点击首页 8 张功能卡片：URL 变化为 SPA 跳转（无整页刷新、无白屏闪烁），过渡柔和
2. 路由切换进度条为主题色 `#3B82F6`，暗色模式下正常
3. 锁屏页（点击头像下拉"锁定屏幕"或手动访问 `/lock`）：浅色清新风，时钟日期正常走秒，输入密码可解锁回原页面
4. 暗色模式下锁屏页配色正常
5. `npm run build:prod` 构建无报错
