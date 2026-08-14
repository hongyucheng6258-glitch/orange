/**
 * 根据部门对象与全量部门列表拼接完整部门路径
 * 例：dept.ancestors = "0,100" 时，返回 "橙子科技 / 研发部"
 * @param {Object|null} dept 当前部门（含 ancestors、deptName）
 * @param {Array} deptList 全量部门列表（含 deptId、deptName）
 * @returns {string}
 */
export function buildDeptPath(dept, deptList) {
  if (!dept || !dept.deptName) return ''

  const nameMap = {}
  ;(deptList || []).forEach(item => {
    if (item && item.deptId !== undefined && item.deptId !== null) {
      nameMap[item.deptId] = item.deptName
    }
  })

  const ancestorIds = String(dept.ancestors || '')
    .split(',')
    .map(id => id.trim())
    .filter(id => id && id !== '0')

  const names = ancestorIds
    .map(id => nameMap[id])
    .filter(Boolean)

  names.push(dept.deptName)
  return names.join(' / ')
}
