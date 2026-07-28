import { useState } from 'react'
import { Loader2, AlertCircle, Tv, Star, Tag, Pencil, X, Check } from 'lucide-react'

// 从 Bangumi 链接提取作品信息
async function fetchSubjectInfo(url) {
  const match = url.match(/(?:bgm\.tv|bangumi\.tv)\/subject\/(\d+)/)
  if (!match) return null

  const subjectId = match[1]
  try {
    const res = await fetch(`https://api.bgm.tv/subject/${subjectId}`, {
      headers: { 'User-Agent': 'CanvasStudio/1.0' }
    })
    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    return {
      platform: 'bangumi',
      subjectId,
      title: data.name_cn || data.name || '未知作品',
      titleJa: data.name !== data.name_cn ? data.name : '',
      cover: data.images?.large || data.images?.common || '',
      rating: data.rating?.score || 0,
      rank: data.rank || 0,
      tags: (data.tags || []).slice(0, 5).map(t => t.name),
      type: typeMap[data.type] || data.type || '',
    }
  } catch { /* fallback */ }
  return {
    platform: 'bangumi',
    subjectId,
    title: '作品 ' + subjectId,
    titleJa: '',
    cover: '',
    rating: 0,
    rank: 0,
    tags: [],
    type: '',
  }
}

const typeMap = {
  1: '书籍', 2: '动画', 3: '音乐', 4: '游戏', 6: '三次元',
}

