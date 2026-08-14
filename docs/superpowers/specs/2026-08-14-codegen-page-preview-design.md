# 代码生成「页面预览」（交互式 + 模拟数据）设计文档

- 日期：2026-08-14
- 状态：已确认，进入实现
- 涉及模块：前端 `views/tool/gen`、代码生成元数据（复用现有接口）

## 1. 背景与目标

现有代码生成模块的「预览」仅展示 Velocity 渲染后的**源码**（Java / XML / Vue / SQL），
用户无法直观判断生成出来的页面长什么样。

目标：在预览弹窗中新增**交互式页面预览**，根据表和字段元数据渲染仿真页面，
支持列表查询、新增 / 编辑表单、详情抽屉等交互，全部基于本地模拟数据，
不执行生成的源码、不调用生成业务的真实接口。

## 2. 设计原则

- **元数据驱动**：仅依赖 `getGenTable(tableId)` 已返回的 `info` + `rows`（GenTable + GenTableColumn），
  后端零改动。
- **安全**：不执行任何生成的代码；无 XSS、无任意代码执行路径。
- **还原度**：使用与生成模板相同的 Element Plus 组件（el-form / el-table / el-dialog /
  dict-tag / image-preview / editor），布局规则与 Velocity 模板一致。
- **可交互**：搜索、重置、分页、新增、编辑、删除、详情均为可操作状态，作用于本地模拟数据。

## 3. 元数据来源

| 数据 | 来源 | 用途 |
|---|---|---|
| `tplCategory` | GenTable | 单表 / tree / sub 模板标识 |
| `tplWebType` | GenTable | element-plus / typescript 标识（预览不影响） |
| `formColNum` | GenTable | 表单弹窗列数（1→500px / 2→800px / 3→1100px） |
| `functionName` / `businessName` | GenTable | 弹窗标题、权限前缀展示 |
| `isView` | GenTable | 是否渲染详情抽屉 |
| `isQuery` / `queryType` | GenTableColumn | 查询区字段与查询方式（EQ / LIKE / BETWEEN / GT / LT） |
| `isList` | GenTableColumn | 表格列 |
| `isInsert` / `isEdit` / `isRequired` | GenTableColumn | 表单字段、必填校验 |
| `htmlType` | GenTableColumn | input / textarea / select / radio / checkbox / datetime / imageUpload / fileUpload / editor |
| `dictType` | GenTableColumn | 字典控件，通过 `useDict` 拉取真实字典 |
| `javaType` | GenTableColumn | 模拟数据生成（String / Integer / Long / BigDecimal / Date 等） |
| `pk` / `isIncrement` | GenTableColumn | 主键列在编辑时禁用，列表序号展示 |

## 4. 组件结构

新增 `src/views/tool/gen/pagePreview.vue`：

```
pagePreview.vue
├─ props: info (GenTable) + rows (GenTableColumn[])
├─ 顶部工具条
│   ├─ 模板类型徽标（单表 / 树表 / 主子表）
│   ├─ 设备切换：PC / 手机（手机宽度 375px 模拟）
│   └─ 视图切换 tabs：列表 / 新增 / 编辑 / 详情
├─ 列表视图
│   ├─ 查询区：isQuery 字段 → input / select / radio / datetime（BETWEEN 渲染 daterange）
│   ├─ 工具栏：新增 / 修改 / 删除 / 导出（权限前缀 `businessName:xxx` 展示）
│   ├─ el-table：isList 列
│   │   ├─ 字典列 → dict-tag 渲染
│   │   ├─ 图片列 → image-preview 渲染模拟图
│   │   ├─ 日期列 → parseTime 格式化
│   │   └─ 操作列 → 详情(若 isView)/修改/删除
│   └─ 分页条（模拟，可翻页）
├─ 新增/编辑表单弹窗
│   ├─ 宽度按 formColNum 映射 500 / 800 / 1100（响应式 min(原宽, 100vw-24px)）
│   ├─ 控件映射 htmlType（editor 用占位只读区）
│   ├─ isRequired 红星 + 提交时本地校验
│   └─ 提交模拟插入/更新列表行
└─ 详情抽屉（isView=true）：字段只读展示
```

## 5. 模拟数据规则

| javaType | 生成值 |
|---|---|
| String | `${列注释}示例1`（如「用户名称示例1」） |
| Integer / Long | 主键自增 1..N，普通数字 1 / 2 / 3 |
| BigDecimal | 88.50 / 199.00 |
| Date / datetime | 当前日期按 `YYYY-MM-DD` / `YYYY-MM-DD HH:mm:ss` 格式 |
| 字典列 | 取字典第一项 `value`（列表展示对应 label） |
| imageUpload 列 | 占位 SVG data URI，image-preview 可预览 |

- 默认生成 4 行模拟数据。
- 搜索 = 本地过滤（LIKE 用 includes，EQ 用相等，BETWEEN 用日期范围比较）。
- 新增行 id 取当前最大 + 1；删除按行移除。

## 6. 交互清单

| 交互 | 行为 |
|---|---|
| 搜索 | 按查询条件本地过滤列表，回到第 1 页 |
| 重置 | 清空查询条件并恢复全量数据 |
| 分页 | 本地分页，每页 10 条 |
| 新增 | 打开空表单弹窗（isInsert 字段），校验通过后插入列表首行 |
| 修改 | 打开表单弹窗回填当前行（isEdit 字段，主键禁用），保存更新行 |
| 删除 | 模拟删除（不弹确认框，直接移除 + 提示） |
| 详情 | isView=true 时打开抽屉，只读展示所有 isList 字段 |
| 设备切换 | 容器宽度 100% ↔ 375px 居中，模拟移动端 |
| 视图切换 | 列表 / 新增 / 编辑 / 详情 四视图共用字段配置 |

## 7. 安全边界

- 纯前端元数据渲染，不执行生成的 Vue / JS 源码。
- 不调用生成业务的任何真实接口。
- 字典通过现有 `useDict` 读取系统字典，只读。
- 富文本 editor 在预览中渲染为只读占位，不注入 HTML。

## 8. 改动清单

| 文件 | 改动 |
|---|---|
| `frontend/orange-admin/src/views/tool/gen/pagePreview.vue` | 新增，核心预览组件 |
| `frontend/orange-admin/src/views/tool/gen/index.vue` | 预览弹窗升级：tabs 顶部「页面预览」+ 源码文件列表；操作列预览按钮文案改为「页面预览」 |
| 后端 | 无改动 |
| API | 无新增（复用 `getGenTable`） |

## 9. 验收标准

1. 打开代码生成列表 → 点「页面预览」→ 弹窗默认显示页面预览，可切换列表 / 新增 / 编辑 / 详情。
2. 查询区字段数量与 `isQuery` 配置一致，字典下拉显示真实字典。
3. 表格列与 `isList` 配置一致，字典列显示标签而非值。
4. 新增 / 编辑弹窗宽度随 `formColNum` 变化，必填项提交有校验提示。
5. 搜索 / 重置 / 分页 / 新增 / 修改 / 删除均为本地可交互。
6. 手机模式宽度 375px，无横向溢出。
7. 不调用任何生成业务接口；后端无改动。
8. 前端生产构建通过。
