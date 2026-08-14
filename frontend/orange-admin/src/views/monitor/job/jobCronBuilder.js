/**
 * 定时任务「执行周期」向导
 *
 * 将中文周期选项与参数转换为 Quartz Cron 表达式，并生成中文摘要。
 * 供快捷创建模式下自动填充 cronExpression 使用。
 */

/** 星期英文缩写 → 中文 */
const WEEK_CN = {
  MON: '周一',
  TUE: '周二',
  WED: '周三',
  THU: '周四',
  FRI: '周五',
  SAT: '周六',
  SUN: '周日'
}

/** 小时 → 时间段描述 */
function periodOf(hour) {
  const h = Number(hour)
  if (h >= 0 && h < 6) return '凌晨'
  if (h < 12) return '上午'
  if (h < 14) return '中午'
  if (h < 18) return '下午'
  return '晚上'
}

/** 补零 */
function pad(n) {
  return String(n).padStart(2, '0')
}

/**
 * 周期选项定义
 * value: 存储值
 * label: 中文名
 * fields: 需要展示的参数控件（unit 单位 / min 最小值 / max 最大值 / key 表单字段）
 */
export const cronPeriods = [
  { value: 'interval', label: '每隔 N 分钟', fields: [{ key: 'intervalMin', label: '间隔分钟', unit: '分钟', min: 1, max: 60 }] },
  { value: 'hourly', label: '每小时', fields: [{ key: 'hourMin', label: '执行分钟', unit: '分', min: 0, max: 59 }] },
  { value: 'daily', label: '每天', fields: [{ key: 'dailyHour', label: '小时', unit: '时', min: 0, max: 23 }, { key: 'dailyMin', label: '分钟', unit: '分', min: 0, max: 59 }] },
  { value: 'weekly', label: '每周', fields: [{ key: 'weeklyDay', label: '星期', type: 'week' }, { key: 'weeklyHour', label: '小时', unit: '时', min: 0, max: 23 }, { key: 'weeklyMin', label: '分钟', unit: '分', min: 0, max: 59 }] },
  { value: 'monthly', label: '每月', fields: [{ key: 'monthDay', label: '日期', unit: '日', min: 1, max: 31 }, { key: 'monthHour', label: '小时', unit: '时', min: 0, max: 23 }, { key: 'monthMin', label: '分钟', unit: '分', min: 0, max: 59 }] },
  { value: 'workday', label: '仅工作日', fields: [{ key: 'workdayHour', label: '小时', unit: '时', min: 0, max: 23 }, { key: 'workdayMin', label: '分钟', unit: '分', min: 0, max: 59 }] },
  { value: 'custom', label: '自定义 Cron', fields: [] }
]

/** 周期参数默认值 */
export function defaultCronForm() {
  return {
    periodType: 'interval',
    intervalMin: 10,
    hourMin: 0,
    dailyHour: 2,
    dailyMin: 0,
    weeklyDay: 'MON',
    weeklyHour: 9,
    weeklyMin: 0,
    monthDay: 1,
    monthHour: 3,
    monthMin: 0,
    workdayHour: 9,
    workdayMin: 0,
    customCron: ''
  }
}

/**
 * 根据周期类型与参数生成 Cron 表达式和中文摘要
 * @param {Object} form cronForm
 * @returns {{cron: string, summary: string}}
 */
export function buildCron(form) {
  const f = form || defaultCronForm()
  switch (f.periodType) {
    case 'interval':
      return {
        cron: `0 0/${Math.max(1, Number(f.intervalMin) || 1)} * * * ?`,
        summary: `每隔 ${Math.max(1, Number(f.intervalMin) || 1)} 分钟执行一次`
      }
    case 'hourly':
      return {
        cron: `0 ${Math.min(59, Math.max(0, Number(f.hourMin) || 0))} * * * ?`,
        summary: `每小时的第 ${Math.min(59, Math.max(0, Number(f.hourMin) || 0))} 分钟执行`
      }
    case 'daily': {
      const h = Math.min(23, Math.max(0, Number(f.dailyHour) || 0))
      const m = Math.min(59, Math.max(0, Number(f.dailyMin) || 0))
      return { cron: `0 ${m} ${h} * * ?`, summary: `${periodOf(h)} ${pad(h)}:${pad(m)} 执行` }
    }
    case 'weekly': {
      const day = f.weeklyDay || 'MON'
      const h = Math.min(23, Math.max(0, Number(f.weeklyHour) || 0))
      const m = Math.min(59, Math.max(0, Number(f.weeklyMin) || 0))
      return { cron: `0 ${m} ${h} ? * ${day}`, summary: `每周${WEEK_CN[day] || day} ${pad(h)}:${pad(m)} 执行` }
    }
    case 'monthly': {
      const d = Math.min(31, Math.max(1, Number(f.monthDay) || 1))
      const h = Math.min(23, Math.max(0, Number(f.monthHour) || 0))
      const m = Math.min(59, Math.max(0, Number(f.monthMin) || 0))
      return { cron: `0 ${m} ${h} ${d} * ?`, summary: `每月 ${d} 日 ${pad(h)}:${pad(m)} 执行` }
    }
    case 'workday': {
      const h = Math.min(23, Math.max(0, Number(f.workdayHour) || 0))
      const m = Math.min(59, Math.max(0, Number(f.workdayMin) || 0))
      return { cron: `0 ${m} ${h} ? * MON-FRI`, summary: `每个工作日 ${pad(h)}:${pad(m)} 执行` }
    }
    case 'custom':
    default:
      return { cron: f.customCron || '', summary: f.customCron ? '自定义表达式' : '' }
  }
}

/** 校验 Cron 表达式基础合法性（六段以上、非空） */
export function isValidCron(cron) {
  if (!cron || !String(cron).trim()) return false
  return String(cron).trim().split(/\s+/).length >= 6
}
