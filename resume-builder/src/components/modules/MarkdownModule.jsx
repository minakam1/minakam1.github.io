import { useState, useMemo } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

// 配置 marked 安全选项
marked.setOptions({
  breaks: true,
  gfm: true,
})

export default function MarkdownModule({ data, isEditing, onUpdate, theme }) {
  const [localData, setLocalData] = useState(data)

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    onUpdate?.(newData)
  }

  const htmlContent = useMemo(() => {
    if (!localData.content) return ''
    return DOMPurify.sanitize(marked.parse(localData.content))
  }, [localData.content])

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => handleChange('content', (localData.content || '') + '\n## ')}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            title="标题"
          >
            H2
          </button>
          <button
            onClick={() => handleChange('content', (localData.content || '') + '**粗体**')}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border font-bold"
            title="粗体"
          >
            B
          </button>
          <button
            onClick={() => handleChange('content', (localData.content || '') + '*斜体*')}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border italic"
            title="斜体"
          >
            I
          </button>
          <button
            onClick={() => handleChange('content', (localData.content || '') + '\n- ')}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            title="列表"
          >
            List
          </button>
          <button
            onClick={() => handleChange('content', (localData.content || '') + '[链接](https://)')}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border text-blue-500"
            title="链接"
          >
            Link
          </button>
          <button
            onClick={() => handleChange('content', (localData.content || '') + '\n> ')}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            title="引用"
          >
            Quote
          </button>
          <button
            onClick={() => handleChange('content', (localData.content || '') + '\n---\n')}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            title="分割线"
          >
            HR
          </button>
        </div>
        <textarea
          value={localData.content}
          onChange={(e) => handleChange('content', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
          rows={8}
          placeholder="## 标题&#10;&#10;正文内容，支持 **粗体** *斜体* 等 Markdown 语法&#10;&#10;- 列表项1&#10;- 列表项2&#10;&#10;> 引用文字&#10;&#10;[链接文字](https://example.com)"
        />
        <div className="border-t pt-2">
          <span className="text-xs text-gray-400">预览:</span>
          <div
            className="mt-1 text-sm markdown-body"
            dangerouslySetInnerHTML={{ __html: htmlContent || '<span class="text-gray-300">预览区域</span>' }}
          />
        </div>
      </div>
    )
  }

  if (!data.content) {
    return (
      <div className="bg-gray-100 rounded-lg p-6 flex items-center justify-center">
        <span className="text-gray-300 text-sm">Markdown 内容</span>
      </div>
    )
  }

  return (
    <div
      className="text-sm markdown-body"
      style={{ color: theme?.text, '--md-accent': theme?.primary }}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(data.content)) }}
    />
  )
}
