import { useState, useMemo } from 'react'
import { Search, X, Plus, Hash } from 'lucide-react'
import { allPresetTags, presetTags } from '../../store/cardStore'

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

export default function VideoTagsModule({ data, isEditing, onUpdate, theme }) {
  const [localData, setLocalData] = useState(data)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAllPresets, setShowAllPresets] = useState(false)
  const [newTag, setNewTag] = useState('')

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    onUpdate?.(newData)
  }

  // 搜索过滤
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return allPresetTags.filter(tag => 
      tag.toLowerCase().includes(query) && 
      !localData.items.includes(tag)
    ).slice(0, 10)
  }, [searchQuery, localData.items])

  // 分类展示的标签
  const categorizedTags = useMemo(() => {
    if (showAllPresets) return presetTags
    // 只显示部分常用标签
    return {
      热门: ['原神', '崩坏：星穹铁道', '王者荣耀', '动漫', '扩列'],
      游戏: presetTags.gaming.slice(0, 8),
      兴趣: presetTags.hobbies.slice(0, 8)
    }
  }, [showAllPresets])

  const addTag = (tag) => {
    if (tag.trim() && !localData.items.includes(tag.trim())) {
      handleChange('items', [...localData.items, tag.trim()])
      setNewTag('')
      setSearchQuery('')
    }
  }

  const removeTag = (tag) => {
    handleChange('items', localData.items.filter(t => t !== tag))
  }

  // 标签颜色：在主题色 primary 上做透明度变体，保留视觉差异
  const getTagStyle = () => {
    if (!theme?.primary) return 'bg-blue-100 text-blue-700 border-blue-200'
    return ''
  }

  const getTagInlineStyle = (tag) => {
    const colors = [0.18, 0.28, 0.4, 0.55, 0.7, 0.85]
    const hash = tag.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    const alpha = colors[hash % colors.length]
    return {
      backgroundColor: hexToRgba(theme?.primary, alpha),
      color: theme?.text,
      borderColor: hexToRgba(theme?.primary, Math.min(1, alpha + 0.15)),
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-4">
        {/* 搜索添加 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery || newTag}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setNewTag(e.target.value)
            }}
            onKeyPress={(e) => e.key === 'Enter' && addTag(newTag)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="搜索标签或输入新标签..."
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setNewTag('') }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* 搜索结果 */}
        {filteredTags.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-2">搜索结果</p>
            <div className="flex flex-wrap gap-2">
              {filteredTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => addTag(tag)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  <Plus className="w-3 h-3 inline mr-1" />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 快速添加新标签 */}
        {newTag && !filteredTags.length && (
          <button
            onClick={() => addTag(newTag)}
            className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            添加 "{newTag}"
          </button>
        )}

        {/* 预设标签分类 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">推荐标签</p>
            <button
              onClick={() => setShowAllPresets(!showAllPresets)}
              className="text-xs text-blue-500 hover:text-blue-600"
            >
              {showAllPresets ? '收起' : '展开全部'}
            </button>
          </div>
          
          {Object.entries(categorizedTags).map(([category, tags]) => (
            <div key={category} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-2">{category}</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => addTag(tag)}
                    disabled={localData.items.includes(tag)}
                    className={`px-2 py-1 rounded-full text-xs transition-colors ${
                      localData.items.includes(tag)
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    {localData.items.includes(tag) ? '✓ ' : '+ '}
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 已选标签 */}
        {localData.items.length > 0 && (
          <div className="border-t pt-3">
            <p className="text-xs text-gray-500 mb-2">
              已选标签 ({localData.items.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {localData.items.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border ${getTagStyle()}`}
                  style={getTagInlineStyle(tag)}
                >
                  <Hash className="w-3 h-3 opacity-50" />
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 设置 */}
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localData.showSearch}
              onChange={(e) => handleChange('showSearch', e.target.checked)}
              className="rounded"
            />
            显示搜索框
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">最多显示:</span>
            <select
              value={localData.maxDisplay}
              onChange={(e) => handleChange('maxDisplay', parseInt(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={5}>5</option>
              <option value={8}>8</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </div>
        </div>
      </div>
    )
  }

  // 预览模式 - 类似B站视频标签样式
  const displayTags = data.items.slice(0, data.maxDisplay)
  const hasMore = data.items.length > data.maxDisplay

  return (
    <div className="flex flex-wrap gap-2">
      {displayTags.map((tag) => (
        <span
          key={tag}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border ${getTagStyle()}`}
          style={getTagInlineStyle(tag)}
        >
          <Hash className="w-3 h-3 opacity-50" />
          {tag}
        </span>
      ))}
      {hasMore && (
        <span className="px-3 py-1.5 text-sm" style={{ color: theme?.text, opacity: 0.5 }}>
          +{data.items.length - data.maxDisplay}
        </span>
      )}
    </div>
  )
}
