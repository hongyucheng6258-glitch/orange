/**
 * 参数配置「模板清单」
 *
 * 用途：参数设置新增弹窗的「从模板添加」模式数据源。
 * 选择模板后自动填充参数名称、键名、备注，并按 valueType 渲染中文值控件。
 * 提交数据结构与后端 sys_config 保持一致，无需改动数据库和后端接口。
 *
 * valueType 说明：
 * - boolean  : 开关（开启/关闭），保存 true/false
 * - select   : 下拉单选，保存 options 中的 value
 * - number   : 数字输入
 * - text     : 单行文本
 * - textarea : 多行文本
 * - password : 密码输入
 *
 * status 说明：
 * - 已接入：业务代码真实读取该键名，修改后立即生效。
 * - 待接入：模板已提供，供业务扩展，修改后暂不影响系统行为。
 */

export const configCategories = [
  { value: "ui", label: "界面设置" },
  { value: "account", label: "账号与注册" },
  { value: "password", label: "密码安全" },
  { value: "login", label: "登录安全" }
]

export const configTemplates = [
  {
    category: "ui",
    name: "主框架页-默认皮肤样式",
    key: "sys.index.skinName",
    valueType: "select",
    defaultValue: "skin-blue",
    systemBuiltIn: "Y",
    description: "主框架页顶栏与侧边栏的默认配色方案。",
    effectiveScope: "全局界面",
    status: "已接入",
    options: [
      { label: "蓝色 skin-blue", value: "skin-blue" },
      { label: "绿色 skin-green", value: "skin-green" },
      { label: "紫色 skin-purple", value: "skin-purple" },
      { label: "红色 skin-red", value: "skin-red" },
      { label: "黄色 skin-yellow", value: "skin-yellow" }
    ],
    remark: "蓝色 skin-blue、绿色 skin-green、紫色 skin-purple、红色 skin-red、黄色 skin-yellow"
  },
  {
    category: "ui",
    name: "主框架页-侧边栏主题",
    key: "sys.index.sideTheme",
    valueType: "select",
    defaultValue: "theme-dark",
    systemBuiltIn: "Y",
    description: "侧边栏深色或浅色主题，与皮肤样式独立配置。",
    effectiveScope: "全局界面",
    status: "已接入",
    options: [
      { label: "深色主题", value: "theme-dark" },
      { label: "浅色主题", value: "theme-light" }
    ],
    remark: "深色主题 theme-dark，浅色主题 theme-light"
  },
  {
    category: "account",
    name: "是否允许用户注册",
    key: "sys.account.registerUser",
    valueType: "boolean",
    defaultValue: "false",
    systemBuiltIn: "Y",
    description: "控制登录页是否展示注册入口，并控制注册接口是否接受请求。",
    effectiveScope: "登录页、注册接口",
    status: "已接入",
    remark: "true 开启注册功能，false 关闭注册功能"
  },
  {
    category: "account",
    name: "账号自助-验证码开关",
    key: "sys.account.captchaEnabled",
    valueType: "boolean",
    defaultValue: "true",
    systemBuiltIn: "Y",
    description: "控制登录、注册时是否校验图形验证码。",
    effectiveScope: "登录、注册",
    status: "已接入",
    remark: "true 开启验证码功能，false 关闭验证码功能"
  },
  {
    category: "account",
    name: "新用户默认角色",
    key: "sys.account.defaultRole",
    valueType: "text",
    defaultValue: "common",
    systemBuiltIn: "Y",
    description: "自助注册成功后赋予新用户的默认角色键名（role_key）。",
    effectiveScope: "注册接口",
    status: "已接入",
    remark: "填写角色管理中的角色键名，如 common"
  },
  {
    category: "password",
    name: "用户管理-账号初始密码",
    key: "sys.user.initPassword",
    valueType: "password",
    defaultValue: "123456",
    systemBuiltIn: "Y",
    description: "新增用户时使用的初始密码，用户首次登录后可修改。",
    effectiveScope: "用户管理-新增用户",
    status: "已接入",
    remark: "初始化密码 123456"
  },
  {
    category: "password",
    name: "用户管理-初始密码修改策略",
    key: "sys.account.initPasswordModify",
    valueType: "select",
    defaultValue: "1",
    systemBuiltIn: "Y",
    description: "用户仍在使用初始密码登录时，是否弹出修改密码提醒。",
    effectiveScope: "登录流程",
    status: "已接入",
    options: [
      { label: "关闭（不提示）", value: "0" },
      { label: "提醒修改密码", value: "1" }
    ],
    remark: "0：关闭提醒；1：登录时提醒修改初始密码"
  },
  {
    category: "password",
    name: "用户管理-账号密码更新周期",
    key: "sys.account.passwordValidateDays",
    valueType: "number",
    defaultValue: "0",
    min: 0,
    max: 365,
    systemBuiltIn: "Y",
    description: "密码有效期天数，超过周期后登录时提醒修改密码。0 表示不限制。",
    effectiveScope: "登录流程",
    status: "已接入",
    remark: "0 表示不限制，修改必须为 1~365 之间的正整数"
  },
  {
    category: "password",
    name: "用户管理-密码字符范围",
    key: "sys.account.chrtype",
    valueType: "select",
    defaultValue: "0",
    systemBuiltIn: "Y",
    description: "设置密码允许使用的字符范围，用于登录页密码校验规则。",
    effectiveScope: "登录、注册、修改密码",
    status: "已接入",
    options: [
      { label: "任意字符", value: "0" },
      { label: "纯数字", value: "1" },
      { label: "纯英文字母", value: "2" },
      { label: "字母和数字", value: "3" },
      { label: "字母数字和特殊字符", value: "4" }
    ],
    remark: "0 任意、1 数字、2 英文字母、3 字母和数字、4 字母数字和特殊字符"
  },
  {
    category: "login",
    name: "用户登录-黑名单列表",
    key: "sys.login.blackIPList",
    valueType: "textarea",
    defaultValue: "",
    systemBuiltIn: "Y",
    description: "限制登录的 IP 黑名单，多个匹配项以分号分隔，支持 * 通配和网段匹配。",
    effectiveScope: "登录接口",
    status: "已接入",
    remark: "示例：192.168.1.*;10.0.0.1，多个匹配项以 ; 分隔"
  }
]

/** 按分类获取模板 */
export function getTemplatesByCategory(category) {
  return configTemplates.filter(t => t.category === category)
}

/** 按键名查找模板 */
export function findTemplateByKey(key) {
  return configTemplates.find(t => t.key === key)
}
