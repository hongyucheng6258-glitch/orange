<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item label="任务名称" prop="jobName">
            <el-input
               v-model="queryParams.jobName"
               placeholder="请输入任务名称"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="任务组名" prop="jobGroup">
            <el-select v-model="queryParams.jobGroup" placeholder="请选择任务组名" clearable style="width: 200px">
               <el-option
                  v-for="dict in sys_job_group"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item label="任务状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择任务状态" clearable style="width: 200px">
               <el-option
                  v-for="dict in sys_job_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
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
               v-hasPermi="['monitor:job:add']"
            >新增</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['monitor:job:edit']"
            >修改</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['monitor:job:remove']"
            >删除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['monitor:job:export']"
            >导出</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="info"
               plain
               icon="Operation"
               @click="handleJobLog"
               v-hasPermi="['monitor:job:query']"
            >日志</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="jobList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="任务编号" width="100" align="center" prop="jobId" />
         <el-table-column label="任务名称" align="center" :show-overflow-tooltip="true">
            <template #default="scope">
               <a class="link-type" style="cursor:pointer" @click="handleView(scope.row)">{{ scope.row.jobName }}</a>
            </template>
         </el-table-column>
         <el-table-column label="任务组名" align="center" prop="jobGroup">
            <template #default="scope">
               <dict-tag :options="sys_job_group" :value="scope.row.jobGroup" />
            </template>
         </el-table-column>
         <el-table-column label="调用目标字符串" align="center" prop="invokeTarget" :show-overflow-tooltip="true" />
         <el-table-column label="cron执行表达式" align="center" prop="cronExpression" :show-overflow-tooltip="true" />
         <el-table-column label="状态" align="center">
            <template #default="scope">
               <el-switch
                  v-model="scope.row.status"
                  active-value="0"
                  inactive-value="1"
                  @change="handleStatusChange(scope.row)"
               ></el-switch>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-tooltip content="修改" placement="top">
                  <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['monitor:job:edit']"></el-button>
               </el-tooltip>
               <el-tooltip content="删除" placement="top">
                  <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['monitor:job:remove']"></el-button>
               </el-tooltip>
               <el-tooltip content="执行一次" placement="top">
                  <el-button link type="primary" icon="CaretRight" @click="handleRun(scope.row)" v-hasPermi="['monitor:job:changeStatus']"></el-button>
               </el-tooltip>
               <el-tooltip content="调度日志" placement="top">
                  <el-button link type="primary" icon="Operation" @click="handleJobLog(scope.row)" v-hasPermi="['monitor:job:query']"></el-button>
               </el-tooltip>
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

      <!-- 添加或修改定时任务对话框 -->
      <el-dialog :title="title" v-model="open" width="min(920px, calc(100vw - 24px))" append-to-body>
         <div v-if="!form.jobId" class="add-mode-bar">
            <span class="add-mode-label">创建方式：</span>
            <el-radio-group v-model="addMode">
               <el-radio-button value="quick">快捷创建</el-radio-button>
               <el-radio-button value="custom">高级自定义</el-radio-button>
            </el-radio-group>
         </div>

         <el-form ref="jobRef" :model="form" :rules="rules" label-width="110px">
            <!-- 快捷创建模式（仅新增时显示） -->
            <template v-if="addMode === 'quick' && !form.jobId">
               <el-row>
                  <el-col :span="12">
                     <el-form-item label="任务分类">
                        <el-select v-model="templateCategory" placeholder="请选择任务分类" style="width: 100%" @change="handleCategoryChange">
                           <el-option v-for="c in jobCategories" :key="c.value" :label="c.label" :value="c.value" />
                        </el-select>
                     </el-form-item>
                  </el-col>
                  <el-col :span="12">
                     <el-form-item label="任务模板">
                        <el-select v-model="templateKey" placeholder="请选择任务模板" filterable style="width: 100%" @change="handleTemplateSelect">
                           <el-option v-for="t in filteredTemplates" :key="t.name" :label="t.name" :value="t.name" />
                        </el-select>
                     </el-form-item>
                  </el-col>
                  <el-col :span="24" v-if="selectedTemplate">
                     <el-form-item label="用途说明">
                        <div class="tpl-desc">
                           <div class="tpl-desc-text">{{ selectedTemplate.description }}</div>
                           <div class="tpl-desc-meta">
                              <el-tag :type="riskTagType(selectedTemplate.riskLevel)" size="small">风险：{{ riskLabel(selectedTemplate.riskLevel) }}</el-tag>
                              <span>调用：{{ selectedTemplate.beanName }}.{{ selectedTemplate.methodName }}()</span>
                           </div>
                        </div>
                     </el-form-item>
                  </el-col>
                  <el-col :span="12">
                     <el-form-item label="任务名称" prop="jobName">
                        <el-input v-model="form.jobName" placeholder="请输入任务名称" />
                     </el-form-item>
                  </el-col>
                  <el-col :span="12">
                     <el-form-item label="任务分组" prop="jobGroup">
                        <el-select v-model="form.jobGroup" placeholder="请选择">
                           <el-option
                              v-for="dict in sys_job_group"
                              :key="dict.value"
                              :label="dict.label"
                              :value="dict.value"
                           ></el-option>
                        </el-select>
                     </el-form-item>
                  </el-col>
                  <el-col :span="24" v-if="selectedTemplate && selectedTemplate.parameters.length">
                     <el-divider content-position="left">方法参数</el-divider>
                     <el-row>
                        <el-col :span="12" v-for="p in selectedTemplate.parameters" :key="p.name">
                           <el-form-item :label="p.label">
                              <el-switch
                                 v-if="p.type === 'boolean'"
                                 v-model="paramValues[p.name]"
                                 active-value="true"
                                 inactive-value="false"
                                 active-text="是"
                                 inactive-text="否"
                              />
                              <el-input-number
                                 v-else-if="p.type === 'int' || p.type === 'long'"
                                 v-model="paramValues[p.name]"
                                 :min="-99999999"
                                 controls-position="right"
                                 style="width: 100%"
                              />
                              <el-input-number
                                 v-else-if="p.type === 'double'"
                                 v-model="paramValues[p.name]"
                                 :min="-99999999"
                                 :precision="2"
                                 :step="0.1"
                                 controls-position="right"
                                 style="width: 100%"
                              />
                              <el-input v-else v-model="paramValues[p.name]" :placeholder="'请输入' + p.label" />
                           </el-form-item>
                        </el-col>
                     </el-row>
                  </el-col>
                  <el-col :span="24" v-if="invokeTargetText">
                     <el-form-item label="调用目标">
                        <el-input :model-value="invokeTargetText" readonly>
                           <template #append>
                              <el-tooltip content="由模板自动生成，提交时自动生效" placement="top">
                                 <el-icon><question-filled /></el-icon>
                              </el-tooltip>
                           </template>
                        </el-input>
                     </el-form-item>
                  </el-col>
                  <el-col :span="24">
                     <el-divider content-position="left">执行周期</el-divider>
                  </el-col>
                  <el-col :span="12">
                     <el-form-item label="执行周期">
                        <el-select v-model="cronForm.periodType" placeholder="请选择执行周期" style="width: 100%" @change="handlePeriodChange">
                           <el-option v-for="p in cronPeriods" :key="p.value" :label="p.label" :value="p.value" />
                        </el-select>
                     </el-form-item>
                  </el-col>
                  <template v-for="f in currentPeriodFields" :key="f.key">
                     <el-col :span="12">
                        <el-form-item :label="f.label">
                           <el-select v-if="f.type === 'week'" v-model="cronForm[f.key]" style="width: 100%" @change="handlePeriodChange">
                              <el-option v-for="(cn, en) in weekOptions" :key="en" :label="cn" :value="en" />
                           </el-select>
                           <el-input-number
                              v-else
                              v-model="cronForm[f.key]"
                              :min="f.min"
                              :max="f.max"
                              controls-position="right"
                              style="width: 100%"
                              @change="handlePeriodChange"
                           />
                        </el-form-item>
                     </el-col>
                  </template>
                  <el-col :span="24" v-if="cronForm.periodType === 'custom'">
                     <el-form-item label="Cron表达式" prop="cronExpression">
                        <el-input v-model="cronForm.customCron" placeholder="请输入cron执行表达式" @change="handlePeriodChange">
                           <template #append>
                              <el-button type="primary" @click="handleShowCron">
                                 生成表达式
                                 <i class="el-icon-time el-icon--right"></i>
                              </el-button>
                           </template>
                        </el-input>
                     </el-form-item>
                  </el-col>
                  <el-col :span="24" v-if="generatedCron">
                     <el-form-item label="Cron预览">
                        <div class="cron-preview">
                           <code class="cron-code">{{ generatedCron }}</code>
                           <el-tag v-if="cronSummary" size="small" type="success">{{ cronSummary }}</el-tag>
                        </div>
                     </el-form-item>
                  </el-col>
                  <el-col :span="8">
                     <el-form-item label="执行策略" prop="misfirePolicy">
                        <el-select v-model="form.misfirePolicy" style="width: 100%">
                           <el-option label="立即执行一次" value="1" />
                           <el-option label="执行一次后继续" value="2" />
                           <el-option label="放弃错过的执行" value="3" />
                        </el-select>
                     </el-form-item>
                  </el-col>
                  <el-col :span="8">
                     <el-form-item label="是否并发">
                        <el-tooltip content="禁止并发：上一次未结束时不会启动下一次，避免重复执行" placement="top">
                           <el-switch v-model="form.concurrent" active-value="0" inactive-value="1" active-text="允许" inactive-text="禁止" />
                        </el-tooltip>
                     </el-form-item>
                  </el-col>
                  <el-col :span="8">
                     <el-form-item label="初始状态">
                        <el-tooltip content="建议先暂停，保存后执行一次验证，再手动启用" placement="top">
                           <el-switch v-model="form.status" active-value="0" inactive-value="1" active-text="正常" inactive-text="暂停" />
                        </el-tooltip>
                     </el-form-item>
                  </el-col>
               </el-row>
            </template>

            <!-- 高级自定义 / 编辑模式 -->
            <template v-else>
               <el-row>
                  <el-col :span="12">
                     <el-form-item label="任务名称" prop="jobName">
                        <el-input v-model="form.jobName" placeholder="请输入任务名称" />
                     </el-form-item>
                  </el-col>
                  <el-col :span="12">
                     <el-form-item label="任务分组" prop="jobGroup">
                        <el-select v-model="form.jobGroup" placeholder="请选择">
                           <el-option
                              v-for="dict in sys_job_group"
                              :key="dict.value"
                              :label="dict.label"
                              :value="dict.value"
                           ></el-option>
                        </el-select>
                     </el-form-item>
                  </el-col>
                  <el-col :span="24">
                     <el-form-item prop="invokeTarget">
                        <template #label>
                           <span>
                              调用方法
                              <el-tooltip placement="top">
                                 <template #content>
                                    <div>
                                       Bean调用示例：orangeTask.orangeParams('orange')
                                       <br />Class类调用示例：com.orange.quartz.task.OrangeTask.orangeParams('orange')
                                       <br />参数说明：支持字符串，布尔类型，长整型，浮点型，整型
                                    </div>
                                 </template>
                                 <el-icon><question-filled /></el-icon>
                              </el-tooltip>
                           </span>
                        </template>
                        <el-input v-model="form.invokeTarget" placeholder="请输入调用目标字符串" />
                     </el-form-item>
                  </el-col>
                  <el-col :span="24">
                     <el-form-item label="cron表达式" prop="cronExpression">
                        <el-input v-model="form.cronExpression" placeholder="请输入cron执行表达式">
                           <template #append>
                              <el-button type="primary" @click="handleShowCron">
                                 生成表达式
                                 <i class="el-icon-time el-icon--right"></i>
                              </el-button>
                           </template>
                        </el-input>
                     </el-form-item>
                  </el-col>
                  <el-col :span="24" v-if="form.jobId !== undefined">
                     <el-form-item label="状态">
                        <el-radio-group v-model="form.status">
                           <el-radio
                              v-for="dict in sys_job_status"
                              :key="dict.value"
                              :value="dict.value"
                           >{{ dict.label }}</el-radio>
                        </el-radio-group>
                     </el-form-item>
                  </el-col>
                  <el-col :span="12">
                     <el-form-item label="执行策略" prop="misfirePolicy">
                        <el-radio-group v-model="form.misfirePolicy">
                           <el-radio-button value="1">立即执行</el-radio-button>
                           <el-radio-button value="2">执行一次</el-radio-button>
                           <el-radio-button value="3">放弃执行</el-radio-button>
                        </el-radio-group>
                     </el-form-item>
                  </el-col>
                  <el-col :span="12">
                     <el-form-item label="是否并发" prop="concurrent">
                        <el-radio-group v-model="form.concurrent">
                           <el-radio-button value="0">允许</el-radio-button>
                           <el-radio-button value="1">禁止</el-radio-button>
                        </el-radio-group>
                     </el-form-item>
                  </el-col>
               </el-row>
            </template>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" :loading="submitting" @click="submitForm">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
      </el-dialog>

     <el-dialog title="Cron表达式生成器" v-model="openCron" append-to-body destroy-on-close>
       <crontab ref="crontabRef" @hide="openCron=false" @fill="crontabFill" :expression="expression"></crontab>
     </el-dialog>

      <!-- 任务详细 -->
      <job-detail v-model:visible="openView" :row="form" type="job" />
   </div>
