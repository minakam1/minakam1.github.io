import { useState } from 'react'
import { Plus, X } from 'lucide-react'

export default function TimelineModule({ data, isEditing, onUpdate, theme }) {
  const [localData, setLocalData] = useState(data)
  const [newItem, setNewItem] = useState({ title: '', time: '', description: '' })

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    onUpdate?.(newData)
  }

  const addItem = () => {
    if (newItem.title.trim()) {
      handleChange('items', [...localData.items, { ...newItem }])
      setNewItem({ title: '', time: '', description: '' })
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
        <div className="space-y-2">
          <input
            type="text"
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="事件标题"
          />
          <input
            type="text"
            value={newItem.time}
            onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="时间（如：2024.01）"
          />
          <textarea
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            rows={2}
            placeholder="描述（可选）"
          />
          <button
            onClick={addItem}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            添加事件
          </button>
        </div>

        <div className="space-y-2">
          {localData.items.map((item, index) => (
            <div key={index} className="border rounded-lg p-2 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">事件 {index + 1}</span>
                <button
                  onClick={() => removeItem(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateItem(index, 'title', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="标题"
              />
              <input
                type="text"
                value={item.time}
                onChange={(e) => updateItem(index, 'time', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="时间"
              />
              <textarea
                value={item.description}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                rows={2}
                placeholder="描述"
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div
        className="absolute left-2 top-0 bottom-0 w-0.5"
        style={{ backgroundColor: theme?.primary, opacity: 0.25 }}
      />
      <div className="space-y-4">
        {data.items.map((item, index) => (
          <div key={index} className="relative pl-8">
            <div
              className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 shadow"
              style={{ backgroundColor: theme?.primary, borderColor: theme?.background || '#ffffff' }}
            />
            <div className="text-sm" style={{ color: theme?.text, opacity: 0.6 }}>{item.time}</div>
            <div className="font-medium" style={{ color: theme?.text }}>{item.title}</div>
            {item.description && (
              <div className="text-sm mt-1" style={{ color: theme?.text, opacity: 0.72 }}>{item.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
