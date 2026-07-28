import { useState } from 'react'

export default function HeadingModule({ data, isEditing, onUpdate, theme }) {
  const [localData, setLocalData] = useState(data)

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    onUpdate?.(newData)
  }

  const sizeClasses = {
    1: 'text-2xl font-bold',
    2: 'text-xl font-semibold',
    3: 'text-lg font-medium'
  }

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        <input
          type="text"
          value={localData.text}
          onChange={(e) => handleChange('text', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="输入标题..."
        />
        <div className="flex gap-2">
          <select
            value={localData.level}
            onChange={(e) => handleChange('level', parseInt(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value={1}>大标题</option>
            <option value={2}>中标题</option>
            <option value={3}>小标题</option>
          </select>
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
      </div>
    )
  }

  return (
    <h2
      className={`${sizeClasses[data.level]} ${alignClasses[data.align]}`}
      style={{ color: theme?.text }}
    >
      {data.text}
    </h2>
  )
}
