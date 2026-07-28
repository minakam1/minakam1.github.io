import { useState } from 'react'
import { User } from 'lucide-react'
import ImageUploader from '../ImageUploader'

export default function ProfileModule({ data, isEditing, onUpdate, theme }) {
  const [localData, setLocalData] = useState(data)

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    onUpdate?.(newData)
  }

  const alignClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end'
  }

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="w-32 mx-auto">
          <ImageUploader
            value={localData.avatar}
            onChange={(src) => handleChange('avatar', src)}
            aspectRatio={1} // 头像使用1:1比例
          />
        </div>
        <input
          type="text"
          value={localData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="昵称"
        />
        <textarea
          value={localData.bio}
          onChange={(e) => handleChange('bio', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          rows={2}
          placeholder="简介"
        />
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
    )
  }

  return (
    <div className={`flex flex-col ${alignClasses[data.align]}`}>
      {data.avatar ? (
        <img
          src={data.avatar}
          alt={data.name}
          className="w-20 h-20 rounded-full object-cover mb-3"
        />
      ) : (
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
          style={{ backgroundColor: theme?.primary, opacity: 0.18 }}
        >
          <User className="w-10 h-10" style={{ color: theme?.primary }} />
        </div>
      )}
      <h3 className="text-xl font-bold" style={{ color: theme?.text }}>{data.name}</h3>
      <p className="text-sm mt-1" style={{ color: theme?.text, opacity: 0.72 }}>{data.bio}</p>
    </div>
  )
}
