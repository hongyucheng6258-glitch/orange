<template>
  <div class="intro-page">
    <!-- 顶部 Hero -->
    <div class="hero">
      <div class="hero-deco hero-deco-1"></div>
      <div class="hero-deco hero-deco-2"></div>
      <div class="hero-content">
        <div class="hero-logo">
          <svg-icon icon-class="guide" class="hero-logo-icon" />
          橙子管理系统
        </div>
        <h1 class="hero-title">橙子管理系统</h1>
        <p class="hero-desc">高效、稳定、易用的企业级后台管理解决方案<br />基于 Spring Boot 3 + Vue 3 的前后端分离架构</p>
        <div class="hero-tags">
          <span class="hero-tag">Spring Boot 3</span>
          <span class="hero-tag">Vue 3</span>
          <span class="hero-tag">Element Plus</span>
          <span class="hero-tag">MyBatis</span>
          <span class="hero-tag">Redis</span>
          <span class="hero-tag">MySQL</span>
        </div>
      </div>
    </div>

    <div class="intro-body">
      <!-- 项目简介 -->
      <section class="intro-section">
        <div class="section-head">
          <span class="section-badge">01</span>
          <h2 class="section-title">项目简介</h2>
        </div>
        <p class="section-text">
          橙子管理系统是一套基于主流开源技术栈搭建的企业级后台管理平台，采用前后端分离架构。
          前端使用 Vue 3 组合式 API + Element Plus 组件库构建，提供清新极简的视觉体验；后端基于
          Spring Boot 3 快速开发框架，集成安全认证、权限控制、日志审计、任务调度、代码生成等通用能力，
          开箱即用，适合作为企业信息化系统的基础平台。
        </p>
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg-icon icon-class="people" />
            </div>
            <div class="feature-title">RBAC 权限模型</div>
            <div class="feature-desc">用户-角色-菜单三层权限体系，支持数据权限隔离，细粒度控制到按钮级别</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg-icon icon-class="monitor" />
            </div>
            <div class="feature-title">安全认证</div>
            <div class="feature-desc">JWT 无状态认证 + Redis 会话管理，集成验证码、登录限流、密码安全策略</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg-icon icon-class="log" />
            </div>
            <div class="feature-title">日志审计</div>
            <div class="feature-desc">操作日志与登录日志全程记录，可追踪每一次关键操作与登录行为</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg-icon icon-class="build" />
            </div>
            <div class="feature-title">代码生成</div>
            <div class="feature-desc">可视化表单构建 + 一键生成前后端 CRUD 代码，大幅提升开发效率</div>
          </div>
        </div>
      </section>

      <!-- 技术栈 -->
      <section class="intro-section">
        <div class="section-head">
          <span class="section-badge">02</span>
          <h2 class="section-title">技术栈</h2>
        </div>
        <div class="tech-grid">
          <div class="tech-col">
            <h3 class="tech-col-title">
              <span class="tech-dot frontend"></span>前端技术
            </h3>
            <ul class="tech-list">
              <li><span class="tech-name">Vue 3</span><span class="tech-desc">组合式 API 响应式框架</span></li>
              <li><span class="tech-name">Vite</span><span class="tech-desc">下一代前端构建工具，毫秒级热更新</span></li>
              <li><span class="tech-name">Element Plus</span><span class="tech-desc">企业级 UI 组件库</span></li>
              <li><span class="tech-name">Pinia</span><span class="tech-desc">Vue 官方状态管理</span></li>
              <li><span class="tech-name">Vue Router</span><span class="tech-desc">前端路由与动态权限菜单</span></li>
              <li><span class="tech-name">SCSS</span><span class="tech-desc">模块化样式与主题定制</span></li>
            </ul>
          </div>
          <div class="tech-col">
            <h3 class="tech-col-title">
              <span class="tech-dot backend"></span>后端技术
            </h3>
            <ul class="tech-list">
              <li><span class="tech-name">Spring Boot 3</span><span class="tech-desc">Java 微服务快速开发框架</span></li>
              <li><span class="tech-name">MyBatis</span><span class="tech-desc">轻量级持久层框架</span></li>
              <li><span class="tech-name">Spring Security</span><span class="tech-desc">安全认证与授权</span></li>
              <li><span class="tech-name">JWT</span><span class="tech-desc">无状态令牌认证</span></li>
              <li><span class="tech-name">Redis</span><span class="tech-desc">缓存、会话与验证码存储</span></li>
              <li><span class="tech-name">Quartz</span><span class="tech-desc">分布式任务调度</span></li>
            </ul>
          </div>
          <div class="tech-col">
            <h3 class="tech-col-title">
              <span class="tech-dot data"></span>基础设施
            </h3>
            <ul class="tech-list">
              <li><span class="tech-name">MySQL</span><span class="tech-desc">主数据库，存储业务数据</span></li>
              <li><span class="tech-name">Druid</span><span class="tech-desc">数据库连接池与监控</span></li>
              <li><span class="tech-name">Swagger</span><span class="tech-desc">API 接口文档与调试</span></li>
              <li><span class="tech-name">Maven</span><span class="tech-desc">后端依赖与构建管理</span></li>
              <li><span class="tech-name">npm</span><span class="tech-desc">前端依赖管理</span></li>
              <li><span class="tech-name">Lombok</span><span class="tech-desc">简化 Java 实体代码</span></li>
            </ul>
          </div>
        </div>
      </section>

      <!-- 功能模块 -->
      <section class="intro-section">
        <div class="section-head">
          <span class="section-badge">03</span>
          <h2 class="section-title">功能模块</h2>
        </div>
        <div class="module-grid">
          <div class="module-card">
            <div class="module-head">
              <svg-icon icon-class="system" class="module-icon" />
              <span>系统管理</span>
            </div>
            <p class="module-desc">用户、角色、菜单、部门、岗位、字典、参数、通知公告等基础数据管理</p>
            <ul class="module-tags">
              <li>用户管理</li>
              <li>角色管理</li>
              <li>菜单管理</li>
              <li>部门管理</li>
              <li>岗位管理</li>
              <li>字典管理</li>
              <li>参数设置</li>
              <li>通知公告</li>
            </ul>
          </div>
          <div class="module-card">
            <div class="module-head">
              <svg-icon icon-class="monitor" class="module-icon" />
              <span>系统监控</span>
            </div>
            <p class="module-desc">实时掌握系统运行状态，支持在线会话管理与任务调度</p>
            <ul class="module-tags">
              <li>在线用户</li>
              <li>定时任务</li>
              <li>数据监控</li>
              <li>服务监控</li>
              <li>缓存监控</li>
            </ul>
          </div>
          <div class="module-card">
            <div class="module-head">
              <svg-icon icon-class="tool" class="module-icon" />
              <span>系统工具</span>
            </div>
            <p class="module-desc">表单可视化构建、代码自动生成与接口文档管理</p>
            <ul class="module-tags">
              <li>表单构建</li>
              <li>代码生成</li>
              <li>系统接口</li>
            </ul>
          </div>
          <div class="module-card">
            <div class="module-head">
              <svg-icon icon-class="log" class="module-icon" />
              <span>日志管理</span>
            </div>
            <p class="module-desc">全量记录操作与登录行为，支持关键字检索与审计追溯</p>
            <ul class="module-tags">
              <li>操作日志</li>
              <li>登录日志</li>
            </ul>
          </div>
          <div class="module-card">
            <div class="module-head">
              <svg-icon icon-class="dashboard" class="module-icon" />
              <span>工作台首页</span>
            </div>
            <p class="module-desc">欢迎页与功能导航，一键直达各业务模块</p>
            <ul class="module-tags">
              <li>功能导航</li>
              <li>快捷入口</li>
            </ul>
          </div>
          <div class="module-card">
            <div class="module-head">
              <svg-icon icon-class="theme" class="module-icon" />
              <span>体验优化</span>
            </div>
            <p class="module-desc">亮暗主题切换、布局大小调节、多页签与全屏浏览</p>
            <ul class="module-tags">
              <li>暗色模式</li>
              <li>多页签</li>
              <li>屏幕锁定</li>
              <li>全屏显示</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- 架构亮点 -->
      <section class="intro-section">
        <div class="section-head">
          <span class="section-badge">04</span>
          <h2 class="section-title">架构与亮点</h2>
        </div>
        <div class="arch-grid">
          <div class="arch-item">
            <div class="arch-num">1</div>
            <div class="arch-title">前后端分离</div>
            <div class="arch-desc">前端静态资源与后端 API 独立部署，通过接口通信，便于团队并行开发与独立扩展</div>
          </div>
          <div class="arch-item">
            <div class="arch-num">2</div>
            <div class="arch-title">动态权限路由</div>
            <div class="arch-desc">菜单与按钮权限由后端动态下发，前端按权限渲染路由与操作入口，权限变更即时生效</div>
          </div>
          <div class="arch-item">
            <div class="arch-num">3</div>
            <div class="arch-title">数据权限隔离</div>
            <div class="arch-desc">支持全部、自定义、本部门、本部门及以下、仅本人五种数据权限粒度</div>
          </div>
          <div class="arch-item">
            <div class="arch-num">4</div>
            <div class="arch-title">多环境配置</div>
            <div class="arch-desc">开发、测试、生产环境配置分离，一键打包部署，开箱即用</div>
          </div>
        </div>
      </section>
    </div>

    <div class="intro-footer">Copyright © 2026 橙子管理系统 · 橙子科技</div>
  </div>
