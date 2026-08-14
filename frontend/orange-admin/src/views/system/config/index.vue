<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
         <el-form-item label="参数名称" prop="configName">
            <el-input
               v-model="queryParams.configName"
               placeholder="请输入参数名称"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="参数键名" prop="configKey">
            <el-input
               v-model="queryParams.configKey"
               placeholder="请输入参数键名"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="系统内置" prop="configType">
            <el-select v-model="queryParams.configType" placeholder="系统内置" clearable style="width: 240px">
               <el-option
                  v-for="dict in sys_yes_no"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item label="创建时间" style="width: 308px;">
            <el-date-picker
               v-model="dateRange"
               value-format="YYYY-MM-DD"
               type="daterange"
               range-separator="-"
               start-placeholder="开始日期"
               end-placeholder="结束日期"
            ></el-date-picker>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="primary"
               plain
               icon="Plus"
               @click="handleAdd"
               v-hasPermi="['system:config:add']"
            >新增</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['system:config:edit']"
            >修改</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['system:config:remove']"
            >删除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['system:config:export']"
            >导出</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Refresh"
               @click="handleRefreshCache"
               v-hasPermi="['system:config:remove']"
            >刷新缓存</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="configList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="参数主键" align="center" prop="configId" />
         <el-table-column label="参数名称" align="center" prop="configName" :show-overflow-tooltip="true" />
         <el-table-column label="参数键名" align="center" prop="configKey" :show-overflow-tooltip="true" />
         <el-table-column label="参数键值" align="center" prop="configValue" :show-overflow-tooltip="true" />
         <el-table-column label="系统内置" align="center" prop="configType">
            <template #default="scope">
               <dict-tag :options="sys_yes_no" :value="scope.row.configType" />
            </template>
         </el-table-column>
         <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
         <el-table-column label="创建时间" align="center" prop="createTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:config:edit']" >修改</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:config:remove']">删除</el-button>
            </template>
         </el-table-column>
      </el-table>

      <pagination
         v-show="total > 0"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
      />

      <!-- 添加或修改参数配置对话框 -->
      <el-dialog :title="title" v-model="open" width="min(640px, calc(100vw - 24px))" append-to-body>
         <div v-if="!form.configId" class="add-mode-bar">
            <span class="add-mode-label">添加方式：</span>
            <el-radio-group v-model="addMode">
               <el-radio-button value="template">从模板添加</el-radio-button>
               <el-radio-button value="custom">自定义参数</el-radio-button>
            </el-radio-group>
         </div>

         <el-form ref="configRef" :model="form" :rules="rules" label-width="90px">
            <!-- 模板模式（仅新增时显示） -->
            <template v-if="addMode === 'template' && !form.configId">
               <el-form-item label="参数分类">
                  <el-select v-model="templateCategory" placeholder="请选择参数分类" style="width: 100%" @change="handleCategoryChange">
                     <el-option v-for="c in configCategories" :key="c.value" :label="c.label" :value="c.value" />
                  </el-select>
               </el-form-item>
               <el-form-item label="参数模板">
                  <el-select v-model="templateKey" placeholder="请选择参数模板" filterable style="width: 100%" @change="handleTemplateSelect">
                     <el-option v-for="t in filteredTemplates" :key="t.key" :label="t.name" :value="t.key" :disabled="isTemplateExists(t.key)">
                        <span>{{ t.name }}</span>
                        <el-tag v-if="isTemplateExists(t.key)" type="warning" size="small" class="tpl-tag">已添加</el-tag>
                        <el-tag v-else-if="t.status === '待接入'" type="info" size="small" class="tpl-tag">待接入</el-tag>
                     </el-option>
                  </el-select>
               </el-form-item>
               <el-form-item v-if="selectedTemplate" label="用途说明">
                  <div class="tpl-desc">
                     <div class="tpl-desc-text">{{ selectedTemplate.description }}</div>
                     <div class="tpl-desc-meta">
                        <el-tag :type="selectedTemplate.status === '已接入' ? 'success' : 'info'" size="small">{{ selectedTemplate.status }}</el-tag>
                        <span>影响范围：{{ selectedTemplate.effectiveScope }}</span>
                     </div>
                  </div>
               </el-form-item>
               <el-form-item label="参数名称" prop="configName">
                  <el-input v-model="form.configName" readonly />
               </el-form-item>
               <el-form-item label="参数键名" prop="configKey">
                  <el-input v-model="form.configKey" readonly />
               </el-form-item>
               <el-form-item label="参数键值" prop="configValue">
                  <el-switch
                     v-if="selectedTemplate && selectedTemplate.valueType === 'boolean'"
                     v-model="form.configValue"
                     active-value="true"
                     inactive-value="false"
                     active-text="开启"
                     inactive-text="关闭"
                  />
                  <el-select v-else-if="selectedTemplate && selectedTemplate.valueType === 'select'" v-model="form.configValue" style="width: 100%">
                     <el-option v-for="o in selectedTemplate.options" :key="o.value" :label="o.label" :value="o.value" />
                  </el-select>
                  <el-input-number
                     v-else-if="selectedTemplate && selectedTemplate.valueType === 'number'"
                     v-model="form.configValue"
                     :min="selectedTemplate.min || 0"
                     :max="selectedTemplate.max || 99999"
                     controls-position="right"
                  />
                  <el-input
                     v-else-if="selectedTemplate && selectedTemplate.valueType === 'password'"
                     v-model="form.configValue"
                     type="password"
                     show-password
                     placeholder="请输入参数键值"
                  />
                  <el-input
                     v-else-if="selectedTemplate && selectedTemplate.valueType === 'textarea'"
                     v-model="form.configValue"
                     type="textarea"
                     :rows="3"
                     placeholder="请输入参数键值"
                  />
                  <el-input v-else v-model="form.configValue" placeholder="请输入参数键值" />
               </el-form-item>
               <el-form-item label="系统内置">
                  <el-radio-group v-model="form.configType" disabled>
                     <el-radio value="Y">是</el-radio>
                     <el-radio value="N">否</el-radio>
                  </el-radio-group>
               </el-form-item>
               <el-form-item label="备注" prop="remark">
                  <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入内容" />
               </el-form-item>
            </template>

            <!-- 自定义模式 / 编辑模式 -->
            <template v-else>
               <el-alert
                  v-if="editTemplate"
                  type="info"
                  :closable="false"
                  show-icon
                  class="tpl-edit-alert"
                  :title="editTemplate.description"
               />
               <el-form-item label="参数名称" prop="configName">
                  <el-input v-model="form.configName" placeholder="请输入参数名称" :readonly="lockKeyName" />
               </el-form-item>
               <el-form-item label="参数键名" prop="configKey">
                  <el-input v-model="form.configKey" placeholder="请输入参数键名" :readonly="lockKeyName">
                     <template v-if="lockKeyName" #append>内置参数</template>
                  </el-input>
               </el-form-item>
               <el-form-item label="参数键值" prop="configValue">
                  <el-input v-model="form.configValue" type="textarea" :rows="3" placeholder="请输入参数键值" />
               </el-form-item>
               <el-form-item label="系统内置" prop="configType">
                  <el-radio-group v-model="form.configType">
                     <el-radio
                        v-for="dict in sys_yes_no"
                        :key="dict.value"
                        :value="dict.value"
                     >{{ dict.label }}</el-radio>
                  </el-radio-group>
               </el-form-item>
               <el-form-item label="备注" prop="remark">
                  <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
               </el-form-item>
               <el-alert
                  v-if="!form.configId"
                  type="info"
                  :closable="false"
                  show-icon
                  title="参数键名建议使用「模块.功能.属性」格式，例如 game.item.defaultStatus；键值为程序实际读取的值，最长 500 字符。"
               />
            </template>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" :loading="submitting" @click="submitForm">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="Config">
