import test from 'node:test'
import assert from 'node:assert/strict'
import { buildDeptPath } from './deptPath.js'

test('拼接完整部门路径（含上级公司）', () => {
  const deptList = [
    { deptId: 100, deptName: '橙子科技' },
    { deptId: 103, deptName: '研发部' }
  ]
  const dept = { deptId: 103, deptName: '研发部', ancestors: '0,100' }
  assert.equal(buildDeptPath(dept, deptList), '橙子科技 / 研发部')
})

test('无上级部门时只显示本级名称', () => {
  const dept = { deptId: 100, deptName: '橙子科技', ancestors: '0' }
  assert.equal(buildDeptPath(dept, []), '橙子科技')
})

test('ancestors 缺省时只显示本级名称', () => {
  const dept = { deptId: 103, deptName: '研发部' }
  assert.equal(buildDeptPath(dept, []), '研发部')
})

test('dept 为空时返回空字符串', () => {
  assert.equal(buildDeptPath(null, []), '')
})