</template>

<script setup name="OrangeIntro">
// 系统介绍页
</script>

<style scoped>
.intro-page {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: #F5F7FA;
  min-height: calc(100vh - 84px);
}

/* ---------- Hero ---------- */
.hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 55%, #1D4ED8 100%);
  padding: 56px 24px 64px;
  color: #FFFFFF;
  text-align: center;
}

.hero-deco {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  pointer-events: none;
}

.hero-deco-1 {
  width: 380px;
  height: 380px;
  top: -160px;
  left: -100px;
}

.hero-deco-2 {
  width: 260px;
  height: 260px;
  bottom: -120px;
  right: -60px;
  background: rgba(255, 255, 255, 0.06);
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  letter-spacing: 2px;
  opacity: 0.9;
  margin-bottom: 18px;
}

.hero-logo-icon {
  font-size: 18px;
}

.hero-title {
  font-size: 40px;
  font-weight: 700;
  letter-spacing: 6px;
  margin: 0 0 16px;
}

.hero-desc {
  font-size: 16px;
  line-height: 1.9;
  opacity: 0.85;
  margin: 0 0 28px;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.hero-tag {
  padding: 6px 18px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 999px;
  font-size: 13px;
  letter-spacing: 1px;
  backdrop-filter: blur(4px);
  background: rgba(255, 255, 255, 0.12);
}

/* ---------- 正文 ---------- */
.intro-body {
  max-width: 1080px;
  margin: 0 auto;
  padding: 40px 24px 0;
}

.intro-section {
  margin-bottom: 44px;
}

.section-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.section-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: #1D2129;
  margin: 0;
}