</template>

<script setup name="Job">
import Crontab from '@/components/common/Crontab'
import JobDetail from './detail'
import { listJob, getJob, delJob, addJob, updateJob, runJob, changeJobStatus, listJobTemplates } from "@/api/modules/monitor/job"
import { cronPeriods, defaultCronForm, buildCron } from "./jobCronBuilder"

const router = useRouter()
const { proxy } = getCurrentInstance()
const { sys_job_group, sys_job_status } = useDict("sys_job_group", "sys_job_status")

const jobList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const openView = ref(false)
const openCron = ref(false)
const expression = ref("")
const submitting = ref(false)

/** 创建方式：quick 快捷创建 / custom 高级自定义 */
const addMode = ref("quick")
/** 任务模板数据 */
const templateList = ref([])
const templateCategory = ref("")
const templateKey = ref("")
const selectedTemplate = ref(null)
const paramValues = ref({})
/** 执行周期表单 */
const cronForm = ref(defaultCronForm())

/** 星期选项 */
const weekOptions = {
  MON: '周一', TUE: '周二', WED: '周三', THU: '周四', FRI: '周五', SAT: '周六', SUN: '周日'
}

/** 分类中文映射 */
const categoryLabels = { system: '系统任务', maintenance: '数据维护', message: '消息通知' }

