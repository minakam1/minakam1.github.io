import { useState, useRef } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { X, Check, RotateCcw, Square, Circle, RectangleHorizontal, RectangleVertical } from 'lucide-react'

// 辅助函数：创建居中裁剪区域
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  )
}

// 形状配置
const shapeConfigs = {
  square: { aspect: 1, label: '正方形', icon: Square },
  circle: { aspect: 1, label: '圆形', icon: Circle },
  landscape: { aspect: 16/9, label: '横屏', icon: RectangleHorizontal },
  portrait: { aspect: 9/16, label: '竖屏', icon: RectangleVertical },
  free: { aspect: undefined, label: '自由', icon: Square }
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel, aspect = null, shape = 'free' }) {
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [currentShape, setCurrentShape] = useState(shape)
  const imgRef = useRef(null)
  const previewCanvasRef = useRef(null)

  // 获取当前形状的aspect
  const getCurrentAspect = () => {
    if (aspect !== null) return aspect
    return shapeConfigs[currentShape]?.aspect
  }

  // 图片加载完成
  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget
    const currentAspect = getCurrentAspect()
    if (currentAspect) {
      setCrop(centerAspectCrop(width, height, currentAspect))
    } else {
      // 自由裁剪，默认选中大部分区域
      setCrop({
        unit: '%',
        x: 5,
        y: 5,
        width: 90,
        height: 90
      })
    }
  }

  // 生成裁剪后的图片
  const generateCroppedImage = () => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) return

    const image = imgRef.current
    const canvas = previewCanvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    const pixelRatio = window.devicePixelRatio || 1

    canvas.width = completedCrop.width * scaleX * pixelRatio
    canvas.height = completedCrop.height * scaleY * pixelRatio

    ctx.scale(pixelRatio, pixelRatio)
    ctx.imageSmoothingQuality = 'high'

    const cropX = completedCrop.x * scaleX
    const cropY = completedCrop.y * scaleY
    const cropWidth = completedCrop.width * scaleX
    const cropHeight = completedCrop.height * scaleY

    ctx.save()

    // 应用旋转
    if (rotate) {
      ctx.translate(canvas.width / 2 / pixelRatio, canvas.height / 2 / pixelRatio)
      ctx.rotate((rotate * Math.PI) / 180)
      ctx.translate(-canvas.width / 2 / pixelRatio, -canvas.height / 2 / pixelRatio)
    }

    // 如果是圆形，创建圆形裁剪路径
    if (currentShape === 'circle') {
      ctx.beginPath()
      ctx.arc(
        canvas.width / 2 / pixelRatio,
        canvas.height / 2 / pixelRatio,
        Math.min(cropWidth, cropHeight) / 2,
        0,
        2 * Math.PI
      )
      ctx.closePath()
      ctx.clip()
    }

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    )

    ctx.restore()

    // 转换为 base64
    const base64Image = canvas.toDataURL('image/jpeg', 0.9)
    onCropComplete(base64Image)
  }

  // 重置
  const handleReset = () => {
    setScale(1)
    setRotate(0)
    if (imgRef.current) {
      const { width, height } = imgRef.current
      const currentAspect = getCurrentAspect()
      if (currentAspect) {
        setCrop(centerAspectCrop(width, height, currentAspect))
      } else {
        setCrop({
          unit: '%',
          x: 5,
          y: 5,
          width: 90,
          height: 90
        })
      }
    }
  }

  // 切换形状
  const handleShapeChange = (newShape) => {
    setCurrentShape(newShape)
    const shapeAspect = shapeConfigs[newShape]?.aspect
    
    if (imgRef.current && shapeAspect) {
      const { width, height } = imgRef.current
      setCrop(centerAspectCrop(width, height, shapeAspect))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">裁剪图片</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 裁剪区域 */}
        <div className="flex-1 overflow-auto p-6 bg-gray-100">
          <div className="flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={getCurrentAspect()}
              circularCrop={currentShape === 'circle'}
              className="max-w-full"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="裁剪"
                onLoad={onImageLoad}
                style={{
                  transform: `scale(${scale}) rotate(${rotate}deg)`,
                  maxHeight: '50vh',
                  maxWidth: '100%'
                }}
              />
            </ReactCrop>
          </div>
        </div>

        {/* 工具栏 */}
        <div className="px-6 py-4 border-t space-y-4">
          {/* 形状选择 */}
          {aspect === null && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">形状:</span>
              {Object.entries(shapeConfigs).map(([key, config]) => {
                const Icon = config.icon
                return (
                  <button
                    key={key}
                    onClick={() => handleShapeChange(key)}
                    className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-colors ${
                      currentShape === key
                        ? 'bg-pink-100 text-pink-700 border border-pink-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {config.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* 缩放和旋转控制 */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-gray-500">缩放</span>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-500 w-12">{Math.round(scale * 100)}%</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRotate(r => r - 90)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="向左旋转"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRotate(r => r + 90)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="向右旋转"
              >
                <RotateCcw className="w-4 h-4 scale-x-[-1]" />
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                重置
              </button>
            </div>
          </div>

          {/* 比例选择 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">比例:</span>
            <button
              onClick={() => handleShapeChange('free')}
              className={`px-3 py-1 text-sm rounded ${currentShape === 'free' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100'}`}
            >
              自由
            </button>
            <button
              onClick={() => handleShapeChange('square')}
              className={`px-3 py-1 text-sm rounded ${currentShape === 'square' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100'}`}
            >
              1:1
            </button>
            <button
              onClick={() => handleShapeChange('landscape')}
              className={`px-3 py-1 text-sm rounded ${currentShape === 'landscape' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100'}`}
            >
              16:9
            </button>
            <button
              onClick={() => handleShapeChange('portrait')}
              className={`px-3 py-1 text-sm rounded ${currentShape === 'portrait' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100'}`}
            >
              9:16
            </button>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            取消
          </button>
          <button
            onClick={generateCroppedImage}
            disabled={!completedCrop?.width || !completedCrop?.height}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            确认裁剪
          </button>
        </div>

        {/* 隐藏的 canvas 用于生成裁剪后的图片 */}
        <canvas
          ref={previewCanvasRef}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  )
}
