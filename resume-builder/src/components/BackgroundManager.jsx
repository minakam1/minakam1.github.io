import { useState, useRef } from 'react'
import { Upload, X, Move, Image as ImageIcon, Crosshair, Layers } from 'lucide-react'
import BackgroundPositionEditor from './BackgroundPositionEditor'

export default function BackgroundManager({ images, onAdd, onUpdate, onRemove, canvasWidth = 360, canvasHeight = 600 }) {
  const [isDragging, setIsDragging] = useState(false)
  const [editingImage, setEditingImage] = useState(null)
  const inputRef = useRef(null)

  // 处理文件选择
  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = (e) => {
      onAdd(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  // 点击上传
  const handleClick = () => {
    inputRef.current?.click()
  }

  // 文件输入变化
  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  // 拖拽事件
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  // 位置选项
  const positionOptions = [
    { value: 'center', label: '居中' },
    { value: 'top', label: '顶部' },
    { value: 'bottom', label: '底部' },
    { value: 'left', label: '左侧' },
    { value: 'right', label: '右侧' },
    { value: 'top left', label: '左上' },
    { value: 'top right', label: '右上' },
    { value: 'bottom left', label: '左下' },
    { value: 'bottom right', label: '右下' }
  ]

  // 尺寸选项
  const sizeOptions = [
    { value: 'cover', label: '覆盖 (cover)' },
    { value: 'contain', label: '包含 (contain)' },
    { value: '100% 100%', label: '拉伸' },
    { value: 'auto', label: '原始' }
  ]

  // 重复选项
  const repeatOptions = [
    { value: 'no-repeat', label: '不重复' },
    { value: 'repeat', label: '平铺' },
    { value: 'repeat-x', label: '水平平铺' },
    { value: 'repeat-y', label: '垂直平铺' }
  ]

  // 打开位置编辑器
  const openPositionEditor = (img) => {
    setEditingImage(img)
  }

  // 保存位置
  const handlePositionSave = (newPosition) => {
    if (editingImage) {
      onUpdate(editingImage.id, { position: newPosition })
      setEditingImage(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* 上传区域 */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-brutal p-4 cursor-pointer
          transition-all duration-150
          ${isDragging
            ? 'border-coral bg-coral/10 -translate-x-px -translate-y-px shadow-brutal'
            : 'border-ink bg-paper hover:bg-butter hover:border-ink shadow-brutal-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-brutal'
          }
          active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
        <div className="flex items-center justify-center gap-2 text-ink">
          <Upload className="w-4 h-4" strokeWidth={2.5} />
          <span className="text-sm font-display font-semibold">添加背景图片</span>
        </div>
      </div>

      {/* 背景图片列表 */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-ink-300" strokeWidth={2.5} />
              <p className="text-[10px] font-display font-bold text-ink-300 uppercase tracking-widest">
                图层列表
              </p>
            </div>
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-ink text-paper text-[10px] font-mono font-bold rounded">
              {images.length}
            </span>
          </div>

          {images.map((img, index) => (
            <div
              key={img.id}
              className="bg-paper border-2 border-ink rounded-brutal shadow-brutal-sm p-3 space-y-3 animate-fade-in-up"
            >
              {/* 图片预览和删除 */}
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <img
                    src={img.src}
                    alt={`背景 ${index + 1}`}
                    className="w-16 h-16 object-cover rounded border-2 border-ink"
                  />
                  <span className="absolute -top-1.5 -left-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-ink text-paper text-[10px] font-mono font-bold rounded border-2 border-paper">
                    #{index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-display font-bold text-ink truncate">
                    背景图 {index + 1}
                  </p>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-ink-300 truncate">
                    layer · opacity {(img.opacity * 100).toFixed(0)}%
                  </p>
                </div>
                <button
                  onClick={() => onRemove(img.id)}
                  className="p-1.5 bg-paper text-coral border-2 border-ink rounded shadow-brutal-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-brutal hover:bg-coral hover:text-paper transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex-shrink-0"
                  title="删除图层"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                </button>
              </div>

              {/* 位置设置 */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-display font-bold text-ink-300 uppercase tracking-widest block mb-1">
                    位置
                  </label>
                  <div className="flex gap-1">
                    <select
                      value={img.position}
                      onChange={(e) => onUpdate(img.id, { position: e.target.value })}
                      className="select-brutal text-xs py-1.5 flex-1"
                    >
                      {positionOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => openPositionEditor(img)}
                      className="px-2 bg-butter text-ink border-2 border-ink rounded shadow-brutal-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-brutal transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex-shrink-0"
                      title="手动调整位置"
                    >
                      <Crosshair className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-display font-bold text-ink-300 uppercase tracking-widest block mb-1">
                    尺寸
                  </label>
                  <select
                    value={img.size}
                    onChange={(e) => onUpdate(img.id, { size: e.target.value })}
                    className="select-brutal text-xs py-1.5"
                  >
                    {sizeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 重复和透明度 */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-display font-bold text-ink-300 uppercase tracking-widest block mb-1">
                    重复
                  </label>
                  <select
                    value={img.repeat}
                    onChange={(e) => onUpdate(img.id, { repeat: e.target.value })}
                    className="select-brutal text-xs py-1.5"
                  >
                    {repeatOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-display font-bold text-ink-300 uppercase tracking-widest">
                      透明度
                    </label>
                    <span className="text-[10px] font-mono text-ink-300">
                      {(img.opacity * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={img.opacity}
                    onChange={(e) => onUpdate(img.id, { opacity: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 提示 */}
      {images.length === 0 && (
        <p className="text-[11px] text-ink-300 font-medium leading-relaxed">
          可添加多张背景图，<br />
          后面的图层会覆盖在前面的之上。
        </p>
      )}

      {/* 位置编辑器弹窗 */}
      {editingImage && (
        <BackgroundPositionEditor
          image={editingImage}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          onSave={handlePositionSave}
          onCancel={() => setEditingImage(null)}
        />
      )}
    </div>
  )
}