.section-text {
  font-size: 14px;
  line-height: 2;
  color: #4E5969;
  margin: 0 0 24px;
}

/* ---------- 特性卡片 ---------- */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.feature-card {
  background: #FFFFFF;
  border: 1px solid #E5E6EB;
  border-radius: 12px;
  padding: 22px 18px;
  transition: box-shadow 0.25s, transform 0.25s;
}

.feature-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-3px);
}

.feature-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #EFF6FF;
  color: #3B82F6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-bottom: 14px;
}

.feature-title {
  font-size: 15px;
  font-weight: 600;
  color: #1D2129;
  margin-bottom: 8px;
}

.feature-desc {
  font-size: 13px;
  line-height: 1.7;
  color: #86909C;
}

/* ---------- 技术栈 ---------- */
.tech-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.tech-col {
  background: #FFFFFF;
  border: 1px solid #E5E6EB;
  border-radius: 12px;
  padding: 22px;
}

.tech-col-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1D2129;
  margin: 0 0 16px;
}

.tech-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.tech-dot.frontend {
  background: #3B82F6;
}

.tech-dot.backend {
  background: #10B981;
}

.tech-dot.data {
  background: #F59E0B;
}

.tech-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tech-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 0;
  border-bottom: 1px dashed #F2F3F5;
}

