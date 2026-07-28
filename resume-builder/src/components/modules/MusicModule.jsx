import { useState } from 'react'
import { Music, Loader2, AlertCircle, Pencil, X, Check } from 'lucide-react'

// 从分享链接提取歌曲信息
async function fetchSongInfo(url) {
  const neteaseMatch = url.match(/music\.163\.com.*[?&]id=(\d+)/)
  if (neteaseMatch) {
    const songId = neteaseMatch[1]
    try {
      const res = await fetch(
        `https://api.injahow.cn/meting/?server=netease&type=song&id=${songId}`
      )
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      if (data && data.length > 0) {
        const song = data[0]
        return {
          platform: 'netease',
          songId,
          title: song.name || song.title || '未知歌曲',
          artist: song.artist || song.author || '未知歌手',
          cover: song.pic || song.cover || '',
        }
      }
    } catch { /* fallback */ }
    return {
      platform: 'netease',
      songId,
      title: '歌曲 ' + songId,
      artist: '',
      cover: '',
    }
  }

  const qqMatch = url.match(/y\.qq\.com.*songDetail\/(\w+)/)
  if (qqMatch) {
    const songId = qqMatch[1]
    try {
      const res = await fetch(
        `https://api.injahow.cn/meting/?server=tencent&type=song&id=${songId}`
      )
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      if (data && data.length > 0) {
        const song = data[0]
        return {
          platform: 'qq',
          songId,
          title: song.name || song.title || '未知歌曲',
          artist: song.artist || song.author || '未知歌手',
          cover: song.pic || song.cover || '',
        }
      }
    } catch { /* fallback */ }
    return {
      platform: 'qq',
      songId,
      title: '歌曲 ' + songId,
      artist: '',
      cover: '',
    }
  }

  return null
}

