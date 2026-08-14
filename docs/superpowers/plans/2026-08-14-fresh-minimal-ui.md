# 清新极简 UI 实施计划

- 日期：2026-08-14
- 依据设计文档：`docs/superpowers/specs/2026-08-14-fresh-minimal-ui-design.md`
- 项目：`e:\work\毕业设计2\frontend\orange-admin`

## 文件结构

| 文件 | 责任 | 操作 |
|------|------|------|
| `src/styles/fresh-theme.scss` | 全局清新主题覆盖层（Element Plus 变量 + 组件样式） | 新增 |
| `src/styles/variables.module.scss` | 浅色侧栏变量、CSS 变量微调 | 修改 |
| `src/styles/index.scss` | 引入 fresh-theme | 修改 |
| `src/settings.js` | 默认主题色、浅色侧栏 | 修改 |
| `src/store/modules/settings.js` | 默认主题色同步 | 修改 |
| `src/views/login.vue` | 登录页左右分栏 | 重写 |
| `src/views/register.vue` | 注册页对齐登录风格 | 重写 |
| `src/views/index.vue` | 首页去彩虹渐变 | 重写 |
| `src/layouts/components/Navbar.vue` | 高度 56px、分割线微调 | 修改 |

## 任务

### 任务 1：新增全局清新主题覆盖层 `src/styles/fresh-theme.scss`

创建 `e:\work\毕业设计2\frontend\orange-admin\src\styles\fresh-theme.scss`，内容：

```scss
/**
 * 清新极简主题覆盖层
 * 统一 Element Plus 组件视觉：浅色底、低饱和点缀、留白
 */

/* ---------- 亮色模式基础变量 ---------- */
:root {
  /* 主色（与 settings.js 默认 #3B82F6 联动） */
  --el-color-primary: #3B82F6;
  --el-color-primary-light-3: #7DA8F8;
  --el-color-primary-light-5: #A9C6FB;
  --el-color-primary-light-7: #D4E3FD;
  --el-color-primary-light-8: #E6EFFE;
  --el-color-primary-light-9: #F0F6FF;
  --el-color-primary-dark-2: #2563EB;

  /* 语义色 */
  --el-color-success: #10B981;
  --el-color-warning: #F59E0B;
  --el-color-danger: #EF4444;
  --el-color-info: #94A3B8;

  /* 中性色 */
  --el-text-color-primary: #1D2129;
  --el-text-color-regular: #4E5969;
  --el-text-color-secondary: #86909C;
  --el-text-color-placeholder: #A9AEB8;
  --el-border-color: #E5E6EB;
  --el-border-color-light: #EBECF0;
  --el-border-color-lighter: #F0F1F3;
  --el-border-color-extra-light: #F5F6F7;
  --el-fill-color: #F2F3F5;
  --el-fill-color-light: #F5F6F7;
  --el-fill-color-lighter: #F8F9FA;
  --el-fill-color-blank: #FFFFFF;
  --el-bg-color: #FFFFFF;
  --el-bg-color-page: #F7F8FA;
  --el-bg-color-overlay: #FFFFFF;

  /* 圆角 */
  --el-border-radius-base: 6px;
  --el-border-radius-small: 4px;
  --el-border-radius-round: 20px;

  /* 阴影 */
  --el-box-shadow-light: 0 1px 2px rgba(0, 0, 0, 0.04);
  --el-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  /* 页面背景 */
  --page-bg: #F7F8FA;
  --card-bg: #FFFFFF;
  --card-border: #E5E6EB;
  --hover-bg: #F2F3F5;
  --primary-soft: #DBEAFE;
}

/* ---------- 主内容区背景 ---------- */
.app-main {
  background-color: var(--page-bg);
}

/* ---------- 卡片 ---------- */
.el-card {
  border: 1px solid var(--card-border);
  border-radius: 10px;
  box-shadow: var(--el-box-shadow-light);
}

/* ---------- 表格：去斑马纹、浅表头、悬停 ---------- */
.el-table {
  --el-table-header-bg-color: #F7F8FA;
  --el-table-header-text-color: #4E5969;
  --el-table-border-color: #EBECF0;
  --el-table-row-hover-bg-color: #F2F3F5;
  border-radius: 8px;

  th.el-table__cell {
    font-weight: 600;
    font-size: 13px;
  }
}

/* ---------- 弹窗 ---------- */
.el-dialog {
  border-radius: 12px;
  box-shadow: var(--el-box-shadow);
}

/* ---------- 按钮：操作列文字化 ---------- */
.el-table .el-button--small.is-link,
.el-table .el-button--link {
  padding: 0 4px;
}

/* ---------- 搜索区卡片化 ---------- */
.app-search {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
}

/* ---------- 侧边栏浅色激活态 ---------- */
.sidebar-container.theme-light {
  .el-menu-item.is-active {
    color: var(--el-color-primary) !important;
    background-color: var(--primary-soft) !important;
    border-radius: 8px;
    margin: 2px 8px;
  }
}

/* ---------- 标签栏激活态（卡片样式） ---------- */
.tags-view-container:not(.tags-view-container--chrome) {
  .tags-view-wrapper .tags-view-item {
    border-radius: 6px;
    border-color: var(--card-border);
  }
  .tags-view-wrapper .tags-view-item.active {
    background-color: var(--primary-soft) !important;
    border-color: var(--el-color-primary) !important;
    color: var(--el-color-primary) !important;
    &::before {
      background: var(--el-color-primary) !important;
    }
  }
}

/* ---------- 暗黑模式微调 ---------- */
html.dark {
  --page-bg: #141414;
  --card-bg: #1d1e1f;
  --card-border: #3a3a3a;
  --hover-bg: #2d2d2d;
  --primary-soft: #18212b;

  .app-main {
    background-color: var(--page-bg);
  }
  .el-card {
    border-color: var(--card-border);
  }
  .sidebar-container.theme-light {
    .el-menu-item.is-active {
      background-color: var(--primary-soft) !important;
    }
  }
}
```

