# 表单构建直接预览实施计划

日期：2026-08-14

## 目标

将表单构建的“预览页面”改为直接渲染当前 `drawingList` 对应的 Vue 表单，完整保留组件类型、顺序、栅格、默认值、选项和校验；完全移除表单构建中的 CRUD 业务页预览及其专属配置。

## 文件

- 新增 `src/views/tool/build/formPreview.js`：创建与设计器隔离的预览字段副本。
- 新增 `src/views/tool/build/FormPreview.vue`：递归渲染运行态表单并提供提交、重置。
- 修改 `src/views/tool/build/index.vue`：预览弹窗接入直接表单预览，移除 CRUD 模型转换。
- 修改 `src/views/tool/build/RightPanel.vue`：移除页面用途和业务页面配置。
- 修改 `src/utils/generator/config.js`：移除 CRUD 预览专属表单配置。
- 删除 `src/utils/generator/pageModel.js`：移除不再使用的转换模块。
- 更新 `docs/superpowers/specs/2026-08-14-form-build-page-preview-design.md`：纠正最终设计语义。

## 验证

1. 先运行 `node --test src/views/tool/build/formPreview.test.js`，确认缺少实现时失败。
2. 实现预览字段副本与运行态表单。
3. 再次运行测试，确认通过。
4. 运行 `npm run build:prod`，确认生产构建成功。
5. 在浏览器中选择与截图图三一致的组件，确认预览结果为图二式表单而非 CRUD 列表。
