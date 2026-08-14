<template>
  <div class="home">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="welcome-content">
        <h1>欢迎使用橙子管理系统</h1>
        <p class="welcome-desc">高效、稳定、易用的企业级后台管理解决方案</p>
      </div>
      <div class="welcome-meta">
        <span class="version-tag">v1.0.0</span>
      </div>
    </div>

    <!-- 功能模块卡片 -->
    <div class="section">
      <h2 class="section-title">功能模块</h2>
      <el-row :gutter="20">
        <el-col :xs="12" :sm="12" :md="8" :lg="6" v-for="(item, index) in modules" :key="index" class="card-col">
          <el-card shadow="hover" class="module-card" @click="goTarget(item.path)">
            <div class="card-icon">
              <svg-icon :icon-class="item.icon" class="icon-svg" />
            </div>
            <div class="card-info">
              <h3>{{ item.title }}</h3>
              <p>{{ item.desc }}</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 系统介绍 -->
    <div class="section">
      <h2 class="section-title">系统介绍</h2>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" v-for="(item, index) in features" :key="index">
          <el-card shadow="hover" class="feature-card">
            <div class="feature-icon">
              <svg-icon :icon-class="item.icon" class="feature-svg" />
            </div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 底部信息 -->
    <div class="footer-info">
      <p>橙子管理系统 v1.0.0 | Copyright © 2026 橙子科技. All Rights Reserved.</p>
    </div>
  </div>
</template>

<script setup name="Index">
import { useRouter } from 'vue-router'

const router = useRouter()

const modules = [
  { icon: 'user', title: '用户管理', desc: '管理用户账号与权限分配', path: '/system/user' },
  { icon: 'tree', title: '部门管理', desc: '组织架构与部门层级管理', path: '/system/dept' },
  { icon: 'peoples', title: '角色管理', desc: '角色权限与菜单分配', path: '/system/role' },
  { icon: 'system', title: '菜单管理', desc: '系统菜单与按钮权限配置', path: '/system/menu' },
  { icon: 'post', title: '岗位管理', desc: '岗位设置与人员编制管理', path: '/system/post' },
  { icon: 'dict', title: '字典管理', desc: '数据字典与枚举值维护', path: '/system/dict' },
  { icon: 'log', title: '操作日志', desc: '用户操作记录与审计追踪', path: '/system/log/operlog' },
  { icon: 'monitor', title: '系统监控', desc: '服务器状态与在线用户监控', path: '/monitor/server' }
]

const features = [
  { icon: 'dashboard', title: '全面仪表盘', desc: '直观的数据统计和可视化分析，让您快速掌握系统运行状态。' },
  { icon: 'lock', title: '安全可靠', desc: '基于 RBAC 的权限控制体系，支持多级权限和细粒度授权。' },
  { icon: 'code', title: '易于扩展', desc: '模块化架构设计，支持快速开发和功能扩展，降低维护成本。' }
]

function goTarget(path) {
  if (path) {
    router.push(path)
  }
}
</script>

<style scoped lang="scss">
.home {
  padding: 20px;

  .welcome-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--card-bg, #ffffff);
    border: 1px solid var(--card-border, #e5e6eb);
    border-radius: 12px;
    padding: 32px;
    margin-bottom: 24px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);

    .welcome-content {
      h1 {
        font-size: 22px;
        font-weight: 600;
        color: var(--el-text-color-primary, #1d2129);
        margin: 0 0 8px;
      }

      .welcome-desc {
        font-size: 14px;
        color: var(--el-text-color-secondary, #86909c);
        margin: 0;
      }
    }

    .welcome-meta {
      .version-tag {
        display: inline-block;
        padding: 4px 12px;
        font-size: 12px;
        color: var(--el-color-primary, #3b82f6);
        background: var(--primary-soft, #dbeafe);
        border-radius: 20px;
      }
    }
  }

  .section {
    margin-bottom: 24px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary, #1d2129);
      margin: 0 0 16px;
      padding-left: 12px;
      border-left: 3px solid var(--el-color-primary, #3b82f6);
    }
  }

  .card-col {
    margin-bottom: 16px;
  }

  .module-card {
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    border: 1px solid var(--card-border, #e5e6eb);
    border-radius: 10px;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    :deep(.el-card__body) {
      display: flex;
      align-items: center;
      padding: 20px;
    }

    .card-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: var(--primary-soft, #dbeafe);

      .icon-svg {
        font-size: 22px;
        color: var(--el-color-primary, #3b82f6);
      }
    }

    .card-info {
      margin-left: 14px;
      flex: 1;
      min-width: 0;

      h3 {
        font-size: 15px;
        font-weight: 600;
        color: var(--el-text-color-primary, #1d2129);
        margin: 0 0 4px;
      }

      p {
        font-size: 12px;
        color: var(--el-text-color-secondary, #86909c);
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .feature-card {
    margin-bottom: 16px;
    border: 1px solid var(--card-border, #e5e6eb);
    border-radius: 10px;
    text-align: center;
    padding: 12px;

    :deep(.el-card__body) {
      padding: 28px 20px;
    }

    .feature-icon {
      margin-bottom: 16px;

      .feature-svg {
        font-size: 36px;
        color: var(--el-text-color-secondary, #86909c);
        transition: color 0.2s;
      }
    }

    &:hover {
      .feature-svg {
        color: var(--el-color-primary, #3b82f6);
      }
    }

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary, #1d2129);
      margin: 0 0 8px;
    }

    p {
      font-size: 13px;
      color: var(--el-text-color-secondary, #86909c);
      line-height: 1.6;
      margin: 0;
    }
  }

  .footer-info {
    text-align: center;
    padding: 20px 0 10px;
    border-top: 1px solid var(--el-border-color-lighter, #f0f1f3);

    p {
      font-size: 12px;
      color: var(--el-text-color-placeholder, #a9aeb8);
      margin: 0;
    }
  }
}
</style>
