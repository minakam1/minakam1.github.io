import { useState } from 'react'

export default function DividerModule({ data, isEditing, onUpdate, theme }) {
  const [localData, setLocalData] = useState(data)
  
  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    onUpdate?.(newData)
  }
  
  const styleClasses = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted'
  }
  
  if (isEditing) {
    return (
      <div className="flex gap-2 items-center flex-wrap">
        <select
          value={localData.style}
          onChange={(e) => handleChange('style', e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="solid">实线</option>
          <option value="dashed">虚线</option>
          <option value="dotted">点线</option>
        </select>
        <select
          value={localData.width}
          onChange={(e) => handleChange('width', e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="100%">全宽</option>
          <option value="75%">75%</option>
          <option value="50%">50%</option>
          <option value="25%">25%</option>
        </select>
        <input
          type="color"
          value={localData.color || '#e5e7eb'}
          onChange={(e) => handleChange('color', e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-gray-300"
          title="线条颜色"
        />
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <hr
        className={`border-t-2 ${styleClasses[data.style]}`}
        style={{
          width: data.width,
          borderColor: data.color || theme?.primary || '#e5e7eb'
        }}
      />
    </div>
  )
}
