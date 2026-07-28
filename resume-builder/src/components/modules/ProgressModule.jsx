import { useState } from 'react'
import { Plus, X } from 'lucide-react'

// 将 hex 颜色转换为带透明度的 rgba 字符串
function hexToRgba(hex, alpha = 1) {
  if (!hex) return `rgba(0,0,0,${alpha})`
  let h = hex.replace('#', '').trim()
  if (h.length === 3) {
    h = h.split('').map(c => c + c).join('')
  }
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function ProgressModule({ data, isEditing, onUpdate, theme }) {
  const [localData, setLocalData] = useState(data)
  const [newItem, setNewItem] = useState({ label: '', value: 50 })

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    onUpdate?.(newData)
  }

  const addItem = () => {
    if (newItem.label.trim()) {
      handleChange('items', [...localData.items, { ...newItem }])
      setNewItem({ label: '', value: 50 })
    }
  }

  const removeItem = (index) => {
    handleChange('items', localData.items.filter((_, i) => i !== index))
  }

  const updateItem = (index, field, value) => {
    const newItems = [...localData.items]
    newItems[index][field] = value
    handleChange('items', newItems)
  }

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem.label}
            onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="技能名称"
          />
          <input
            type="number"
            min="0"
            max="100"
            value={newItem.value}
            onChange={(e) => setNewItem({ ...newItem, value: parseInt(e.target.value) || 0 })}
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="数值"
          />
          <button
            onClick={addItem}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={localData.showPercentage}
            onChange={(e) => handleChange('showPercentage', e.target.checked)}
            className="rounded"
          />
          显示百分比
        </label>

        <div className="space-y-2">
          {localData.items.map((item, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateItem(index, 'label', e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={item.value}
                onChange={(e) => updateItem(index, 'value', parseInt(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-gray-500 w-10">{item.value}%</span>
              <button
                onClick={() => removeItem(index)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {data.items.map((item, index) => (
        <div key={index}>
          <div className="flex justify-between text-sm mb-1">
            <span style={{ color: theme?.text }}>{item.label}</span>
            {data.showPercentage && (
              <span style={{ color: theme?.text, opacity: 0.6 }}>{item.value}%</span>
            )}
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: hexToRgba(theme?.primary, 0.18) }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${item.value}%`, backgroundColor: theme?.primary }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
