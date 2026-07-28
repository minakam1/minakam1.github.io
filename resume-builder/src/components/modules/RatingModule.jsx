import { useState } from 'react'
import { Star } from 'lucide-react'

export default function RatingModule({ data, isEditing, onUpdate, theme }) {
  const [localData, setLocalData] = useState(data)

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    onUpdate?.(newData)
  }

  if (isEditing) {
    return (
      <div className="space-y-3">
        <input
          type="text"
          value={localData.label}
          onChange={(e) => handleChange('label', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="评分项名称"
        />
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            max={localData.max}
            value={localData.value}
            onChange={(e) => handleChange('value', parseInt(e.target.value) || 0)}
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <span className="text-gray-500 self-center">/</span>
          <input
            type="number"
            min="1"
            max="10"
            value={localData.max}
            onChange={(e) => handleChange('max', parseInt(e.target.value) || 5)}
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm" style={{ color: theme?.text }}>{data.label}</span>
      <div className="flex gap-1">
        {Array.from({ length: data.max }).map((_, i) => (
          <Star
            key={i}
            className="w-5 h-5"
            style={{
              color: i < data.value ? theme?.primary : 'rgba(0,0,0,0.2)',
              fill: i < data.value ? theme?.primary : 'transparent',
            }}
          />
        ))}
      </div>
      <span className="text-sm" style={{ color: theme?.text, opacity: 0.6 }}>{data.value}/{data.max}</span>
    </div>
  )
}
