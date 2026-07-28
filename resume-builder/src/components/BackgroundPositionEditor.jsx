import { useState, useRef } from 'react'
import { Move, X, Check, RotateCcw } from 'lucide-react'

export default function BackgroundPositionEditor({ image, canvasWidth, canvasHeight, onSave, onCancel }) {
  const [position, setPosition] = useState({
    x: 50, // 百分比 0-100
    y: 50,
    scale: 1,
    ...parsePosition(image.position)
  })
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef(null)

  // 解析位置字符串为坐标
  function parsePosition(pos) {
    if (!pos) return { x: 50, y: 50 }
    
    // 处理百分比位置
    if (pos.includes('%')) {
      const parts = pos.split(' ')
      const x = parseFloat(parts[0]) || 50
      const y = parseFloat(parts[1]) || 50
      return { x, y }
    }
    
    // 处理关键词位置
    const posMap = {
      'center': { x: 50, y: 50 },
      'top': { x: 50, y: 0 },
      'bottom': { x: 50, y: 100 },
      'left': { x: 0, y: 50 },
      'right': { x: 100, y: 50 },
      'top left': { x: 0, y: 0 },
      'top right': { x: 100, y: 0 },
      'bottom left': { x: 0, y: 100 },
      'bottom right': { x: 100, y: 100 }
    }
    
    return posMap[pos] || { x: 50, y: 50 }
  }

  // 将坐标转换为CSS位置字符串
  function positionToString(x, y) {
    return `${x}% ${y}%`
  }

  // 处理拖拽开始
  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  // 处理拖拽移动
  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    // 限制在 0-100 范围内
    setPosition(prev => ({
      ...prev,
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    }))
  }

  // 处理拖拽结束
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // 处理触摸事件
  const handleTouchStart = () => {
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isDragging || !containerRef.current) return
    
    const touch = e.touches[0]
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((touch.clientX - rect.left) / rect.width) * 100
    const y = ((touch.clientY - rect.top) / rect.height) * 100

    setPosition(prev => ({
      ...prev,
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    }))
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // 保存位置
  const handleSave = () => {
    onSave(positionToString(position.x, position.y))
  }

  // 重置位置
  const handleReset = () => {
    setPosition({ x: 50, y: 50, scale: 1 })
  }

  // 快速定位按钮
  const quickPositions = [
    { label: '左上', x: 0, y: 0 },
    { label: '中上', x: 50, y: 0 },
    { label: '右上', x: 100, y: 0 },
    { label: '左中', x: 0, y: 50 },
    { label: '中心', x: 50, y: 50 },
    { label: '右中', x: 100, y: 50 },
    { label: '左下', x: 0, y: 100 },
    { label: '中下', x: 50, y: 100 },
    { label: '右下', x: 100, y: 100 },
  ]

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full flex flex-col max-h-[90vh]">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">调整背景图位置</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 预览区域 */}
        <div className="p-6 bg-gray-100 overflow-auto">
          <div className="mb-4 text-sm text-gray-600">
            提示：拖拽红色圆点调整图片位置，或点击下方快速定位按钮
          </div>
          
          {/* 画布预览 */}
          <div className="flex justify-center">
            <div
              ref={containerRef}
              className="relative bg-white shadow-lg overflow-hidden cursor-crosshair"
              style={{
                width: Math.min(canvasWidth, 300),
                height: Math.min(canvasHeight || 400, 400),
                backgroundImage: `url(${image.src})`,
                backgroundSize: image.size === 'cover' ? 'cover' : 
                               image.size === 'contain' ? 'contain' : image.size,
                backgroundPosition: `${position.x}% ${position.y}%`,
                backgroundRepeat: image.repeat
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* 网格线 */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
                <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
                <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
              </div>

              {/* 拖拽指示器 */}
              <div
                className="absolute w-6 h-6 -ml-3 -mt-3 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-move"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: isDragging ? 'scale(1.2)' : 'scale(1)',
                  transition: isDragging ? 'none' : 'transform 0.2s'
                }}
              >
                <Move className="w-3 h-3 text-white" />
              </div>

              {/* 位置标记 */}
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                X: {Math.round(position.x)}% Y: {Math.round(position.y)}%
              </div>
            </div>
          </div>

          {/* 快速定位按钮 */}
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">快速定位</p>
            <div className="grid grid-cols-3 gap-2">
              {quickPositions.map((pos) => (
                <button
                  key={pos.label}
                  onClick={() => setPosition(prev => ({ ...prev, x: pos.x, y: pos.y }))}
                  className={`px-3 py-2 text-xs rounded border transition-colors ${
                    Math.abs(position.x - pos.x) < 1 && Math.abs(position.y - pos.y) < 1
                      ? 'bg-pink-100 border-pink-300 text-pink-700'
                      : 'bg-white border-gray-200 hover:border-pink-300'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* 微调控制 */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">水平位置 (X)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={position.x}
                  onChange={(e) => setPosition(prev => ({ ...prev, x: parseFloat(e.target.value) }))}
                  className="flex-1"
                />
                <span className="text-xs text-gray-500 w-12">{Math.round(position.x)}%</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">垂直位置 (Y)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={position.y}
                  onChange={(e) => setPosition(prev => ({ ...prev, y: parseFloat(e.target.value) }))}
                  className="flex-1"
                />
                <span className="text-xs text-gray-500 w-12">{Math.round(position.y)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-between items-center px-6 py-4 border-t">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              确认
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
