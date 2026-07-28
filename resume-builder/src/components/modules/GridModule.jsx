import { useState } from 'react'
import { Plus, X, Grid3X3 } from 'lucide-react'
import ImageUploader from '../ImageUploader'

export default function GridModule({ data, isEditing, onUpdate, theme }) {
  const [localData, setLocalData] = useState(data)

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    onUpdate?.(newData)
  }

  const updateItem = (index, field, value) => {
    const newItems = [...localData.items]
    newItems[index][field] = value
    handleChange('items', newItems)
  }

  const addItem = () => {
    handleChange('items', [...localData.items, { src: '', label: '' }])
  }

  const removeItem = (index) => {
    handleChange('items', localData.items.filter((_, i) => i !== index))
  }

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600">列数:</span>
          <select
            value={localData.columns}
            onChange={(e) => handleChange('columns', parseInt(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
          <button
            onClick={addItem}
            className="px-3 py-1 bg-pink-500 text-white rounded text-sm hover:bg-pink-600"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            添加
          </button>
        </div>

        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(localData.columns, 3)}, 1fr)` }}>
          {localData.items.map((item, index) => (
            <div key={index} className="border rounded-lg p-2 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">#{index + 1}</span>
                <button
                  onClick={() => removeItem(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <ImageUploader
                value={item.src}
                onChange={(src) => updateItem(index, 'src', src)}
              />
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateItem(index, 'label', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder="标签"
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${data.columns}, 1fr)` }}>
      {data.items.map((item, index) => (
        <div key={index} className="aspect-square relative">
          {item.src ? (
            <img
              src={item.src}
              alt={item.label}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <div
              className="w-full h-full rounded flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${theme?.primary || '#000'}33, ${theme?.secondary || '#000'}55)` }}
            >
              <Grid3X3 className="w-8 h-8" style={{ color: theme?.primary }} />
            </div>
          )}
          {item.label && (
            <div
              className="absolute bottom-0 left-0 right-0 text-xs p-1 text-center rounded-b"
              style={{ backgroundColor: theme?.primary, color: '#ffffff' }}
            >
              {item.label}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