export default function BangumiModule({ data, isEditing, onUpdate, theme }) {
  const [localData, setLocalData] = useState(data)
  const [linkInput, setLinkInput] = useState('')
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState('')
  const [editingIndex, setEditingIndex] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [showManual, setShowManual] = useState(false)
  const [manualItem, setManualItem] = useState({ title: '', titleJa: '', type: '', cover: '', rating: 0 })

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    onUpdate?.(newData)
  }

  const items = localData.items || []

  const handleImportLink = async () => {
    if (!linkInput.trim()) return
    setFetching(true)
    setError('')
    try {
      const info = await fetchSubjectInfo(linkInput.trim())
      if (info) {
        handleChange('items', [...items, info])
        setLinkInput('')
      } else {
        setError('无法识别该链接，目前支持 bgm.tv/subject/xxx 格式')
      }
    } catch {
      setError('获取作品信息失败，请检查链接')
    }
    setFetching(false)
  }

  const addManualItem = () => {
    if (!manualItem.title.trim()) return
    handleChange('items', [...items, {
      platform: 'manual',
      title: manualItem.title.trim(),
      titleJa: manualItem.titleJa.trim(),
      type: manualItem.type.trim(),
      cover: manualItem.cover.trim(),
      rating: parseFloat(manualItem.rating) || 0,
      rank: 0,
      tags: [],
    }])
    setManualItem({ title: '', titleJa: '', type: '', cover: '', rating: 0 })
    setShowManual(false)
  }

  const removeItem = (index) => {
    handleChange('items', items.filter((_, i) => i !== index))
    if (editingIndex === index) setEditingIndex(null)
  }

  const startEdit = (index) => {
    setEditingIndex(index)
    setEditValues({ ...items[index] })
  }

  const saveEdit = () => {
    if (editingIndex !== null) {
      handleChange('items', items.map((s, i) => i === editingIndex ? { ...editValues } : s))
      setEditingIndex(null)
    }
  }

  const SubjectItem = ({ item, index, editable }) => (
    <div
      className="flex items-start gap-3 rounded-xl p-3"
      style={{ background: `linear-gradient(135deg, ${theme?.primary || '#e5e7eb'}1a, ${theme?.secondary || '#e5e7eb'}26)` }}
    >
      <div
        className="w-14 h-20 rounded-lg overflow-hidden flex-shrink-0"
        style={{ backgroundColor: theme?.primary, opacity: 0.15 }}
      >
        {item.cover ? (
          <img src={item.cover} alt="" className="w-full h-full object-cover" />
        ) : (
          <Tv className="w-7 h-7 m-3.5 mt-6" style={{ color: theme?.primary }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        {editingIndex === index ? (
          <div className="space-y-1">
            <input
              value={editValues.title || ''}
              onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
              className="w-full px-1 py-0.5 text-sm border border-gray-300 rounded"
              placeholder="作品名"
              autoFocus
            />
            <div className="flex gap-1">
              <input
                value={editValues.titleJa || ''}
                onChange={(e) => setEditValues({ ...editValues, titleJa: e.target.value })}
                className="flex-1 px-1 py-0.5 text-xs border border-gray-300 rounded"
                placeholder="日文名"
              />
              <input
                value={editValues.type || ''}
                onChange={(e) => setEditValues({ ...editValues, type: e.target.value })}
                className="w-14 px-1 py-0.5 text-xs border border-gray-300 rounded"
                placeholder="类型"
              />
            </div>
            <div className="flex gap-1">
              <input
                value={editValues.cover || ''}
                onChange={(e) => setEditValues({ ...editValues, cover: e.target.value })}
                className="flex-1 px-1 py-0.5 text-xs border border-gray-300 rounded"
                placeholder="封面URL"
              />
              <input
                value={editValues.rating || ''}
                onChange={(e) => setEditValues({ ...editValues, rating: parseFloat(e.target.value) || 0 })}
                className="w-14 px-1 py-0.5 text-xs border border-gray-300 rounded"
                placeholder="评分"
              />
            </div>
            <div className="flex gap-1">
              <button onClick={saveEdit} className="px-2 py-0.5 bg-green-500 text-white text-xs rounded"><Check className="w-3 h-3" /></button>
              <button onClick={() => setEditingIndex(null)} className="px-2 py-0.5 bg-gray-400 text-white text-xs rounded"><X className="w-3 h-3" /></button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium leading-snug line-clamp-2" style={{ color: theme?.text }}>{item.title}</p>
            {item.titleJa && <p className="text-xs truncate mt-0.5" style={{ color: theme?.text, opacity: 0.6 }}>{item.titleJa}</p>}
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {item.type && <span className="text-xs" style={{ color: theme?.text, opacity: 0.6 }}>{item.type}</span>}
              {item.rating > 0 && (
                <span className="text-xs flex items-center gap-0.5" style={{ color: theme?.primary }}>
                  <Star className="w-3 h-3 fill-current" />
                  {item.rating.toFixed(1)}
                </span>
              )}
              {item.tags?.length > 0 && (
                <span className="text-xs flex items-center gap-0.5" style={{ color: theme?.text, opacity: 0.6 }}>
                  <Tag className="w-3 h-3" />
                  {item.tags.slice(0, 3).join(' / ')}
                </span>
              )}
            </div>
          </>
        )}
      </div>
      {editable && editingIndex !== index && (
        <button onClick={() => startEdit(index)} className="hover:opacity-70 mt-1" style={{ color: theme?.primary }} title="编辑">
          <Pencil className="w-4 h-4" />
        </button>
      )}
      {editable && (
        <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600 mt-1" title="移除">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleImportLink()}
            placeholder="粘贴 Bangumi 链接 (bgm.tv/subject/xxx)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={handleImportLink}
            disabled={fetching}
            className="px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 text-sm"
          >
            {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : '导入'}
          </button>
          <button
            onClick={() => setShowManual(!showManual)}
            className={`px-3 py-2 rounded-lg text-sm border ${
              showManual
                ? 'bg-gray-700 text-white border-gray-700'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          >
            手动添加
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />{error}
          </p>
        )}

        {showManual && (
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <input
              value={manualItem.title}
              onChange={(e) => setManualItem({ ...manualItem, title: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && addManualItem()}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
              placeholder="作品名 *"
              autoFocus
            />
            <div className="flex gap-2">
              <input
                value={manualItem.titleJa}
                onChange={(e) => setManualItem({ ...manualItem, titleJa: e.target.value })}
                className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded"
                placeholder="原名 / 日文名（可选）"
              />
              <input
                value={manualItem.type}
                onChange={(e) => setManualItem({ ...manualItem, type: e.target.value })}
                className="w-24 px-2 py-1.5 text-xs border border-gray-300 rounded"
                placeholder="类型（可选）"
              />
            </div>
            <div className="flex gap-2">
              <input
                value={manualItem.cover}
                onChange={(e) => setManualItem({ ...manualItem, cover: e.target.value })}
                className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded"
                placeholder="封面图 URL（可选）"
              />
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={manualItem.rating || ''}
                onChange={(e) => setManualItem({ ...manualItem, rating: parseFloat(e.target.value) || 0 })}
                className="w-20 px-2 py-1.5 text-xs border border-gray-300 rounded"
                placeholder="评分"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addManualItem}
                disabled={!manualItem.title.trim()}
                className="px-3 py-1 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600 disabled:opacity-50"
              >
                添加作品
              </button>
              <button
                onClick={() => { setShowManual(false); setManualItem({ title: '', titleJa: '', type: '', cover: '', rating: 0 }) }}
                className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="space-y-2">
            {items.map((item, index) => (
              <SubjectItem key={index} item={item} index={index} editable />
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400">
          提示：直接粘贴 Bangumi 番组链接即可导入，也可点击「手动添加」自己填写。导入后可点击 <Pencil className="w-3 h-3 inline" /> 编辑各项信息，支持上传自定义封面。
        </p>
      </div>
    )
  }

  // 预览模式使用 data prop 而非 localData，确保与 store 同步
  const previewItems = data.items || []

  if (previewItems.length === 0) {
    return (
      <div
        className="rounded-lg p-6 flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${theme?.primary || '#e5e7eb'}1a, ${theme?.secondary || '#e5e7eb'}26)` }}
      >
        <span className="text-sm" style={{ color: theme?.text, opacity: 0.5 }}>作品列表</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {previewItems.map((item, index) => (
        <SubjectItem key={index} item={item} index={index} />
      ))}
    </div>
  )
}
