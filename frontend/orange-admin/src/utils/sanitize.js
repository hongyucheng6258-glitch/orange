// HTML 白名单清洗工具：移除脚本、事件属性、危险协议，防止 XSS
// 用于渲染富文本内容（公告等）时对不可信 HTML 做白名单过滤

// 允许的标签白名单
const ALLOWED_TAGS = new Set([
  'a', 'abbr', 'b', 'blockquote', 'br', 'caption', 'cite', 'code', 'col', 'colgroup',
  'dd', 'del', 'div', 'dl', 'dt', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr',
  'i', 'img', 'ins', 'kbd', 'li', 'mark', 'ol', 'p', 'pre', 'q', 's', 'small',
  'span', 'strike', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th',
  'thead', 'tr', 'u', 'ul'
])

// 直接移除的标签（黑名单优先于白名单）
const REMOVED_TAGS = new Set([
  'script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'form',
  'input', 'button', 'textarea', 'select', 'option', 'template', 'noscript', 'svg',
  'math', 'video', 'audio', 'source', 'track', 'frame', 'frameset', 'applet'
])

// 允许保留的属性
const ALLOWED_ATTRS = new Set([
  'href', 'title', 'alt', 'src', 'width', 'height', 'align', 'colspan', 'rowspan',
  'start', 'type', 'class', 'id', 'dir', 'datetime', 'target', 'style'
])

// 危险 URL 协议检测（href/src 仅允许 http/https/mailto/tel/锚点/相对路径/base64图片）
const SAFE_URL_RE = /^(https?:|mailto:|tel:|#|\/|\.\/|\.\.\/|data:image\/(png|jpe?g|gif|webp);)/i

// style 属性中的危险模式
const DANGEROUS_STYLE_RE = /expression|javascript:|vbscript:|url\s*\(|@import|behavior|content\s*:/i

function cleanAttrs(el) {
  const attrs = Array.from(el.attributes)
  for (const attr of attrs) {
    const name = attr.name.toLowerCase()
    // 删除所有事件属性
    if (name.startsWith('on')) {
      el.removeAttribute(attr.name)
      continue
    }
    // href/src 校验协议
    if (name === 'href' || name === 'src') {
      if (!SAFE_URL_RE.test(attr.value.trim())) {
        el.removeAttribute(attr.name)
        continue
      }
    }
    // style 过滤危险内容
    if (name === 'style') {
      if (DANGEROUS_STYLE_RE.test(attr.value)) {
        el.removeAttribute(attr.name)
        continue
      }
    }
    // 不在白名单中的属性删除
    if (!ALLOWED_ATTRS.has(name)) {
      el.removeAttribute(attr.name)
    }
  }
  // a 标签强制安全外链属性
  if (el.tagName.toLowerCase() === 'a' && el.hasAttribute('href')) {
    el.setAttribute('rel', 'noopener noreferrer')
    if (el.getAttribute('target') === undefined || el.getAttribute('target') === '') {
      el.setAttribute('target', '_blank')
    }
  }
}

function cleanNode(node) {
  let child = node.firstChild
  while (child) {
    const next = child.nextSibling
    if (child.nodeType === 1) {
      const tag = child.tagName.toLowerCase()
      if (REMOVED_TAGS.has(tag)) {
        node.removeChild(child)
      } else if (!ALLOWED_TAGS.has(tag)) {
        // 非白名单标签：保留其子节点（解包）
        while (child.firstChild) {
          node.insertBefore(child.firstChild, child)
        }
        node.removeChild(child)
      } else {
        cleanAttrs(child)
        cleanNode(child)
      }
    }
    child = next
  }
}

/**
 * 清洗不可信 HTML 字符串
 * @param {string} html 原始 HTML
 * @returns {string} 清洗后的安全 HTML
 */
export function sanitizeHtml(html) {
  if (!html) return ''
  if (typeof document === 'undefined') return ''
  try {
    const doc = new DOMParser().parseFromString(String(html), 'text/html')
    cleanNode(doc.body)
    return doc.body.innerHTML
  } catch (e) {
    // 解析失败时退化为纯文本
    return String(html).replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
}

export default sanitizeHtml
