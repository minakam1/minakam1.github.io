import { useState } from 'react'

export default function TextModule({ data, isEditing, onUpdate, theme }) {
  const [localData, setLocalData] = useState(data)

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    onUpdate?.(newData)
  }

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        <textarea
          value={localData.text}
          onChange={(e) => handleChange('text', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="输入文本内容..."
        />
        <select
          value={localData.align}
          onChange={(e) => handleChange('align', e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="left">左对齐</option>
          <option value="center">居中</option>
          <option value="right">右对齐</option>
        </select>
      </div>
    )
  }

  return (
    <p
      className={`${alignClasses[data.align]} leading-relaxed whitespace-pre-wrap`}
      style={{ color: theme?.text }}
    >
      {data.text}
    </p>
  )
}