/** 任务分类（从模板列表动态派生） */
const jobCategories = computed(() => {
  const map = new Map()
  templateList.value.forEach(t => {
    if (!map.has(t.category)) map.set(t.category, categoryLabels[t.category] || t.category)
  })
  return Array.from(map, ([value, label]) => ({ value, label }))
})

/** 按分类过滤模板 */
const filteredTemplates = computed(() => {
  if (!templateCategory.value) return templateList.value
  return templateList.value.filter(t => t.category === templateCategory.value)
})

/** 当前执行周期需要展示的参数控件 */
const currentPeriodFields = computed(() => {
  const p = cronPeriods.find(x => x.value === cronForm.value.periodType)
  return p ? p.fields : []
})

/** 自动拼接的调用目标 */
const invokeTargetText = computed(() => buildInvokeTarget())

/** 生成的 Cron 表达式 */
const generatedCron = computed(() => buildCron(cronForm.value).cron)

/** Cron 中文摘要 */
const cronSummary = computed(() => buildCron(cronForm.value).summary)

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    jobName: undefined,
    jobGroup: undefined,
    status: undefined
  },
  rules: {
    jobName: [{ required: true, message: "任务名称不能为空", trigger: "blur" }],
    invokeTarget: [{ required: true, message: "调用目标字符串不能为空", trigger: "blur" }],
    cronExpression: [{ required: true, message: "cron执行表达式不能为空", trigger: "change" }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询定时任务列表 */
function getList() {
  loading.value = true
  listJob(queryParams.value).then(response => {
    jobList.value = response.rows
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
    jobId: undefined,
    jobName: undefined,
    jobGroup: undefined,
    invokeTarget: undefined,
    cronExpression: undefined,
    misfirePolicy: '3',
    concurrent: '1',
    status: "1"
  }
  proxy.resetForm("jobRef")
}

/** 风险等级 → 标签类型 */
function riskTagType(level) {
  const map = { low: 'success', medium: 'warning', high: 'danger' }
  return map[level] || 'info'
}

/** 风险等级 → 中文 */
function riskLabel(level) {
  const map = { low: '低', medium: '中', high: '高' }
  return map[level] || level
}

/** 加载任务模板清单 */
function loadTemplates() {
  if (templateList.value.length) return
  listJobTemplates().then(response => {
    templateList.value = response.data || []
  })
}

/** 切换任务分类时重置模板选择 */
function handleCategoryChange() {
  templateKey.value = ""
  selectedTemplate.value = null
  paramValues.value = {}
  form.value.invokeTarget = undefined
  form.value.jobName = undefined
}

/** 选择任务模板后自动填充 */
function handleTemplateSelect(name) {
  const t = templateList.value.find(x => x.name === name)
  if (!t) return
  selectedTemplate.value = t
  const values = {}
  ;(t.parameters || []).forEach(p => {
    if (p.type === 'int' || p.type === 'long' || p.type === 'double') {
      values[p.name] = Number(p.defaultValue) || 0
    } else {
      values[p.name] = p.defaultValue ?? ''
    }
  })
  paramValues.value = values
  form.value.jobName = t.name
  form.value.invokeTarget = buildInvokeTarget()
}

/** 拼接调用目标字符串 */
function buildInvokeTarget() {
  const t = selectedTemplate.value
  if (!t) return ''
  const params = t.parameters || []
  if (!params.length) return `${t.beanName}.${t.methodName}()`
  const args = params.map(p => {
    const v = paramValues.value[p.name]
    switch (p.type) {
      case 'string': return `'${v ?? ''}'`
      case 'boolean': return v === 'true' || v === true ? 'true' : 'false'
      case 'long': return `${Number(v) || 0}L`
      case 'double': return `${Number(v) || 0}D`
      default: return `${Number(v) || 0}`
    }
  })
  return `${t.beanName}.${t.methodName}(${args.join(', ')})`
}

/** 执行周期变化时同步 Cron */
function handlePeriodChange() {
  const { cron } = buildCron(cronForm.value)
  form.value.cronExpression = cron
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.jobId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

// 任务状态修改
function handleStatusChange(row) {
  let text = row.status === "0" ? "启用" : "停用"
  proxy.$modal.confirm('确认要"' + text + '""' + row.jobName + '"任务吗?').then(function () {
    return changeJobStatus(row.jobId, row.status)
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功")
  }).catch(function () {
    row.status = row.status === "0" ? "1" : "0"
  })
}

/* 立即执行一次 */
function handleRun(row) {
  proxy.$modal.confirm('确认要立即执行一次"' + row.jobName + '"任务吗?').then(function () {
    return runJob(row.jobId, row.jobGroup)
  }).then(() => {
    proxy.$modal.msgSuccess("执行成功")
  }).catch(() => {})
}

/** 任务详细信息 */
function handleView(row) {
  getJob(row.jobId).then(response => {
    form.value = response.data
    openView.value = true
  })
}

/** cron表达式按钮操作 */
function handleShowCron() {
  if (addMode.value === 'quick' && cronForm.value.periodType === 'custom') {
    expression.value = cronForm.value.customCron
  } else {
    expression.value = form.value.cronExpression
  }
  openCron.value = true
}

/** 确定后回传值 */
function crontabFill(value) {
  form.value.cronExpression = value
  if (addMode.value === 'quick' && cronForm.value.periodType === 'custom') {
    cronForm.value.customCron = value
    handlePeriodChange()
  }
}

/** 任务日志列表查询 */
function handleJobLog(row) {
  const jobId = row.jobId || 0
  router.push('/monitor/job-log/index/' + jobId)
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  addMode.value = "quick"
  templateCategory.value = ""
  templateKey.value = ""
  selectedTemplate.value = null
  paramValues.value = {}
  cronForm.value = defaultCronForm()
  handlePeriodChange()
  loadTemplates()
  open.value = true
  title.value = "添加任务"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  addMode.value = "custom"
  templateCategory.value = ""
  templateKey.value = ""
  selectedTemplate.value = null
  paramValues.value = {}
  const jobId = row.jobId || ids.value
  getJob(jobId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改任务"
  })
}

/** 提交按钮 */
function submitForm() {
  if (addMode.value === "quick" && !form.value.jobId) {
    if (!selectedTemplate.value) {
      proxy.$modal.msgWarning("请先选择任务模板")
      return
    }
    form.value.invokeTarget = buildInvokeTarget()
    const { cron } = buildCron(cronForm.value)
    form.value.cronExpression = cron
  }
  proxy.$refs["jobRef"].validate(valid => {
    if (valid) {
      submitting.value = true
      if (form.value.jobId != undefined) {
        updateJob(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        }).finally(() => {
          submitting.value = false
        })
      } else {
        addJob(form.value).then(response => {
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
  const jobIds = row.jobId || ids.value
  proxy.$modal.confirm('是否确认删除定时任务编号为"' + jobIds + '"的数据项?').then(function () {
    return delJob(jobIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("monitor/job/export", {
    ...queryParams.value,
  }, `job_${new Date().getTime()}.xlsx`)
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

.cron-preview {
  display: flex;
  align-items: center;
  gap: 12px;

  .cron-code {
    font-family: Consolas, Monaco, monospace;
    font-size: 13px;
    color: var(--el-color-primary);
    background: var(--el-fill-color-light);
    border-radius: 4px;
    padding: 6px 10px;
  }
}
</style>