### 任务 2：更新 `src/styles/variables.module.scss`

1. 浅色侧栏文字色 `$menuLightText` 由 `#303133` 改为 `#4E5969`。
2. 浅色侧栏激活文字 `$menuLightActiveText` 由 `#409EFF` 改为 `#3B82F6`。
3. `:root` 中新增页面背景与卡片变量：

```scss
:root {
  --sidebar-bg: #{$menuBg};
  --sidebar-text: #{$menuText};
  --menu-hover: #{$menuHover};

  --navbar-bg: #ffffff;
  --navbar-text: #303133;

  --page-bg: #f7f8fa;
  --card-bg: #ffffff;
  --card-border: #e5e6eb;

  /* splitpanes default-theme 变量 */
  --splitpanes-default-bg: #ffffff;
}
```

### 任务 3：更新 `src/settings.js`

```js
sideTheme: 'theme-light',
```

### 任务 4：更新 `src/store/modules/settings.js`

默认主题色 `theme` 由 `'#409EFF'` 改为 `'#3B82F6'`：

```js
theme: storageSetting.theme || '#3B82F6',
```

### 任务 5：更新 `src/styles/index.scss`

在 `@use './orange.scss';` 之后追加：

```scss
@use './fresh-theme.scss';
```

### 任务 6：重写 `src/views/login.vue`

左右分栏：左侧品牌区（浅蓝渐变 + 系统名 + slogan + 几何装饰），右侧白底表单。保留全部登录逻辑（验证码、记住密码、注册链接、暗黑模式）。模板结构：

```html
<template>
  <div class="login">
    <div class="login-brand">
      <div class="brand-inner">
        <div class="brand-logo">
          <svg-icon icon-class="orange" class="brand-logo-icon" />
        </div>
        <h1 class="brand-title">{{ title }}</h1>
        <p class="brand-slogan">高效、稳定、易用的企业级后台管理解决方案</p>
      </div>
      <div class="brand-deco brand-deco-1"></div>
      <div class="brand-deco brand-deco-2"></div>
    </div>
    <div class="login-panel">
      <div class="login-card">
        <h3 class="login-title">欢迎登录</h3>
        <p class="login-sub">请输入您的账号信息</p>
        <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
          <!-- 表单内容与现有一致：账号/密码/验证码/记住密码/登录按钮/注册链接 -->
        </el-form>
      </div>
    </div>
    <div class="el-login-footer">
      <span>{{ footerContent }}</span>
    </div>
  </div>
</template>
```

样式要点：`.login` 为 flex 左右分栏，`min-height: 100vh`；`.login-brand` 占 55%，浅蓝渐变 `linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)`，内含几何圆装饰；`.login-panel` 占 45%，白底居中；`.login-card` 宽 380px。暗黑模式下品牌区用 `#18212b` 渐变，卡片用 `--el-bg-color-overlay`。

脚本逻辑（`<script setup>`）与现有 `login.vue` 完全一致，仅模板与样式变化。

### 任务 7：重写 `src/views/register.vue`

与登录页同构：左右分栏、同品牌区、同表单卡片。脚本逻辑与现有 `register.vue` 一致。

### 任务 8：重写 `src/views/index.vue`

- 欢迎条：白底卡片，左侧问候语（"欢迎使用橙子管理系统"）+ 简短说明，右侧放系统版本信息，无渐变。
- 功能模块卡片：8 个模块，图标统一主色线性图标（`color: var(--el-color-primary)`），去掉各自渐变色背景。
- 系统介绍：3 个特性卡，图标用中性色，hover 时主色。
- 保留 `goTarget` 跳转逻辑与模块数据。

### 任务 9：微调 `src/layouts/components/Navbar.vue`

- 高度 `50px` 改为 `56px`。
- 底部阴影 `rgba(0, 21, 41, 0.08)` 改为更淡 `rgba(0, 0, 0, 0.04)`。
- `.right-menu` 行高同步 `56px`。

### 任务 10：验证

```bash
cd e:\work\毕业设计2\frontend\orange-admin
npm run build
```

预期：构建成功，无报错。随后启动前端 `npm run dev`，人工核对登录、注册、首页、用户管理列表页、暗黑模式、主题色切换。
