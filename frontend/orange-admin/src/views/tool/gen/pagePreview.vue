<template>
  <div class="page-preview">
    <!-- 顶部工具条 -->
    <div class="pp-header">
      <div class="pp-header-left">
        <span class="pp-title">{{ info.functionName || info.tableComment || '页面' }} · 页面预览</span>
        <el-tag size="small" effect="plain">{{ tplLabel }}</el-tag>
        <el-tag v-if="info.tplWebType === 'element-plus-typescript'" size="small" effect="plain">TypeScript</el-tag>
      </div>
      <div class="pp-header-right">
        <el-radio-group v-model="device" size="small">
          <el-radio-button value="pc">PC</el-radio-button>
          <el-radio-button value="mobile">手机</el-radio-button>
        </el-radio-group>
        <el-radio-group v-model="mode" size="small" class="pp-mode">
          <el-radio-button value="list">列表</el-radio-button>
          <el-radio-button value="add">新增</el-radio-button>
          <el-radio-button value="edit">编辑</el-radio-button>
          <el-radio-button v-if="hasView" value="detail">详情</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <el-alert
      v-if="isTreeOrSub"
      :title="treeSubHint"
      type="info"
      :closable="false"
      show-icon
      class="pp-alert"
    />

    <!-- 仿真舞台 -->
    <div class="pp-stage" :class="{ 'is-mobile': device === 'mobile' }">
      <template v-if="mode === 'list'">
        <!-- 查询区 -->
        <el-form ref="queryRef" :model="queryParams" :inline="true" class="pp-query">
          <el-form-item v-for="col in queryColumns" :key="col.javaField">
            <template #label>{{ colComment(col) }}：</template>
            <el-input
              v-if="col.htmlType === 'input'"
              v-model="queryParams[col.javaField]"
              :placeholder="'请输入' + colComment(col)"
              clearable
              style="width: 180px"
              @keyup.enter="handleQuery"
            />
            <el-select
              v-else-if="col.htmlType === 'select' || col.htmlType === 'radio'"
              v-model="queryParams[col.javaField]"
              :placeholder="'请选择' + colComment(col)"
              clearable
              style="width: 180px"
            >
              <el-option v-if="dictOptions(col)" v-for="d in dictOptions(col)" :key="d.value" :label="d.label" :value="d.value" />
              <el-option v-else label="请选择字典生成" value="" />
            </el-select>
            <el-date-picker
              v-else-if="col.htmlType === 'datetime' && col.queryType === 'BETWEEN'"
              v-model="queryParams[col.javaField]"
              type="daterange"
              value-format="YYYY-MM-DD"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
            <el-date-picker
              v-else-if="col.htmlType === 'datetime'"
              v-model="queryParams[col.javaField]"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择日期"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 工具栏 -->
        <div class="pp-ops">
          <el-button type="primary" plain icon="Plus" @click="openAdd">新增</el-button>
          <el-button type="success" plain icon="Edit" :disabled="single" @click="openEditBySelection">修改</el-button>
          <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
          <el-button type="warning" plain icon="Download">导出</el-button>
          <span class="pp-perm">{{ info.businessName }}:add / edit / remove / export</span>
        </div>

        <!-- 表格 -->
        <el-table
          v-loading="loading"
          :data="pagedRows"
          border
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="序号" type="index" width="60" align="center">
            <template #default="scope">
              <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column
            v-for="col in listColumns"
            :key="col.javaField"
            :label="colComment(col)"
            align="center"
            :prop="col.javaField"
            :show-overflow-tooltip="true"
          >
            <template #default="scope">
              <span v-if="col.htmlType === 'datetime'">{{ proxy.parseTime(scope.row[col.javaField], '{y}-{m}-{d}') }}</span>
              <image-preview v-else-if="col.htmlType === 'imageUpload'" :src="scope.row[col.javaField]" :width="50" :height="50" />
              <dict-tag v-else-if="dictOptions(col)" :options="dictOptions(col)" :value="scope.row[col.javaField]" />
              <span v-else>{{ formatCell(scope.row[col.javaField]) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" :width="hasView ? 190 : 130" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button v-if="hasView" link type="primary" icon="View" @click="openDetail(scope.row)">详情</el-button>
              <el-button link type="primary" icon="Edit" @click="openEdit(scope.row)">修改</el-button>
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" v-model:page="pageNum" v-model:limit="pageSize" />
      </template>

      <!-- 空态 -->
      <el-empty v-else-if="mode === 'edit' && !currentRow" description="请先在列表中勾选要修改的数据" />
      <el-empty v-else-if="mode === 'detail' && !currentRow" description="请先在列表中勾选要查看的数据" />

      <!-- 新增 / 编辑 浮层表单 -->
      <div v-if="formOpen" class="pp-mask" @click.self="closeForm">
        <div class="pp-form" :style="{ width: formWidth }">
          <div class="pp-form-head">
            <span>{{ (dialogMode === 'add' ? '新增' : '修改') + (info.functionName || '数据') }}</span>
            <span class="pp-form-perm">{{ dialogMode === 'add' ? 'isInsert 字段' : 'isEdit 字段 · 主键禁用' }}</span>
          </div>
          <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="pp-form-body">
            <el-row :gutter="16">
              <el-col v-for="col in formColumns" :key="col.javaField" :span="colSpan">
                <el-form-item :label="colComment(col)" :prop="col.javaField">
                  <el-input
                    v-if="col.htmlType === 'input'"
                    v-model="form[col.javaField]"
                    :placeholder="'请输入' + colComment(col)"
                    :disabled="isPkDisabled(col)"
                  />
                  <el-input
                    v-else-if="col.htmlType === 'textarea'"
                    v-model="form[col.javaField]"
                    type="textarea"
                    :rows="3"
                    :placeholder="'请输入' + colComment(col)"
                    :disabled="isPkDisabled(col)"
                  />
                  <el-select
                    v-else-if="col.htmlType === 'select'"
                    v-model="form[col.javaField]"
                    :placeholder="'请选择' + colComment(col)"
                    :disabled="isPkDisabled(col)"
                    style="width: 100%"
                  >
                    <el-option v-if="dictOptions(col)" v-for="d in dictOptions(col)" :key="d.value" :label="d.label" :value="coerceDictValue(col, d.value)" />
                    <el-option v-else label="请选择字典生成" value="" />
                  </el-select>
                  <el-radio-group
                    v-else-if="col.htmlType === 'radio'"
                    v-model="form[col.javaField]"
                    :disabled="isPkDisabled(col)"
                  >
                    <el-radio v-if="dictOptions(col)" v-for="d in dictOptions(col)" :key="d.value" :value="coerceDictValue(col, d.value)">{{ d.label }}</el-radio>
                    <el-radio v-else value="1">请选择字典生成</el-radio>
                  </el-radio-group>
                  <el-checkbox-group
                    v-else-if="col.htmlType === 'checkbox'"
                    v-model="form[col.javaField]"
                    :disabled="isPkDisabled(col)"
                  >
                    <el-checkbox v-if="dictOptions(col)" v-for="d in dictOptions(col)" :key="d.value" :value="coerceDictValue(col, d.value)">{{ d.label }}</el-checkbox>
                    <el-checkbox v-else value="1">请选择字典生成</el-checkbox>
                  </el-checkbox-group>
                  <el-date-picker
                    v-else-if="col.htmlType === 'datetime'"
                    v-model="form[col.javaField]"
                    type="date"
                    value-format="YYYY-MM-DD"
                    :placeholder="'请选择' + colComment(col)"
                    :disabled="isPkDisabled(col)"
                    style="width: 100%"
                  />
                  <image-upload
                    v-else-if="col.htmlType === 'imageUpload'"
                    v-model="form[col.javaField]"
                    :disabled="true"
                  />
                  <file-upload
                    v-else-if="col.htmlType === 'fileUpload'"
                    v-model="form[col.javaField]"
                    :disabled="true"
                  />
                  <div v-else-if="col.htmlType === 'editor'" class="pp-editor-ph">
                    {{ form[col.javaField] || '富文本编辑区（预览占位，不渲染 HTML）' }}
                  </div>
                  <el-input
                    v-else
                    v-model="form[col.javaField]"
                    :placeholder="'请输入' + colComment(col)"
                    :disabled="isPkDisabled(col)"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div class="pp-form-foot">
            <el-button @click="closeForm">取 消</el-button>
            <el-button type="primary" :loading="submitting" @click="submitForm">确 定</el-button>
          </div>
        </div>
      </div>

      <!-- 详情侧栏 -->
      <div v-if="detailOpen" class="pp-mask" @click.self="closeDetail">
        <div class="pp-detail">
          <div class="pp-form-head">
            <span>{{ info.functionName || '数据' }}详情</span>
            <el-button link type="primary" @click="closeDetail">关闭</el-button>
          </div>
          <div class="pp-detail-body">
            <el-descriptions :column="1" border>
              <el-descriptions-item v-for="col in listColumns" :key="col.javaField" :label="colComment(col)">
                <dict-tag v-if="dictOptions(col)" :options="dictOptions(col)" :value="currentRow[col.javaField]" />
                <image-preview v-else-if="col.htmlType === 'imageUpload'" :src="currentRow[col.javaField]" :width="50" :height="50" />
                <span v-else>{{ formatCell(currentRow[col.javaField]) }}</span>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="PagePreview">
import { useDict } from '@/composables/useDict'

const props = defineProps({
  info: { type: Object, required: true },
  columns: { type: Array, required: true }
})

const { proxy } = getCurrentInstance()

// ========== 基础元数据 ==========
const tplLabel = computed(() => {
  const map = { crud: '单表', tree: '树表', sub: '主子表' }
  return map[props.info.tplCategory] || props.info.tplCategory || '单表'
})
const hasView = computed(() => props.info.view === true || props.info.view === '1' || props.info.isView === true)
const isTreeOrSub = computed(() => props.info.tplCategory === 'tree' || props.info.tplCategory === 'sub')
const treeSubHint = computed(() => {
  if (props.info.tplCategory === 'tree') {
    return '树表模板：生成页面为左树右表布局，此处预览列表主体，树表区域以实际生成代码为准'
  }
  return '主子表模板：生成页面包含主子表两个表格，此处预览主表主体，子表区域以实际生成代码为准'
})

// ========== 列分组 ==========
const pkColumn = computed(() => props.columns.find(c => c.isPk === '1'))
const queryColumns = computed(() => props.columns.filter(c => c.isQuery === '1'))
const listColumns = computed(() => props.columns.filter(c => c.isList === '1'))
const insertColumns = computed(() => props.columns.filter(c => c.isInsert === '1' && c.isPk !== '1'))
const editColumns = computed(() => props.columns.filter(c => c.isEdit === '1'))

// ========== 字典 ==========
const dictTypes = [...new Set(props.columns.filter(c => c.dictType).map(c => c.dictType))]
const dictData = useDict(...dictTypes)

function dictOptions(col) {
  if (!col.dictType) return null
  return dictData[col.dictType]?.value || null
}

function coerceDictValue(col, v) {
  if (col.javaType === 'Integer' || col.javaType === 'Long') return parseInt(v, 10)
  return v
}

// ========== 工具 ==========
function colComment(col) {
  const text = col.columnComment || col.javaField
  const idx = text.indexOf('（')
  return idx !== -1 ? text.substring(0, idx) : text
}

function formatCell(v) {
  if (v === null || v === undefined || v === '') return '-'
  if (Array.isArray(v)) return v.join(',')
  if (typeof v === 'boolean') return v ? '是' : '否'
  return String(v)
}

function today() {
  const d = new Date()
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

const placeholderImg =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#E5EAFF"/><text x="40" y="46" font-size="14" fill="#4B3FE3" text-anchor="middle">预览图</text></svg>'
  )

// ========== 模拟数据 ==========
const mockRows = ref([])
const loading = ref(false)

function genMockValue(col, index) {
  const dict = dictOptions(col)
  if (dict && dict.length) {
    if (col.htmlType === 'checkbox') return [coerceDictValue(col, dict[0].value)]
    return coerceDictValue(col, dict[0].value)
  }
  switch (col.javaType) {
    case 'Integer':
    case 'Long':
      return index + 1
    case 'BigDecimal':
      return ((index + 1) * 100).toFixed(2)
    case 'Double':
      return index + 0.5
    case 'Boolean':
      return index % 2 === 0
    case 'Date':
      return today()
    case 'String':
    default:
      if (col.htmlType === 'imageUpload') return placeholderImg
      if (col.htmlType === 'editor') return colComment(col) + '内容示例：模拟富文本正文，仅供布局预览。'
      return colComment(col) + '示例' + (index + 1)
  }
}

function genRows() {
  mockRows.value = []
  for (let i = 0; i < 4; i++) {
    const row = {}
    props.columns.forEach(col => {
      row[col.javaField] = genMockValue(col, i)
    })
    if (pkColumn.value && pkColumn.value.javaType === 'Long') {
      row[pkColumn.value.javaField] = i + 1
    }
    mockRows.value.push(row)
  }
}

// ========== 查询 / 分页 ==========
const queryParams = reactive({})
queryColumns.value.forEach(col => {
  queryParams[col.javaField] = undefined
})

const pageNum = ref(1)
const pageSize = ref(10)

const filteredRows = computed(() => {
  return mockRows.value.filter(row => {
    return queryColumns.value.every(col => {
      const v = queryParams[col.javaField]
      if (v === undefined || v === null || v === '') return true
      const rv = row[col.javaField]
      switch (col.queryType) {
        case 'LIKE':
          return String(rv).includes(String(v))
        case 'NE':
          return rv != v
        case 'GT':
          return rv > v
        case 'GTE':
          return rv >= v
        case 'LT':
          return rv < v
        case 'LTE':
          return rv <= v
        case 'BETWEEN':
          if (Array.isArray(v) && v.length === 2) {
            return rv >= v[0] && rv <= v[1]
          }
          return true
        case 'EQ':
        default:
          return rv == v
      }
    })
  })
})

const total = computed(() => filteredRows.value.length)
const pagedRows = computed(() => {
  const start = (pageNum.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

function handleQuery() {
  pageNum.value = 1
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
}

function resetQuery() {
  queryColumns.value.forEach(col => {
    queryParams[col.javaField] = undefined
  })
  pageNum.value = 1
  proxy.$modal.msgSuccess('已重置查询条件')
}

// ========== 选择 / 删除 ==========
const selection = ref([])
const single = ref(true)
const multiple = ref(true)

function handleSelectionChange(rows) {
  selection.value = rows
  single.value = rows.length !== 1
  multiple.value = !rows.length
}

function handleDelete(row) {
  const rows = row ? [row] : selection.value
  if (!rows.length) return
  rows.forEach(r => {
    const idx = mockRows.value.indexOf(r)
    if (idx > -1) mockRows.value.splice(idx, 1)
  })
  proxy.$modal.msgSuccess('模拟删除成功')
}

// ========== 视图切换 ==========
const device = ref('pc')
const mode = ref('list')
const currentRow = ref(null)
const formOpen = ref(false)
const detailOpen = ref(false)
const dialogMode = ref('add')

watch(mode, val => {
  if (val === 'add') {
    dialogMode.value = 'add'
    initForm(null)
    formOpen.value = true
    detailOpen.value = false
  } else if (val === 'edit') {
    if (currentRow.value) {
      dialogMode.value = 'edit'
      initForm(currentRow.value)
      formOpen.value = true
    }
    detailOpen.value = false
  } else if (val === 'detail') {
    formOpen.value = false
    detailOpen.value = !!currentRow.value
  } else {
    formOpen.value = false
    detailOpen.value = false
  }
})

function openAdd() {
  mode.value = 'add'
}

function openEditBySelection() {
  if (selection.value.length === 1) openEdit(selection.value[0])
}

function openEdit(row) {
  currentRow.value = row
  mode.value = 'edit'
  if (formOpen.value) initForm(row)
}

function openDetail(row) {
  currentRow.value = row
  mode.value = 'detail'
}

function closeForm() {
  formOpen.value = false
  mode.value = 'list'
}

function closeDetail() {
  detailOpen.value = false
  mode.value = 'list'
}

// ========== 表单 ==========
const formColumns = computed(() => (dialogMode.value === 'add' ? insertColumns.value : editColumns.value))
const colSpan = computed(() => {
  const map = { 1: 24, 2: 12, 3: 8 }
  return map[props.info.formColNum] || 12
})
const formWidth = computed(() => {
  const map = { 1: '500px', 2: '800px', 3: '1100px' }
  const w = map[props.info.formColNum] || '800px'
  return `min(${w}, calc(100vw - 32px))`
})

const form = reactive({})
const formRef = ref(null)
const submitting = ref(false)

const rules = computed(() => {
  const r = {}
  formColumns.value.forEach(col => {
    if (col.isRequired === '1') {
      r[col.javaField] = [{ required: true, message: (col.htmlType === 'select' || col.htmlType === 'radio' ? '请选择' : '请输入') + colComment(col), trigger: 'blur' }]
    }
  })
  return r
})

function defaultFormValue(col) {
  if (col.htmlType === 'checkbox') return []
  if (col.htmlType === 'imageUpload') return placeholderImg
  return undefined
}

function initForm(row) {
  Object.keys(form).forEach(k => delete form[k])
  formColumns.value.forEach(col => {
    const v = row ? row[col.javaField] : defaultFormValue(col)
    form[col.javaField] = v === undefined ? '' : v
  })
}

function isPkDisabled(col) {
  return col.isPk === '1' && dialogMode.value === 'edit'
}

function nextPk() {
  let max = 0
  mockRows.value.forEach(r => {
    const v = Number(r[pkColumn.value.javaField]) || 0
    if (v > max) max = v
  })
  return max + 1
}

function submitForm() {
  proxy.$refs.formRef.validate(valid => {
    if (!valid) return
    submitting.value = true
    setTimeout(() => {
      const payload = { ...form }
      if (dialogMode.value === 'add') {
        if (pkColumn.value && payload[pkColumn.value.javaField] === '') {
          payload[pkColumn.value.javaField] = nextPk()
        }
        mockRows.value.unshift(payload)
        proxy.$modal.msgSuccess('模拟新增成功')
      } else {
        Object.assign(currentRow.value, payload)
        proxy.$modal.msgSuccess('模拟修改成功')
      }
      submitting.value = false
      closeForm()
    }, 300)
  })
}

// ========== 初始化 ==========
genRows()
</script>

<style scoped>
.page-preview {
  font-size: 14px;
}
.pp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding-bottom: 12px;
}
.pp-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pp-title {
  font-weight: 600;
  font-size: 15px;
  color: var(--el-text-color-primary);
}
.pp-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pp-alert {
  margin-bottom: 12px;
}
.pp-stage {
  position: relative;
  min-height: 480px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 12px;
  background: var(--el-bg-color);
  transition: max-width 0.2s;
}
.pp-stage.is-mobile {
  max-width: 375px;
  margin: 0 auto;
}
.pp-query {
  padding: 8px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
}
.pp-query :deep(.el-form-item) {
  margin-bottom: 8px;
  margin-right: 16px;
}
.pp-ops {
  margin: 8px 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}
.pp-perm {
  margin-left: auto;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.pp-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 6px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 24px 16px;
  z-index: 20;
}
.pp-form {
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  max-height: calc(100% - 48px);
  display: flex;
  flex-direction: column;
}
.pp-form-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-weight: 600;
  font-size: 15px;
}
.pp-form-perm {
  font-size: 12px;
  font-weight: 400;
  color: var(--el-text-color-secondary);
}
.pp-form-body {
  padding: 16px 16px 0;
  overflow-y: auto;
}
.pp-form-foot {
  padding: 12px 16px;
  text-align: right;
  border-top: 1px solid var(--el-border-color-lighter);
}
.pp-editor-ph {
  width: 100%;
  min-height: 120px;
  border: 1px dashed var(--el-border-color);
  border-radius: 4px;
  padding: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  font-size: 13px;
  line-height: 1.8;
}
.pp-detail {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(400px, 90%);
  background: var(--el-bg-color);
  border-radius: 6px 0 0 6px;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.12);
}
.pp-detail-body {
  padding: 16px;
  overflow-y: auto;
  flex: 1;
}
</style>
