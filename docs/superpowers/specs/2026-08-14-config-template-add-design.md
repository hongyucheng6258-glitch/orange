# 参数设置「模板化添加」设计文档

## 1. 背景与目标

当前「参数设置」新增参数弹窗全部手工填写：参数名称、参数键名、参数键值、系统内置、备注。
问题：

- 参数键名（如 `sys.account.registerUser`）难以记忆，容易拼写错误导致配置不生效。
- 参数键值格式（如 `true/false`、`0-4`）需要看备注才能理解。
- 每个参数的作用说明分散，录入时没有中文引导。

目标：

- 提供「从模板添加」方式：选择中文参数模板，自动填充名称、键名、备注。
- 按参数类型渲染中文控件（开关、下拉、数字等），用户选择中文含义，保存标准值。
- 每个模板带中文用途说明、影响范围、接入状态。
- 保留「自定义参数」方式，兼容任意参数录入。
- 修改内置参数时锁定参数键名，防止误改导致系统读取失败。

## 2. 非目标（YAGNI）

- 不改数据库结构（`sys_config` 表保持不变）。
- 不新增后端接口（复用现有增删改查、缓存接口）。
- 不做后台可维护的模板库（第一阶段前端静态模板即可）。

## 3. 交互设计

### 3.1 弹窗结构

弹窗顶部新增「添加方式」分段选择（新增时可选）：

- **从模板添加**（默认）
- **自定义参数**

### 3.2 模板模式字段

| 字段 | 交互 | 说明 |
|---|---|---|
| 参数分类 | 下拉框 | 界面设置 / 账号与注册 / 密码安全 / 登录安全 |
| 参数模板 | 可搜索下拉框 | 按分类过滤，展示中文名称；已存在键名的模板标记「已添加」并禁用 |
| 用途说明 | 说明卡片 | 展示用途、影响范围、取值含义、是否已接入代码 |
| 参数名称 | 自动填充、只读 | 来自模板 |
| 参数键名 | 自动填充、只读 | 来自模板 |
| 参数键值 | 按 valueType 渲染控件 | boolean→开关、select→下拉、number→数字框、textarea→多行、password→密码框、text→单行 |
| 系统内置 | 自动填充、禁用 | 来自模板 |
| 备注 | 自动填充、可编辑 | 来自模板，可修改 |

### 3.3 自定义模式

保留现有 5 个字段，并增加键名/键值格式的中文帮助提示。

### 3.4 编辑模式

- 修改内置参数（`configType === 'Y'`）：参数名称、参数键名锁定，只允许修改键值与备注。
- 修改自定义参数：保持原有可编辑能力。

## 4. 参数模板清单（v1）

| 分类 | 键名 | 名称 | 值类型 | 取值 |
|---|---|---|---|---|
| 界面设置 | sys.index.skinName | 默认皮肤样式 | select | skin-blue/skin-green/skin-purple/skin-red/skin-yellow |
| 界面设置 | sys.index.sideTheme | 侧边栏主题 | select | theme-dark/theme-light |
| 账号与注册 | sys.account.registerUser | 是否允许用户注册 | boolean | true/false |
| 账号与注册 | sys.account.captchaEnabled | 验证码开关 | boolean | true/false |
| 账号与注册 | sys.account.defaultRole | 新用户默认角色 | text | 角色键名 |
| 密码安全 | sys.user.initPassword | 账号初始密码 | password | 字符串 |
| 密码安全 | sys.account.initPasswordModify | 初始密码修改提醒 | select | 0 关闭 / 1 提醒 |
| 密码安全 | sys.account.passwordValidateDays | 密码更新周期(天) | number | 0-365 |
| 密码安全 | sys.account.chrtype | 密码字符范围 | select | 0 任意 / 1 数字 / 2 字母 / 3 字母数字 / 4 字母数字特殊字符 |
| 登录安全 | sys.login.blackIPList | 登录 IP 黑名单 | textarea | 分号分隔，支持 * 和网段 |

所有模板均对应当前系统已接入的参数键名，修改后由相应业务代码读取并生效（见 §5）。

## 5. 后端接入对照

| 键名 | 消费位置 |
|---|---|
| sys.account.captchaEnabled | SysLoginService、SysRegisterService、CaptchaController |
| sys.account.registerUser | SysRegisterController |
| sys.account.defaultRole | SysRegisterService |
| sys.login.blackIPList | SysLoginService |
| sys.account.chrtype | SysLoginController |
| sys.account.initPasswordModify | SysLoginController |
| sys.account.passwordValidateDays | SysLoginController |
| sys.user.initPassword | SysUserServiceImpl |

## 6. 前端结构

- 新增 `src/views/system/config/configTemplates.js`：模板清单与分类定义。
- 修改 `src/views/system/config/index.vue`：
  - 弹窗新增「添加方式」分段控制。
  - 模板模式表单 + 说明卡片 + 动态值控件。
  - 自定义模式表单 + 帮助提示。
  - 编辑内置参数时锁定名称与键名。
  - 模板选择时禁用已存在键名，防重复添加。

## 7. 校验与兜底

- 模板模式：键值必填；键名/名称只读无需校验。
- 自定义模式：沿用现有 rules。
- 后端 `checkConfigKeyUnique` 唯一性校验继续兜底。
- 提交数据结构不变：`configName / configKey / configValue / configType / remark`。

## 8. 验收标准

1. 新增参数默认进入模板模式，可切换自定义模式。
2. 按分类筛选模板，支持中文搜索。
3. 选择模板后名称、键名、备注自动填充，键名只读。
4. 键值按类型渲染中文控件，保存为标准值。
5. 说明卡片展示用途、影响范围、取值含义、接入状态。
6. 已存在键名的模板禁用并标记「已添加」。
7. 自定义模式保持原新增能力。
8. 修改内置参数时名称、键名锁定。
9. 数据库结构不变，后端逻辑不变。
10. 生产构建通过，浏览器实测交互正常。
