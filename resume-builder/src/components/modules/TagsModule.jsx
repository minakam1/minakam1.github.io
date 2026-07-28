import { useState } from 'react'
import { X, Plus } from 'lucide-react'

export default function TagsModule({ data, isEditing, onUpdate, theme }) {
  const [localData, setLocalData] = useState(data)
  const [newTag, setNewTag] = useState('')

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    onUpdate?.(newData)
  }

  const addTag = () => {
    if (newTag.trim()) {
      handleChange('items', [...localData.items, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (index) => {
    handleChange('items', localData.items.filter((_, i) => i !== index))
  }

  const getTagStyle = () => {
    switch (data.style) {
      case 'colorful':
        return 'bg-gradient-to-r from-blue-400 to-purple-500 text-white'
      case 'outline':
        return 'bg-transparent border-2 text-current'
      default:
        return ''
    }
  }

  const getTagInlineStyle = () => {
    if (data.style === 'outline') {
      return { borderColor: theme?.primary, color: theme?.primary }
    }
    if (data.style === 'default' || !data.style) {
      return { backgroundColor: theme?.primary, color: '#ffffff' }
    }
    return {}
  }
  
  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="输入标签按回车添加"
          />
          <button
            onClick={addTag}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <select
          value={localData.style}
          onChange={(e) => handleChange('style', e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="default">默认</option>
          <option value="colorful">彩色</option>
          <option value="outline">描边</option>
        </select>
        <div className="flex flex-wrap gap-2">
          {localData.items.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
            >
              {tag}
              <button
                onClick={() => removeTag(index)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex flex-wrap gap-2">
      {data.items.map((tag, index) => (
        <span
          key={index}
          className={`px-3 py-1 rounded-full text-sm ${getTagStyle()}`}
          style={getTagInlineStyle()}
        >
          {tag}
        </span>
      ))}
    </div>
  )
}
