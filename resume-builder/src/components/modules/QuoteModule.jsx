import { useState } from 'react'
import { Quote } from 'lucide-react'

export default function QuoteModule({ data, isEditing, onUpdate, theme }) {
  const [localData, setLocalData] = useState(data)

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    onUpdate?.(newData)
  }

  if (isEditing) {
    return (
      <div className="space-y-3">
        <textarea
          value={localData.text}
          onChange={(e) => handleChange('text', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          rows={3}
          placeholder="引用内容..."
        />
        <input
          type="text"
          value={localData.author}
          onChange={(e) => handleChange('author', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="作者（可选）"
        />
      </div>
    )
  }

  return (
    <div
      className="relative pl-4 border-l-4"
      style={{ borderColor: theme?.primary }}
    >
      <Quote
        className="absolute -left-2 -top-1 w-4 h-4"
        style={{ color: theme?.primary, backgroundColor: theme?.background || '#ffffff' }}
      />
      <p className="italic" style={{ color: theme?.text }}>{data.text}</p>
      {data.author && (
        <p className="text-sm mt-2" style={{ color: theme?.text, opacity: 0.6 }}>— {data.author}</p>
      )}
    </div>
  )
}
