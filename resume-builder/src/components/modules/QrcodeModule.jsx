import { useState, useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'

const quickPresets = [
  { label: '当前页面', value: typeof window !== 'undefined' ? window.location.href : '' },
  { label: '微信名片', value: 'weixin://contacts/profile/' },
  { label: 'WiFi', value: 'WIFI:S:MyWiFi;T:WPA;P:password123;;' },
]

export default function QrcodeModule({ data, isEditing, onUpdate, theme }) {
  const [localData, setLocalData] = useState(() => ({
    ...data,
    content: data.content || (typeof window !== 'undefined' ? window.location.href : '')
  }))
  const didSyncDefaultContent = useRef(false)

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    onUpdate?.(newData)
  }

  // 新模块自动填充当前页面URL，并同步到 store 一次。
  useEffect(() => {
    if (didSyncDefaultContent.current || data.content || !localData.content) return
    didSyncDefaultContent.current = true
    onUpdate?.(localData)
  }, [data.content, localData, onUpdate])

  if (isEditing) {
    return (
      <div className="space-y-3">
        <textarea
          value={localData.content}
          onChange={(e) => handleChange('content', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          rows={2}
          placeholder="输入二维码内容（URL、文本等）"
        />
        <div className="flex gap-1 flex-wrap">
          {quickPresets.map(p => (
            <button
              key={p.label}
              onClick={() => handleChange('content', p.value)}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-pink-100 rounded border border-gray-200 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={localData.label}
          onChange={(e) => handleChange('label', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="标签文字（可选）"
        />
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600">尺寸:</span>
          <input
            type="range"
            min="64"
            max="256"
            step="32"
            value={localData.size}
            onChange={(e) => handleChange('size', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-gray-500 w-12">{localData.size}px</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {data.content ? (
        <QRCodeSVG
          value={data.content}
          size={data.size}
          level="M"
          includeMargin={true}
          fgColor={theme?.text || '#0A0A0A'}
        />
      ) : (
        <div
          className="flex items-center justify-center"
          style={{ width: data.size, height: data.size, backgroundColor: theme?.primary, opacity: 0.12 }}
        >
          <span className="text-sm" style={{ color: theme?.primary, opacity: 0.6 }}>二维码</span>
        </div>
      )}
      {data.label && (
        <span className="text-sm" style={{ color: theme?.text, opacity: 0.7 }}>{data.label}</span>
      )}
    </div>
  )
}