export default function MusicModule({ data, isEditing, onUpdate, theme }) {
  const [localData, setLocalData] = useState(data)
  const [linkInput, setLinkInput] = useState('')
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState('')
  const [editingIndex, setEditingIndex] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [showManual, setShowManual] = useState(false)
  const [manualSong, setManualSong] = useState({ title: '', artist: '', cover: '' })

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    onUpdate?.(newData)
  }

  const songs = localData.songs || []

  const handleImportLink = async () => {
    if (!linkInput.trim()) return
    setFetching(true)
    setError('')
    try {
      const info = await fetchSongInfo(linkInput.trim())
      if (info) {
        handleChange('songs', [...songs, info])
        setLinkInput('')
      } else {
        setError('无法识别该链接，目前支持网易云音乐和QQ音乐分享链接')
      }
    } catch {
      setError('获取歌曲信息失败，请检查链接或手动填写')
    }
    setFetching(false)
  }

  const addManualSong = () => {
    if (!manualSong.title.trim()) return
    handleChange('songs', [...songs, {
      platform: 'manual',
      title: manualSong.title.trim(),
      artist: manualSong.artist.trim(),
      cover: manualSong.cover.trim(),
    }])
    setManualSong({ title: '', artist: '', cover: '' })
    setShowManual(false)
  }

  const removeSong = (index) => {
    handleChange('songs', songs.filter((_, i) => i !== index))
    if (editingIndex === index) setEditingIndex(null)
  }

  const startEdit = (index) => {
    setEditingIndex(index)
    setEditValues({ ...songs[index] })
  }

  const saveEdit = () => {
    if (editingIndex !== null) {
      handleChange('songs', songs.map((s, i) => i === editingIndex ? { ...editValues } : s))
      setEditingIndex(null)
    }
  }

  const SongItem = ({ song, index, editable }) => (
    <div
      className="flex items-center gap-3 rounded-xl p-3"
      style={{ background: `linear-gradient(135deg, ${theme?.primary || '#e5e7eb'}22, ${theme?.secondary || '#e5e7eb'}33)` }}
    >
      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: theme?.primary, opacity: 0.15 }}>
        {song.cover ? (
          <img src={song.cover} alt="" className="w-full h-full object-cover" />
        ) : (
          <Music className="w-7 h-7 m-3.5" style={{ color: theme?.primary }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        {editingIndex === index ? (
          <div className="space-y-1">
            <input
              value={editValues.title || ''}
              onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
              className="w-full px-1 py-0.5 text-sm border border-gray-300 rounded"
              placeholder="歌名"
              autoFocus
            />
            <div className="flex gap-1">
              <input
                value={editValues.artist || ''}
                onChange={(e) => setEditValues({ ...editValues, artist: e.target.value })}
                className="flex-1 px-1 py-0.5 text-xs border border-gray-300 rounded"
                placeholder="歌手"
              />
              <input
                value={editValues.cover || ''}
                onChange={(e) => setEditValues({ ...editValues, cover: e.target.value })}
                className="flex-1 px-1 py-0.5 text-xs border border-gray-300 rounded"
                placeholder="封面URL"
              />
            </div>
            <div className="flex gap-1">
              <button onClick={saveEdit} className="px-2 py-0.5 bg-green-500 text-white text-xs rounded"><Check className="w-3 h-3" /></button>
              <button onClick={() => setEditingIndex(null)} className="px-2 py-0.5 bg-gray-400 text-white text-xs rounded"><X className="w-3 h-3" /></button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium truncate" style={{ color: theme?.text }}>{song.title}</p>
            {song.artist && <p className="text-xs truncate" style={{ color: theme?.text, opacity: 0.6 }}>{song.artist}</p>}
          </>
        )}
      </div>
      {editable && editingIndex !== index && (
        <button onClick={() => startEdit(index)} className="hover:opacity-70" style={{ color: theme?.primary }} title="编辑">
          <Pencil className="w-4 h-4" />
        </button>
      )}
      {editable && (
        <button onClick={() => removeSong(index)} className="text-red-400 hover:text-red-600" title="移除">
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
            placeholder="粘贴网易云/QQ音乐分享链接"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={handleImportLink}
            disabled={fetching}
            className="px-3 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 text-sm"
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
              value={manualSong.title}
              onChange={(e) => setManualSong({ ...manualSong, title: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && addManualSong()}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
              placeholder="歌名 *"
              autoFocus
            />
            <div className="flex gap-2">
              <input
                value={manualSong.artist}
                onChange={(e) => setManualSong({ ...manualSong, artist: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && addManualSong()}
                className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded"
                placeholder="歌手（可选）"
              />
              <input
                value={manualSong.cover}
                onChange={(e) => setManualSong({ ...manualSong, cover: e.target.value })}
                className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded"
                placeholder="封面图 URL（可选）"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addManualSong}
                disabled={!manualSong.title.trim()}
                className="px-3 py-1 bg-pink-500 text-white text-xs rounded hover:bg-pink-600 disabled:opacity-50"
              >
                添加歌曲
              </button>
              <button
                onClick={() => { setShowManual(false); setManualSong({ title: '', artist: '', cover: '' }) }}
                className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {songs.length > 0 && (
          <div className="space-y-2">
            {songs.map((song, index) => (
              <SongItem key={index} song={song} index={index} editable />
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-3">
          提示：粘贴网易云或QQ音乐分享链接即可导入歌名、歌手和封面，也可点击「手动添加」直接填写。导入后可点击 <Pencil className="w-3 h-3 inline" /> 编辑，支持替换封面图。
        </p>
      </div>
    )
  }

  // 预览模式使用 data prop 而非 localData，确保与 store 同步
  const previewSongs = data.songs || []

  if (previewSongs.length === 0) {
    return (
      <div
        className="rounded-lg p-6 flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${theme?.primary || '#e5e7eb'}1a, ${theme?.secondary || '#e5e7eb'}26)` }}
      >
        <span className="text-sm" style={{ color: theme?.text, opacity: 0.5 }}>音乐列表</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {previewSongs.map((song, index) => (
        <SongItem key={index} song={song} index={index} />
      ))}
    </div>
  )
}
