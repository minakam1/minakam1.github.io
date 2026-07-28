import { useState } from 'react'
import { Plus, X, Github, Twitter, MessageCircle, Video, Link2 } from 'lucide-react'

const platformIcons = {
  github: Github,
  twitter: Twitter,
  bilibili: Video,
  qq: MessageCircle,
  wechat: MessageCircle,
  weibo: MessageCircle,
  link: Link2
}

const platformNames = {
  github: 'GitHub',
  twitter: 'Twitter',
  bilibili: 'B站',
  qq: 'QQ',
  wechat: '微信',
  weibo: '微博',
  link: '链接'
}

export default function SocialModule({ data, isEditing, onUpdate, theme }) {
  const [localData, setLocalData] = useState(data)
  const [newLink, setNewLink] = useState({ platform: 'github', label: '' })
  const [editingIndex, setEditingIndex] = useState(null)

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    onUpdate?.(newData)
  }

  const addLink = () => {
    const label = newLink.label.trim() || platformNames[newLink.platform]
    handleChange('links', [...localData.links, { platform: newLink.platform, label }])
    setNewLink({ platform: 'github', label: '' })
  }

  const removeLink = (index) => {
    handleChange('links', localData.links.filter((_, i) => i !== index))
    if (editingIndex === index) setEditingIndex(null)
  }

  const updateLinkLabel = (index, label) => {
    handleChange('links', localData.links.map((l, i) =>
      i === index ? { ...l, label } : l
    ))
  }

  const getDisplayLabel = (link) => {
    return link.label || platformNames[link.platform] || link.platform
  }

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <select
            value={newLink.platform}
            onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
            className="px-2 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {Object.keys(platformNames).map(p => (
              <option key={p} value={p}>{platformNames[p]}</option>
            ))}
          </select>
          <input
            type="text"
            value={newLink.label}
            onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && addLink()}
            className="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="显示名（留空使用平台名）"
          />
          <button
            onClick={addLink}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {localData.links.map((link, index) => {
            const Icon = platformIcons[link.platform] || Link2
            return (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg group"
              >
                <Icon className="w-4 h-4" />
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={getDisplayLabel(link)}
                    onChange={(e) => updateLinkLabel(index, e.target.value)}
                    onBlur={() => setEditingIndex(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingIndex(null)}
                    className="w-16 px-1 py-0.5 border border-gray-300 rounded text-sm"
                    autoFocus
                  />
                ) : (
                  <span
                    className="text-sm cursor-pointer hover:text-pink-500"
                    onClick={() => setEditingIndex(index)}
                    title="点击编辑文字"
                  >
                    {getDisplayLabel(link)}
                  </span>
                )}
                <button
                  onClick={() => removeLink(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {data.links.map((link, index) => {
        const Icon = platformIcons[link.platform] || Link2
        return (
          <div
            key={index}
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ backgroundColor: theme?.primary, color: '#ffffff' }}
          >
            <Icon className="w-5 h-5" />
            <span className="text-sm">{getDisplayLabel(link)}</span>
          </div>
        )
      })}
    </div>
  )
}