import { listConfig, getConfig, delConfig, addConfig, updateConfig, refreshCache } from "@/api/modules/system/config"
import { configCategories, configTemplates, findTemplateByKey } from "./configTemplates"

const { proxy } = getCurrentInstance()
const { sys_yes_no } = useDict("sys_yes_no")

const configList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const dateRange = ref([])
const submitting = ref(false)

/** 添加方式：template 从模板添加 / custom 自定义参数 */
const addMode = ref("template")
const templateCategory = ref("")
const templateKey = ref("")
const selectedTemplate = ref(null)
/** 编辑内置参数时锁定名称与键名 */
const lockKeyName = ref(false)

/** 按分类过滤模板 */
const filteredTemplates = computed(() => {
  if (!templateCategory.value) return configTemplates
  return configTemplates.filter(t => t.category === templateCategory.value)
})

/** 编辑时根据键名匹配已知模板，展示用途说明 */
const editTemplate = computed(() => {
  const key = form.value.configKey
  return key ? findTemplateByKey(key) : null
})

/** 已存在键名集合，用于模板防重复 */
const existingKeys = computed(() => new Set(configList.value.map(item => item.configKey)))

function isTemplateExists(key) {
  return existingKeys.value.has(key)
}

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    configName: undefined,
    configKey: undefined,
    configType: undefined
  },
  rules: {
    configName: [{ required: true, message: "参数名称不能为空", trigger: "blur" }],
    configKey: [{ required: true, message: "参数键名不能为空", trigger: "blur" }],
    configValue: [{ required: true, message: "参数键值不能为空", trigger: "blur" }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询参数列表 */
function getList() {
  loading.value = true
  listConfig(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    configList.value = response.rows
    total.value = response.total
  }).finally(() => {
    loading.value = false
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    configId: undefined,
    configName: undefined,
    configKey: undefined,
    configValue: undefined,
    configType: "Y",
    remark: undefined
  }
  proxy.resetForm("configRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.configId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  addMode.value = "template"
  templateCategory.value = ""
  templateKey.value = ""
  selectedTemplate.value = null
  lockKeyName.value = false
  open.value = true
  title.value = "添加参数"
}

/** 切换参数分类时重置模板选择 */
function handleCategoryChange() {
  templateKey.value = ""
  selectedTemplate.value = null
  form.value.configName = undefined
  form.value.configKey = undefined
  form.value.configValue = undefined
  form.value.configType = "Y"
  form.value.remark = undefined
}

/** 选择参数模板后自动填充表单 */
function handleTemplateSelect(key) {
  const t = configTemplates.find(x => x.key === key)
  if (!t) return
  selectedTemplate.value = t
  form.value.configName = t.name
  form.value.configKey = t.key
  form.value.configType = t.systemBuiltIn
  form.value.remark = t.remark
  form.value.configValue = t.valueType === "number" ? Number(t.defaultValue) : t.defaultValue
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  addMode.value = "custom"
  templateCategory.value = ""
  templateKey.value = ""
  selectedTemplate.value = null
  const configId = row.configId || ids.value
  getConfig(configId).then(response => {
    form.value = response.data
    lockKeyName.value = form.value.configType === "Y"
    open.value = true
    title.value = "修改参数"
  })
}

/** 提交按钮 */
function submitForm() {
  if (addMode.value === "template" && !form.value.configId && !templateKey.value) {
    proxy.$modal.msgWarning("请先选择参数模板")
    return
  }
  proxy.$refs["configRef"].validate(valid => {
    if (valid) {
      if (typeof form.value.configValue !== "string") {
        form.value.configValue = String(form.value.configValue)
      }
      submitting.value = true
      if (form.value.configId != undefined) {
        updateConfig(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        }).finally(() => {
          submitting.value = false
        })
      } else {
        addConfig(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        }).finally(() => {
          submitting.value = false
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const configIds = row.configId || ids.value
  proxy.$modal.confirm('是否确认删除参数编号为"' + configIds + '"的数据项？').then(function () {
    return delConfig(configIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("system/config/export", {
    ...queryParams.value
  }, `config_${new Date().getTime()}.xlsx`)
}

/** 刷新缓存按钮操作 */
function handleRefreshCache() {
  refreshCache().then(() => {
    proxy.$modal.msgSuccess("刷新缓存成功")
  })
}

getList()
</script>

<style scoped lang="scss">
.add-mode-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  .add-mode-label {
    font-size: 14px;
    color: var(--el-text-color-regular);
    flex-shrink: 0;
  }
}

.tpl-desc {
  width: 100%;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-5);
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 13px;

  .tpl-desc-text {
    color: var(--el-text-color-primary);
    line-height: 1.6;
  }

  .tpl-desc-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 6px;
    color: var(--el-text-color-secondary);
  }
}

.tpl-tag {
  margin-left: 8px;
}

.tpl-edit-alert {
  margin-bottom: 12px;
}
</style>