.tech-list li:last-child {
  border-bottom: none;
}

.tech-name {
  font-size: 14px;
  font-weight: 500;
  color: #1D2129;
}

.tech-desc {
  font-size: 12px;
  color: #86909C;
}

/* ---------- 功能模块 ---------- */
.module-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.module-card {
  background: #FFFFFF;
  border: 1px solid #E5E6EB;
  border-radius: 12px;
  padding: 22px;
  transition: box-shadow 0.25s, transform 0.25s;
}

.module-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-3px);
}

.module-head {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #1D2129;
  margin-bottom: 10px;
}

.module-icon {
  font-size: 20px;
  color: #3B82F6;
}

.module-desc {
  font-size: 13px;
  color: #86909C;
  line-height: 1.7;
  margin: 0 0 14px;
}

.module-tags {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.module-tags li {
  padding: 4px 12px;
  background: #F2F6FC;
  border-radius: 999px;
  font-size: 12px;
  color: #4E5969;
}

/* ---------- 架构亮点 ---------- */
.arch-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.arch-item {
  background: #FFFFFF;
  border: 1px solid #E5E6EB;
  border-radius: 12px;
  padding: 22px;
}

.arch-num {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #EFF6FF;
  color: #3B82F6;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.arch-title {
  font-size: 15px;
  font-weight: 600;
  color: #1D2129;
  margin-bottom: 8px;
}

.arch-desc {
  font-size: 13px;
  line-height: 1.7;
  color: #86909C;
}

/* ---------- 底部 ---------- */
.intro-footer {
  text-align: center;
  padding: 24px 0 32px;
  font-size: 13px;
  color: #A9AEB8;
  border-top: 1px solid #E5E6EB;
  margin-top: 8px;
}

/* ---------- 暗色模式 ---------- */
html.dark .intro-page {
  background: #141414;
}

html.dark .section-title {
  color: #FFFFFF;
}

html.dark .section-text {
  color: rgba(255, 255, 255, 0.65);
}

html.dark .feature-card,
html.dark .tech-col,
html.dark .module-card,
html.dark .arch-item {
  background: #1D1E1F;
  border-color: #3A3A3A;
}

html.dark .feature-title,
html.dark .tech-col-title,
html.dark .module-head,
html.dark .arch-title,
html.dark .tech-name {
  color: #FFFFFF;
}

html.dark .feature-desc,
html.dark .tech-desc,
html.dark .module-desc,
html.dark .arch-desc {
  color: rgba(255, 255, 255, 0.5);
}

html.dark .tech-list li {
  border-bottom-color: #2d2d2d;
}

html.dark .module-tags li {
  background: #2a2a2a;
  color: rgba(255, 255, 255, 0.6);
}

html.dark .intro-footer {
  color: rgba(255, 255, 255, 0.3);
  border-top-color: #2d2d2d;
}

/* ---------- 响应式 ---------- */
@media (max-width: 900px) {
  .feature-grid,
  .tech-grid,
  .module-grid,
  .arch-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .feature-grid,
  .tech-grid,
  .module-grid,
  .arch-grid {
    grid-template-columns: 1fr;
  }

  .hero-title {
    font-size: 28px;
  }
}
</style>
