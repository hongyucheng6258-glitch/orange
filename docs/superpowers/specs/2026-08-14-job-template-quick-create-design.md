# 定时任务「快捷创建」设计文档

## 1. 背景与目标

当前「定时任务」新增任务弹窗要求用户手工填写：

- 调用方法：必须记住 `orangeTask.orangeNoParams` 这类 Bean 调用格式或完整类名，易拼错。
- Cron 表达式：`0/10 * * * * ?` 类 Quartz 语法对普通用户不友好。

目标：

- 提供「快捷创建」模式：选择中文任务模板 + 中文执行周期，自动生成调用目标和 Cron。
- 保留「高级自定义」模式：兼容现有手工输入，不影响老用户。
- 后端显式注册可调度任务方法，不允许任意 Bean 方法被调度（安全边界）。
- 不修改 `sys_job` 表结构，提交字段与后端完全兼容。

## 2. 非目标（YAGNI）

- 不做 Spring Bean 自动扫描（会暴露危险方法）。
- 不做可视化流程图式编排。
- 不修改 Quartz 调度内核与现有白名单校验。

## 3. 交互设计

### 3.1 弹窗顶部「添加方式」

新增弹窗顶部提供分段选择（仅新增时显示）：

- **快捷创建**（默认）
- **高级自定义**

编辑任务时始终使用「高级自定义」布局（编辑场景已有真实数据）。

### 3.2 快捷创建字段

| 字段 | 控件 | 说明 |
|---|---|---|
| 任务分类 | 下拉框 | 系统任务 / 数据维护 / 消息通知 |
| 任务模板 | 可搜索下拉框 | 展示中文名称；显示「说明」标签 |
| 用途说明 | 说明卡片 | 作用、参数、风险等级 |
| 任务名称 | 自动填充可修改 | 默认取模板名称 |
| 任务分组 | 下拉框 | 沿用 `sys_job_group` 字典 |
| 方法参数 | 动态控件 | 按参数类型渲染输入框/开关/数字框 |
| 最终调用目标 | 只读展示 | 自动拼接，如 `orangeTask.orangeParams('xx')` |
| 执行周期 | 下拉框 | 每隔N分钟/每小时/每天/每周/每月/仅工作日/自定义 |
| 周期参数 | 动态控件 | 分钟/时/分/星期/日期等 |
| Cron 表达式 | 只读展示 + 中文摘要 | 自动生成，展示下次执行时间 |
| 执行策略 | 中文下拉 | 立即执行/执行一次/放弃执行（带说明） |
| 是否并发 | 开关 | 禁止并发（推荐）/允许并发 |
| 初始状态 | 开关 | 默认暂停，先手动执行验证 |

### 3.3 快捷创建默认值

```text
执行策略：放弃执行（3）
禁止并发：是（1）
初始状态：暂停（1）
```

创建后先「执行一次」验证，再手动启用，降低误操作风险。

## 4. 后端设计

### 4.1 任务模板模型（JobTemplate）

```java
public class JobTemplate {
    private String category;      // 分类 system/maintenance/message
    private String name;          // 中文名称
    private String beanName;      // Spring Bean 名
    private String methodName;    // 方法名
    private String description;   // 用途说明
    private String riskLevel;     // low/medium/high
    private List<TemplateParam> parameters; // 参数定义
}

public class TemplateParam {
    private String name;       // 参数名
    private String label;      // 中文标签
    private String type;       // string/boolean/int/long/double
    private String defaultValue;
}
```

### 4.2 模板注册表（JobTemplateRegistry）

静态注册表 + `getInvokeTarget(bean, method, values)` 拼接逻辑：

| type | 控件 | 生成 |
|---|---|---|
| string | 文本框 | `'orange'` |
| boolean | 开关 | `true` |
| int | 数字框 | `100` |
| long | 数字框 | `2000L` |
| double | 小数框 | `316.50D` |

### 4.3 新接口

```text
GET /monitor/job/templates
权限：monitor:job:add
```

返回模板清单（分组）。

### 4.4 安全边界

- 模板清单在 `JobTemplateRegistry` 中显式注册，只有注册过的方法可被快捷模式选中。
- 提交时后端沿用现有校验链：Cron 合法性、RMI/LDAP/HTTP 黑名单、`ScheduleUtils.whiteList` 白名单。
- 新增校验：若任务来源标记为快捷模式，则 invokeTarget 必须匹配注册表中某模板生成的字符串；高级自定义模式不强制（仍走白名单）。
- 不扫描 Bean、不反射调用任意方法。

## 5. 前端设计

### 5.1 文件

- 修改 `src/views/monitor/job/index.vue`：弹窗双模式、动态参数、周期向导、Cron 摘要。
- 新增 `src/api/modules/monitor/job.js` 中 `listJobTemplates()`。
- 新增 `src/views/monitor/job/jobCronBuilder.js`：周期 → Cron 生成 + 中文摘要。

### 5.2 周期向导

| 选项 | 参数 | 生成示例 | 摘要 |
|---|---|---|---|
| 每隔N分钟 | 间隔分钟 | `0 0/N * * * ?` | 每隔 N 分钟执行一次 |
| 每小时 | 分钟(0-59) | `0 M * * * ?` | 每小时的第 M 分执行 |
| 每天 | 时、分 | `0 M H * * ?` | 每天 H:M 执行 |
| 每周 | 星期、时、分 | `0 M H ? * W` | 每周 W 的 H:M 执行 |
| 每月 | 日、时、分 | `0 M H D * ?` | 每月 D 日 H:M 执行 |
| 仅工作日 | 时、分 | `0 M H ? * MON-FRI` | 工作日 H:M 执行 |
| 自定义 Cron | 表达式 | 用户输入 | 复用现有 Crontab 组件 |

Cron 摘要用 `CronUtils.getNextExecution` 的下次执行时间展示在页面（前端调任务详情已有此能力，快捷模式可复用列表页 `nextValidTime` 逻辑展示）。

## 6. 验收标准

1. 新增任务默认进入快捷创建，可切换高级自定义。
2. 快捷创建按分类筛选模板，支持中文搜索。
3. 选择模板后自动填充任务名称、显示用途说明。
4. 按参数类型渲染中文控件，最终调用目标自动拼接只读展示。
5. 选择执行周期后自动生成 Cron，并展示中文摘要与下次执行时间。
6. 执行策略、并发、初始状态带中文说明。
7. 高级自定义模式保留现有全部字段与生成器入口。
8. 后端模板接口需 `monitor:job:add` 权限。
9. `sys_job` 表结构不变，提交字段兼容。
10. 生产构建通过，浏览器实测新增任务全流程成功。

## 7. 改动文件清单

后端：

- 新增 `quartz/domain/JobTemplate.java`、`quartz/domain/TemplateParam.java`
- 新增 `quartz/service/JobTemplateRegistry.java`（或 `util/`）
- 修改 `quartz/controller/SysJobController.java`：新增 `/templates` 接口

前端：

- 修改 `src/views/monitor/job/index.vue`
- 修改 `src/api/modules/monitor/job.js`
- 新增 `src/views/monitor/job/jobCronBuilder.js`
