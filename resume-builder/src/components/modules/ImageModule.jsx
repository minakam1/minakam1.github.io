import { useState } from 'react'
import ImageUploader from '../ImageUploader'

export default function ImageModule({ data, isEditing, onUpdate, theme }) {
  const [localData, setLocalData] = useState(data)

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    onUpdate?.(newData)
  }

  const shapeClasses = {
    square: 'rounded-none',
    circle: 'rounded-full',
    rounded: 'rounded-lg'
  }

  if (isEditing) {
    return (
      <div className="space-y-3">
        <ImageUploader
          value={localData.src}
          onChange={(src) => handleChange('src', src)}
        />
        <input
          type="text"
          value={localData.alt}
          onChange={(e) => handleChange('alt', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="图片描述（可选）"
        />
        <div className="flex gap-2">
          <select
            value={localData.shape}
            onChange={(e) => handleChange('shape', e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="square">方形</option>
            <option value="circle">圆形</option>
            <option value="rounded">圆角</option>
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
        </div>
      </div>
    )
  }

  if (!data.src) {
    return (
      <div>
        <div
          className={`flex items-center justify-center ${shapeClasses[data.shape]}`}
          style={{ width: data.width, height: '150px', backgroundColor: theme?.primary, opacity: 0.12 }}
        >
          <span className="text-sm" style={{ color: theme?.primary, opacity: 0.6 }}>图片占位</span>
        </div>
        {data.alt && (
          <p className="text-xs mt-1 text-center" style={{ color: theme?.text, opacity: 0.6 }}>{data.alt}</p>
        )}
      </div>
    )
  }

  return (
    <div>
      <img
        src={data.src}
        alt={data.alt}
        className={`${shapeClasses[data.shape]} object-cover`}
        style={{ width: data.width }}
      />
      {data.alt && (
        <p className="text-xs mt-1 text-center" style={{ color: theme?.text, opacity: 0.6 }}>{data.alt}</p>
      )}
    </div>
  )
}
