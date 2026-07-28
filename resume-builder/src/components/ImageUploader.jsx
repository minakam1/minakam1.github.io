import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import ImageCropper from './ImageCropper'

export default function ImageUploader({ value, onChange, aspectRatio = null, shape = 'free' }) {
  const [isDragging, setIsDragging] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState(null)
  const inputRef = useRef(null)

  // 处理文件选择
  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = (e) => {
      // 打开裁剪界面
      setCropImageSrc(e.target.result)
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

  // 清除图片
  const handleClear = () => {
    onChange('')
  }

  // 裁剪完成
  const handleCropComplete = (croppedImage) => {
    onChange(croppedImage)
    setCropImageSrc(null)
  }

  // 取消裁剪
  const handleCropCancel = () => {
    setCropImageSrc(null)
  }

  // 如果有图片，显示预览
  if (value) {
    return (
      <div className="relative group">
        <img
          src={value}
          alt="预览"
          className="w-full h-32 object-cover rounded-lg"
        />
        <button
          onClick={handleClear}
          className="image-uploader-action absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="删除图片"
        >
          <X className="w-4 h-4" />
        </button>
        <button
          onClick={handleClick}
          className="image-uploader-action absolute bottom-2 right-2 px-3 py-2 bg-black/50 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          更换
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        {/* 裁剪弹窗 */}
        {cropImageSrc && (
          <ImageCropper
            imageSrc={cropImageSrc}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
            aspect={aspectRatio}
            shape={shape}
          />
        )}
      </div>
    )
  }

  // 空状态 - 上传区域
  return (
    <>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 cursor-pointer
          transition-colors duration-200
          ${isDragging
            ? 'border-pink-500 bg-pink-50'
            : 'border-gray-300 hover:border-pink-400 hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2 text-gray-400">
          {isDragging ? (
            <>
              <Upload className="w-8 h-8 text-pink-500" />
              <span className="text-sm text-pink-500">松开以上传</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-8 h-8" />
              <span className="text-sm">点击或拖拽上传图片</span>
              <span className="text-xs text-gray-300">支持 JPG、PNG、GIF</span>
              <span className="text-xs text-pink-400">上传后可裁剪</span>
            </>
          )}
        </div>
      </div>

      {/* 裁剪弹窗 */}
      {cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspect={aspectRatio}
          shape={shape}
        />
      )}
    </>
  )
}
