import { useState } from 'react'
import { Plus, X } from 'lucide-react'

export default function InfoListModule({ data, isEditing, onUpdate, theme }) {
  const [localData, setLocalData] = useState(data)
  const [newItem, setNewItem] = useState({ label: '', value: '' })
  
  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    onUpdate?.(newData)
  }
  
  const addItem = () => {
    if (newItem.label.trim() || newItem.value.trim()) {
      handleChange('items', [...localData.items, { ...newItem }])
      setNewItem({ label: '', value: '' })
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
            placeholder="标签"
          />
          <input
            type="text"
            value={newItem.value}
            onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="值"
          />
          <button
            onClick={addItem}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-2">
          {localData.items.map((item, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateItem(index, 'label', e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <span className="text-gray-400">:</span>
              <input
                type="text"
                value={item.value}
                onChange={(e) => updateItem(index, 'value', e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              />
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
    <div className="space-y-2">
      {data.items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <span className="font-medium min-w-[80px]" style={{ color: theme?.primary }}>{item.label}</span>
          <span style={{ color: theme?.text }}>{item.value}</span>
        </div>
      ))}
    </div>
  )
}
