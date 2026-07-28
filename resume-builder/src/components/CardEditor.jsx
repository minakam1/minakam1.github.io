import { useState, useRef, useEffect } from 'react'
import { useCardStore, moduleTemplates } from '../store/cardStore'
import ModuleRenderer from './modules/ModuleRenderer'
import BackgroundManager from './BackgroundManager'
import {
  Plus, Trash2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Download, Copy, Undo2, Redo2, Palette, Layout,
  Type, Image, User, List, Clock, BarChart3, Tags,
  Star, Trophy, Grid3X3, Quote, Share2, QrCode,
  Heading, Type as TypeIcon, Minus, FileCode, Hash,
  Columns, Smartphone, GripVertical, Pencil, X, Music, Tv,
  Sparkles, MonitorSmartphone, FileText, Layers, Settings2, AlertTriangle,
  Check
} from 'lucide-react'
import { toPng } from 'html-to-image'

// DnD Kit 导入
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const iconMap = {
  Heading, Type: TypeIcon, Minus, Image, User, List, Clock,
  BarChart: BarChart3, Tag: Tags, Hash, Star, Trophy, Grid: Grid3X3,
  Quote, Share2, QrCode: QrCode, Columns, Music, Tv
}

// 可排序模块项组件
function SortableModuleItem({ module, index, editingModule, setEditingModule, removeModule, updateModule }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: module.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      data-module-id={module.id}
      style={style}
      className={`module-card ${
        editingModule === module.id ? 'module-card-editing' : ''
      } ${isDragging ? 'module-card-drag' : ''}`}
    >
      {/* 模块头部 */}
      <div className="flex items-center justify-between px-3 py-2 border-b-2 border-ink">
        <div className="flex items-center gap-2 min-w-0">
          {/* 拖拽手柄 */}
          <button
            {...attributes}
            {...listeners}
            className="p-1.5 sm:p-1 min-w-[32px] min-h-[32px] sm:min-w-0 sm:min-h-0 flex items-center justify-center hover:bg-butter border-2 border-transparent hover:border-ink rounded cursor-grab active:cursor-grabbing transition-colors touch-none"
            aria-label="拖拽排序"
          >
            <GripVertical className="w-4 h-4 text-ink" />
          </button>
          <span className="inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 bg-ink text-paper text-[10px] font-mono font-bold rounded">
            #{String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-sm font-display font-semibold text-ink truncate">
            {moduleTemplates[module.type]?.name || module.type}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setEditingModule(
              editingModule === module.id ? null : module.id
            )}
            className={`p-1.5 border-2 rounded transition-all ${
              editingModule === module.id
                ? 'bg-coral text-paper border-ink shadow-brutal-sm'
                : 'bg-paper text-ink border-ink hover:bg-butter shadow-brutal-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-brutal'
            } active:translate-x-[1px] active:translate-y-[1px] active:shadow-none`}
            title={editingModule === module.id ? '收起编辑' : '编辑模块'}
          >
            {editingModule === module.id ? (
              <X className="w-3.5 h-3.5" />
            ) : (
              <Pencil className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={() => removeModule(module.id)}
            className="p-1.5 bg-paper text-coral border-2 border-ink rounded shadow-brutal-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-brutal hover:bg-coral hover:text-paper transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            title="删除模块"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 模块内容 */}
      <div className="p-4">
        <ModuleRenderer
          module={module}
          isEditing={editingModule === module.id}
          onUpdate={(newData) => updateModule(module.id, newData)}
        />
      </div>
    </div>
  )
}

export default function CardEditor() {
  const {
    project,
    addModule,
    updateModule,
    removeModule,
    reorderModules,
    undo,
    redo,
    historyIndex,
    canUndo,
    canRedo,
    exportToCode,
    updateCanvas,
    updateStyle,
    addBackgroundImage,
    updateBackgroundImage,
    removeBackgroundImage
  } = useCardStore()

  const [editingModule, setEditingModule] = useState(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportCode, setExportCode] = useState('')
  const [showImportModal, setShowImportModal] = useState(false)
  const [importCode, setImportCode] = useState('')
  const [activeTab, setActiveTab] = useState('modules') // modules, background, style
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768
  )
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth >= 768
  )
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showMobilePreview, setShowMobilePreview] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 })
  const [saveState, setSaveState] = useState('已保存')
  const [toast, setToast] = useState('')
  const { customFontName, customFontData } = project.style

  // 恢复已保存的自定义字体
  useEffect(() => {
    if (customFontName && customFontData) {
      const styleId = 'custom-font-style'
      let styleEl = document.getElementById(styleId)
      if (!styleEl) {
        styleEl = document.createElement('style')
        styleEl.id = styleId
        document.head.appendChild(styleEl)
      }
      styleEl.textContent = `@font-face { font-family: "${customFontName}"; src: url(${customFontData}) format("truetype"); }`
    }
  }, [customFontName, customFontData])
  const canvasRef = useRef(null)
  const mobileCanvasRef = useRef(null)

  const layoutMode = project.canvas.layoutMode || 'mobile'
  // 手机模式按 19.5:9 分屏，网页模式按 A4（210:297）分页
  const pageUnitHeight = Math.round(
    (previewSize.width || project.canvas.width) * (layoutMode === 'web' ? 297 / 210 : 19.5 / 9)
  )
  const pageBreaks = Array.from(
    { length: Math.max(0, Math.ceil(previewSize.height / pageUnitHeight) - 1) },
    (_, index) => (index + 1) * pageUnitHeight
  )

  useEffect(() => {
    if (!canvasRef.current) return

    const updatePreviewSize = () => {
      setPreviewSize({
        width: canvasRef.current?.offsetWidth ?? 0,
        height: canvasRef.current?.offsetHeight ?? 0,
      })
    }
    const observer = new ResizeObserver(updatePreviewSize)
    observer.observe(canvasRef.current)
    updatePreviewSize()

    return () => observer.disconnect()
  }, [])

  // 响应窗口尺寸变化：同步移动端判定与侧边栏默认开合
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // 桌面端保证侧边栏默认展开，移动端保持当前用户选择
      if (!mobile) setSidebarOpen(true)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 移动端：侧边栏 / 预览 / 弹窗打开时锁定 body 滚动
  useEffect(() => {
    if (!isMobile) return
    const locked = sidebarOpen || showMobilePreview || showExportModal || showImportModal || showClearConfirm
    const prev = document.body.style.overflow
    document.body.style.overflow = locked ? 'hidden' : ''
    return () => { document.body.style.overflow = prev }
  }, [isMobile, sidebarOpen, showMobilePreview, showExportModal, showImportModal, showClearConfirm])

  // 显示本地自动保存状态
  useEffect(() => {
    const savingTimer = setTimeout(() => setSaveState('保存中'), 0)
    const timer = setTimeout(() => setSaveState('已保存'), 450)
    return () => {
      clearTimeout(savingTimer)
      clearTimeout(timer)
    }
  }, [project.updatedAt])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2400)
    return () => clearTimeout(timer)
  }, [toast])

  // 提供桌面端常用撤销/重做快捷键
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'z') return
      const target = event.target
      if (target instanceof HTMLElement && target.isContentEditable) return
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return
      event.preventDefault()
      if (event.shiftKey) redo()
      else undo()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [redo, undo])

  // 配置传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 处理拖拽结束
  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = project.modules.findIndex(m => m.id === active.id)
    const newIndex = project.modules.findIndex(m => m.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    reorderModules(arrayMove(project.modules, oldIndex, newIndex))
  }

  const [isExporting, setIsExporting] = useState(false)

  // 导出图片
  const exportImage = async (targetRef = canvasRef) => {
    if (!targetRef.current) {
      setToast('预览区域未就绪，请稍后重试')
      return
    }
    setIsExporting(true)
    try {
      const el = targetRef.current
      const dataUrl = await toPng(el, {
        pixelRatio: 2,
        skipAutoScale: true,
        cacheBust: true,
        filter: (node) => !node.classList?.contains('page-break-hint'),
      })
      const link = document.createElement('a')
      link.download = `card-${Date.now()}.png`
      link.href = dataUrl
      link.click()
      setIsExporting(false)
    } catch (e) {
      console.error('导出图片失败:', e)
      setToast('导出图片失败，请稍后重试')
      setIsExporting(false)
    }
  }

  const handleMobileExport = () => {
    setShowMobilePreview(true)
    setTimeout(() => exportImage(mobileCanvasRef), 120)
  }

  // 导出短码
  const handleExportCode = () => {
    const code = exportToCode()
    setExportCode(code)
    setShowExportModal(true)
  }

  // 复制短码
  const copyCode = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(exportCode)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = exportCode
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        textarea.remove()
      }
      setToast('已复制到剪贴板')
    } catch {
      setToast('复制失败，请手动长按复制')
    }
  }

  // 导入短码
  const handleImportCode = () => {
    const success = useCardStore.getState().importFromCode(importCode)
    if (success) {
      setToast('导入成功')
      setShowImportModal(false)
      setImportCode('')
    } else {
      setToast('导入失败，请检查代码格式')
    }
  }

  // 模块分类
  const moduleCategories = [
    {
      name: '基础',
      icon: Layers,
      modules: ['heading', 'text', 'markdown', 'divider', 'image']
    },
    {
      name: '信息',
      icon: User,
      modules: ['profile', 'infoList', 'timeline', 'progress']
    },
    {
      name: '展示',
      icon: Sparkles,
      modules: ['tags', 'videoTags', 'rating', 'tierList', 'grid', 'quote', 'bangumi', 'music']
    },
    {
      name: '社交',
      icon: Share2,
      modules: ['social', 'qrcode']
    }
  ]

  // 渲染模块图标
  const renderIcon = (iconName) => {
    const Icon = iconMap[iconName]
    return Icon ? <Icon className="w-4 h-4" /> : <FileCode className="w-4 h-4" />
  }

  const addAndFocusModule = (moduleType) => {
    const moduleId = addModule(moduleType)
    if (!moduleId) return
    setEditingModule(moduleId)
    if (isMobile) setSidebarOpen(false)
    setTimeout(() => {
      document.querySelector(`[data-module-id="${moduleId}"]`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }, 0)
  }

  // ===== 风格预设（只通过现有 updateCanvas + updateStyle 改状态） =====
  const stylePresets = [
    {
      id: 'cream',
      name: '奶油米',
      en: 'CREAM',
      bg: '#FAF8F4',
      bg2: '#F2EEE6',
      primary: '#0A0A0A',
      text: '#0A0A0A',
      gradient: false,
      mood: '温柔 · 干净',
    },
    {
      id: 'sakura',
      name: '樱花粉',
      en: 'SAKURA',
      bg: '#FFE4EC',
      bg2: '#FFB1BF',
      primary: '#FF2E55',
      text: '#2A0E15',
      gradient: false,
      mood: '少女 · 元气',
    },
    {
      id: 'mori',
      name: '莫兰迪',
      en: 'MORI',
      bg: '#E8E2D5',
      bg2: '#C5C0B0',
      primary: '#525252',
      text: '#2A2A2A',
      gradient: false,
      mood: '高级 · 安静',
    },
    {
      id: 'mint',
      name: '薄荷绿',
      en: 'MINT',
      bg: '#DCEFE3',
      bg2: '#B5DBC0',
      primary: '#2E7D32',
      text: '#0F2818',
      gradient: false,
      mood: '清爽 · 治愈',
    },
    {
      id: 'sunset',
      name: '黄昏渐变',
      en: 'SUNSET',
      bg: '#FFB088',
      bg2: '#FF5470',
      primary: '#C4173A',
      text: '#2A0E15',
      gradient: true,
      mood: '热烈 · 浪漫',
    },
    {
      id: 'midnight',
      name: '午夜深紫',
      en: 'MIDNIGHT',
      bg: '#1A1530',
      bg2: '#3A2D5C',
      primary: '#B49AFF',
      text: '#FAF8F4',
      gradient: false,
      mood: '沉静 · 神秘',
    },
  ]

  // 应用预设：覆盖背景/辅色/主题/文字；保留画布尺寸、padding、border 等其他设置
  const applyPreset = (preset) => {
    updateCanvas({
      background: { ...project.canvas.background, type: preset.gradient ? 'gradient' : 'solid' }
    })
    updateStyle({
      colors: {
        ...project.style.colors,
        background: preset.bg,
        secondary: preset.bg2,
        primary: preset.primary,
        text: preset.text,
      },
    })
  }

  // 判断当前是否命中某个预设（只比 background + primary，命中高亮）
  const isPresetActive = (preset) =>
    project.style.colors.background.toUpperCase() === preset.bg.toUpperCase() &&
    project.style.colors.primary.toUpperCase() === preset.primary.toUpperCase() &&
    (project.canvas.background.type === (preset.gradient ? 'gradient' : 'solid'))

  // 画布宽度选项
  const canvasWidths = [
    { name: '360 标准', width: 360 },
    { name: '375 大屏', width: 375 },
    { name: '320 小屏', width: 320 },
    { name: '414 超大', width: 414 },
  ]

  // 生成背景样式（不含图片，图片用 DOM 层渲染以支持逐层透明度）
  const generateBackgroundStyle = () => {
    const { background } = project.canvas

    if (background.type === 'gradient') {
      return {
        background: `linear-gradient(135deg, ${project.style.colors.background}, ${project.style.colors.secondary})`
      }
    }

    return {
      backgroundColor: project.style.colors.background
    }
  }

  const tabMeta = {
    modules: { label: '模块', icon: Layers },
    background: { label: '背景', icon: Palette },
    style: { label: '样式', icon: Settings2 },
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-canvas noise-canvas overflow-hidden">
      {/* ===== 顶部工具栏 ===== */}
      <header className="relative bg-ink text-paper border-b-2 border-ink z-30 header-shine">
        <div className="app-header-inner flex items-center justify-between h-16 gap-3 px-4">
          {/* 左：品牌 + 撤销/重做 */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="relative w-9 h-9 bg-coral border-2 border-paper rounded-brutal shadow-brutal-butter flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-paper" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <h1 className="text-base font-display font-extrabold text-paper tracking-tight truncate">
                    Canvas<span className="text-butter">.</span>Studio
                  </h1>
                </div>
                <span className="hidden sm:block text-[10px] font-mono uppercase tracking-widest text-paper/50 truncate">
                  Mobile · Type · Maker
                </span>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-paper/15 mx-1" />

            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={undo}
                disabled={!canUndo()}
                className="btn-brutal-ghost"
                title="撤销 (⌘Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo()}
                className="btn-brutal-ghost"
                title="重做 (⌘⇧Z)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 右：操作按钮 */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* 移动端：移动端专用撤销/重做 */}
            {isMobile && (
              <div className="flex items-center gap-1">
                <button
                  onClick={undo}
                  disabled={!canUndo()}
                  className="btn-brutal-ghost p-2"
                  title="撤销"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={redo}
                  disabled={!canRedo()}
                  className="btn-brutal-ghost p-2"
                  title="重做"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* 移动端：预览入口 */}
            {isMobile && (
              <button
                onClick={() => setShowMobilePreview(true)}
                className="btn-brutal !bg-ink-700 !text-paper/80 !border-paper/30 hover:!bg-paper hover:!text-ink hover:!border-paper p-2"
                title="预览"
                aria-label="预览"
              >
                <MonitorSmartphone className="w-4 h-4" />
              </button>
            )}

            {/* 桌面端：清空 / 导入 / 导出码 */}
            <button
              onClick={() => setShowClearConfirm(true)}
              className="hidden sm:inline-flex btn-brutal !bg-ink-700 !text-paper/80 !border-paper/30 hover:!bg-coral hover:!text-paper hover:!border-paper"
            >
              <Trash2 className="w-3.5 h-3.5" />
              清空
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="hidden sm:inline-flex btn-brutal !bg-ink-700 !text-paper/80 !border-paper/30 hover:!bg-paper hover:!text-ink hover:!border-paper"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden md:inline">导入</span>
            </button>
            <button
              onClick={handleExportCode}
              className="hidden sm:inline-flex btn-brutal !bg-ink-700 !text-paper/80 !border-paper/30 hover:!bg-paper hover:!text-ink hover:!border-paper"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span className="hidden md:inline">导出码</span>
            </button>

            {/* 移动端：更多菜单（清空/导入/导出码） */}
            {isMobile && (
              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(v => !v)}
                  className={`btn-brutal-ghost p-2 ${showMoreMenu ? '!bg-paper/10 !border-paper/30' : ''}`}
                  title="更多"
                  aria-expanded={showMoreMenu}
                >
                  <Layout className="w-4 h-4" />
                </button>
                {showMoreMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowMoreMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 z-40 min-w-[140px] bg-paper border-2 border-ink rounded-brutal shadow-brutal overflow-hidden animate-pop-in">
                      <button
                        onClick={() => { setShowImportModal(true); setShowMoreMenu(false) }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-display font-semibold text-ink hover:bg-butter border-b-2 border-ink-200"
                      >
                        <FileText className="w-4 h-4" strokeWidth={2.5} />
                        导入
                      </button>
                      <button
                        onClick={() => { handleExportCode(); setShowMoreMenu(false) }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-display font-semibold text-ink hover:bg-butter border-b-2 border-ink-200"
                      >
                        <FileCode className="w-4 h-4" strokeWidth={2.5} />
                        导出码
                      </button>
                      <button
                        onClick={() => { setShowClearConfirm(true); setShowMoreMenu(false) }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-display font-semibold text-coral hover:bg-coral hover:text-paper"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                        清空
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <button
              onClick={isMobile ? handleMobileExport : exportImage}
              disabled={isExporting}
              className="btn-brutal-primary !px-3 sm:!px-4"
              title="导出图片"
              aria-label="导出图片"
            >
              {isExporting ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-paper/30 border-t-paper rounded-full animate-spin" />
                  <span className="hidden sm:inline">导出中</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" strokeWidth={2.5} />
                  <span className="hidden sm:inline">导出图片</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ===== 主编辑区 ===== */}
      <div className="flex-1 flex overflow-hidden relative editor-main">
        {/* 移动端：Drawer 背景遮罩（侧边栏打开时） */}
        {isMobile && sidebarOpen && (
          <div
            className="drawer-backdrop"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* 侧边栏切换按钮 */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="sidebar-toggle flex-shrink-0 w-7 flex items-center justify-center bg-paper hover:bg-butter border-r-2 border-ink z-10 transition-colors"
          title={sidebarOpen ? '收起侧边栏' : '展开侧边栏'}
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-4 h-4 text-ink" strokeWidth={2.5} />
          ) : (
            <ChevronRight className="w-4 h-4 text-ink" strokeWidth={2.5} />
          )}
        </button>

        {/* ===== 左侧边栏 ===== */}
        <aside
          className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
          aria-hidden={isMobile && !sidebarOpen}
        >
          {/* 移动端：侧边栏顶部关闭按钮 */}
          {isMobile && (
            <div className="flex items-center justify-between px-4 py-2.5 bg-ink text-paper border-b-2 border-ink">
              <span className="text-[11px] font-mono uppercase tracking-widest text-paper/70">
                {tabMeta[activeTab]?.label || ''} · 工具
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="inline-flex items-center justify-center w-11 h-11 bg-paper/10 border-2 border-paper/30 rounded-brutal text-paper hover:bg-paper hover:text-ink hover:border-paper transition-colors"
                title="关闭"
                aria-label="关闭侧边栏"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          )}
          {/* Tab 切换（黑底） */}
          <div className="flex bg-ink border-b-2 border-ink">
            {Object.entries(tabMeta).map(([key, meta]) => {
              const TabIcon = meta.icon
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`tab-brutal flex items-center justify-center gap-1.5 ${activeTab === key ? 'tab-brutal-active' : ''}`}
                >
                  <TabIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span>{meta.label}</span>
                </button>
              )
            })}
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-y-auto bg-paper">
            {activeTab === 'modules' && (
              <div className="p-4">
                <div className="flex items-baseline justify-between mb-3">
                  <h2 className="text-xs font-display font-extrabold text-ink uppercase tracking-wider">
                    添加模块
                  </h2>
                  <span className="text-[10px] font-mono text-ink-300">
                    {project.modules.length} 个已添加
                  </span>
                </div>

                {moduleCategories.map((category, ci) => {
                  const CatIcon = category.icon
                  return (
                    <div key={category.name} className="mb-5">
                      <div className="flex items-center gap-1.5 mb-2">
                        <CatIcon className="w-3 h-3 text-ink-300" strokeWidth={2.5} />
                        <h3 className="text-[11px] font-display font-bold text-ink-300 uppercase tracking-widest">
                          {category.name}
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {category.modules.map((moduleType, mi) => {
                          const template = moduleTemplates[moduleType]
                          return (
                            <button
                              key={moduleType}
                              onClick={() => addAndFocusModule(moduleType)}
                              className="module-tile"
                              style={{ animationDelay: `${(ci * 4 + mi) * 25}ms` }}
                            >
                              {renderIcon(template.icon)}
                              <span className="text-[11px] font-display font-semibold text-ink">
                                {template.name}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {activeTab === 'background' && (
              <div className="p-4">
                <h2 className="text-xs font-display font-extrabold text-ink uppercase tracking-wider mb-3">
                  背景设置
                </h2>

                {/* 风格预设 */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-display font-bold text-ink-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" strokeWidth={2.5} />
                      风格预设
                    </label>
                    <span className="text-[10px] font-mono text-ink-300">
                      {stylePresets.length} 套
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {stylePresets.map((preset) => {
                      const active = isPresetActive(preset)
                      const swatchBg = preset.gradient
                        ? `linear-gradient(135deg, ${preset.bg} 0%, ${preset.bg2} 100%)`
                        : preset.bg
                      return (
                        <button
                          key={preset.id}
                          onClick={() => applyPreset(preset)}
                          className={`group relative flex flex-col items-stretch text-left
                                      bg-paper border-2 rounded-brutal
                                      shadow-brutal-sm
                                      transition-all duration-100 ease-out
                                      active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
                                      ${active
                                        ? 'border-ink shadow-brutal -translate-x-px -translate-y-px'
                                        : 'border-ink hover:-translate-x-px hover:-translate-y-px hover:shadow-brutal'}`}
                          title={preset.mood}
                        >
                          {/* 颜色预览 */}
                          <div
                            className="relative h-12 border-b-2 border-ink overflow-hidden rounded-t-[4px]"
                            style={{ background: swatchBg }}
                          >
                            {/* 模拟模块点缀（小白卡 + 主题色小条） */}
                            <div className="absolute inset-0 flex items-center justify-center gap-1">
                              <span className="w-7 h-2 bg-paper border border-ink rounded-sm" />
                              <span
                                className="w-3 h-2 border border-ink rounded-sm"
                                style={{ background: preset.primary }}
                              />
                            </div>
                            {/* 选中标记 */}
                            {active && (
                              <div className="absolute top-1 right-1 w-4 h-4 bg-ink border-2 border-paper rounded-full flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-paper" strokeWidth={3.5} />
                              </div>
                            )}
                            {/* EN 标 */}
                            <span
                              className="absolute bottom-1 left-1.5 text-[8px] font-mono font-extrabold tracking-widest"
                              style={{ color: preset.text, opacity: 0.55 }}
                            >
                              {preset.en}
                            </span>
                          </div>
                          {/* 文案 */}
                          <div className="px-2 py-1.5 flex items-center justify-between">
                            <span className="text-[11px] font-display font-bold text-ink truncate">
                              {preset.name}
                            </span>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              <span
                                className="w-2 h-2 rounded-full border border-ink"
                                style={{ background: preset.primary }}
                              />
                              <span
                                className="w-2 h-2 rounded-full border border-ink"
                                style={{ background: preset.bg2 }}
                              />
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  <p className="mt-2 text-[10px] font-mono text-ink-300 leading-relaxed">
                    一键应用：背景 / 辅色 / 主题 / 文字。画布尺寸与圆角保持不变。
                  </p>
                </div>

                {/* 排版模式 */}
                <div className="mb-5">
                  <label className="text-[10px] font-display font-bold text-ink-300 uppercase tracking-widest block mb-2">
                    排版模式
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateCanvas({ layoutMode: 'mobile' })}
                      className={`chip-select flex items-center justify-center gap-1.5 ${layoutMode === 'mobile' ? 'chip-select-active' : ''}`}
                    >
                      <Smartphone className="w-3 h-3" strokeWidth={2.5} />
                      手机
                    </button>
                    <button
                      onClick={() => updateCanvas({ layoutMode: 'web' })}
                      className={`chip-select flex items-center justify-center gap-1.5 ${layoutMode === 'web' ? 'chip-select-active' : ''}`}
                    >
                      <MonitorSmartphone className="w-3 h-3" strokeWidth={2.5} />
                      A4 比例
                    </button>
                  </div>
                </div>

                {/* 背景类型选择 */}
                <div className="mb-5">
                  <label className="text-[10px] font-display font-bold text-ink-300 uppercase tracking-widest block mb-2">
                    背景类型
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateCanvas({
                        background: { ...project.canvas.background, type: 'solid' }
                      })}
                      className={`chip-select flex items-center justify-center gap-1.5 ${project.canvas.background.type === 'solid' ? 'chip-select-active' : ''}`}
                    >
                      <div className="w-3 h-3 bg-ink rounded-sm" />
                      纯色
                    </button>
                    <button
                      onClick={() => updateCanvas({
                        background: { ...project.canvas.background, type: 'gradient' }
                      })}
                      className={`chip-select flex items-center justify-center gap-1.5 ${project.canvas.background.type === 'gradient' ? 'chip-select-active' : ''}`}
                    >
                      <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-ink to-coral" />
                      渐变
                    </button>
                    <button
                      onClick={() => updateCanvas({
                        background: { ...project.canvas.background, type: 'images' }
                      })}
                      className={`chip-select col-span-2 flex items-center justify-center gap-1.5 ${project.canvas.background.type === 'images' ? 'chip-select-active' : ''}`}
                    >
                      <Image className="w-3 h-3" strokeWidth={2.5} />
                      图片背景
                    </button>
                  </div>
                </div>

                {/* 纯色/渐变背景色设置 */}
                {(project.canvas.background.type === 'solid' || project.canvas.background.type === 'gradient') && (
                  <div className="space-y-3 mb-5">
                    <div>
                      <label className="text-[10px] font-display font-bold text-ink-300 uppercase tracking-widest block mb-1.5">
                        {project.canvas.background.type === 'gradient' ? '主色' : '背景色'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={project.style.colors.background}
                          onChange={(e) => updateStyle({
                            colors: { ...project.style.colors, background: e.target.value }
                          })}
                          className="w-12 h-9 rounded"
                        />
                        <input
                          type="text"
                          value={project.style.colors.background}
                          onChange={(e) => updateStyle({
                            colors: { ...project.style.colors, background: e.target.value }
                          })}
                          className="input-brutal flex-1 font-mono text-xs"
                        />
                      </div>
                    </div>
                    {project.canvas.background.type === 'gradient' && (
                      <div>
                        <label className="text-[10px] font-display font-bold text-ink-300 uppercase tracking-widest block mb-1.5">
                          辅色
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={project.style.colors.secondary}
                            onChange={(e) => updateStyle({
                              colors: { ...project.style.colors, secondary: e.target.value }
                            })}
                            className="w-12 h-9 rounded"
                          />
                          <input
                            type="text"
                            value={project.style.colors.secondary}
                            onChange={(e) => updateStyle({
                              colors: { ...project.style.colors, secondary: e.target.value }
                            })}
                            className="input-brutal flex-1 font-mono text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 图片背景管理 */}
                {project.canvas.background.type === 'images' && (
                  <BackgroundManager
                    images={project.canvas.background.images}
                    onAdd={addBackgroundImage}
                    onUpdate={updateBackgroundImage}
                    onRemove={removeBackgroundImage}
                    canvasWidth={project.canvas.width}
                    canvasHeight={project.canvas.minHeight}
                  />
                )}
              </div>
            )}

            {activeTab === 'style' && (
              <div className="p-4">
                <h2 className="text-xs font-display font-extrabold text-ink uppercase tracking-wider mb-3">
                  样式设置
                </h2>

                <div className="space-y-5">
                  {/* 字体 */}
                  <div>
                    <label className="text-[10px] font-display font-bold text-ink-300 uppercase tracking-widest block mb-2">
                      字体
                    </label>
                    <select
                      value={project.style.fontFamily}
                      onChange={(e) => updateStyle({ fontFamily: e.target.value })}
                      className="select-brutal"
                    >
                      <option value="system-ui, -apple-system, sans-serif">系统默认</option>
                      <option value="'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif">苹方/雅黑</option>
                      <option value="'Noto Serif SC', 'STSong', 'SimSun', serif">宋体/衬线</option>
                      <option value="'LXGW WenKai', 'KaiTi', 'STKaiti', serif">楷体</option>
                      <option value="'ZCOOL KuaiLe', 'Comic Sans MS', cursive">可爱/手写</option>
                      <option value="'Press Start 2P', 'Courier New', monospace">像素/等宽</option>
                      <option value="__custom__">自定义字体...</option>
                    </select>
                    {project.style.fontFamily === '__custom__' && (
                      <div className="mt-2 space-y-2">
                        <label className="block px-3 py-2 border-2 border-dashed border-ink rounded-brutal text-sm text-ink text-center cursor-pointer hover:bg-butter transition-colors font-display font-semibold">
                          {project.style.customFontName
                            ? `已加载: ${project.style.customFontName}  ✓ 点击更换`
                            : '上传字体文件 (.ttf/.woff/.otf)'}
                          <input
                            type="file"
                            accept=".ttf,.woff,.woff2,.otf"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              // 从文件名提取字体名
                              const fontName = file.name.replace(/\.(ttf|woff|woff2|otf)$/i, '')
                              const reader = new FileReader()
                              reader.onload = (evt) => {
                                const dataUrl = evt.target.result
                                const styleId = 'custom-font-style'
                                let styleEl = document.getElementById(styleId)
                                if (!styleEl) {
                                  styleEl = document.createElement('style')
                                  styleEl.id = styleId
                                  document.head.appendChild(styleEl)
                                }
                                const format = file.name.endsWith('.woff2') ? 'woff2'
                                  : file.name.endsWith('.woff') ? 'woff'
                                  : file.name.endsWith('.otf') ? 'opentype'
                                  : 'truetype'
                                styleEl.textContent = `@font-face { font-family: "${fontName}"; src: url(${dataUrl}) format("${format}"); }`
                                updateStyle({ customFontName: fontName, customFontData: dataUrl, fontFamily: '__custom__' })
                              }
                              reader.readAsDataURL(file)
                            }}
                            className="hidden"
                          />
                        </label>
                        {project.style.customFontName && project.style.customFontData && (
                          <p className="text-xs text-ink-300 font-mono flex items-center gap-1">
                            <Check className="w-3 h-3 text-leaf-300" /> 字体已就绪，预览区已应用
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 基础排版 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10px] font-display font-bold text-ink-300 uppercase tracking-widest">
                          基础字号
                        </label>
                        <span className="text-[10px] font-mono text-ink-300">{project.style.baseFontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="22"
                        value={project.style.baseFontSize}
                        onChange={(e) => updateStyle({ baseFontSize: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10px] font-display font-bold text-ink-300 uppercase tracking-widest">
                          行高
                        </label>
                        <span className="text-[10px] font-mono text-ink-300">{project.style.lineHeight}</span>
                      </div>
                      <input
                        type="range"
                        min="1.2"
                        max="2"
                        step="0.1"
                        value={project.style.lineHeight}
                        onChange={(e) => updateStyle({ lineHeight: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* 画布宽度 */}
                  <div>
                    <label className="text-[10px] font-display font-bold text-ink-300 uppercase tracking-widest block mb-2">
                      画布宽度
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {canvasWidths.map((size) => (
                        <button
                          key={size.width}
                          onClick={() => updateCanvas({ width: size.width })}
                          className={`chip-select flex items-center justify-center gap-1.5 ${project.canvas.width === size.width ? 'chip-select-active' : ''}`}
                        >
                          <span className="font-mono text-[10px]">{size.width}px</span>
                          <span>{size.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 主题色 */}
                  <div>
                    <label className="text-[10px] font-display font-bold text-ink-300 uppercase tracking-widest block mb-1.5">
                      主题色
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={project.style.colors.primary}
                        onChange={(e) => updateStyle({
                          colors: { ...project.style.colors, primary: e.target.value }
                        })}
                        className="w-12 h-9 rounded"
                      />
                      <input
                        type="text"
                        value={project.style.colors.primary}
                        onChange={(e) => updateStyle({
                          colors: { ...project.style.colors, primary: e.target.value }
                        })}
                        className="input-brutal flex-1 font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* 文字色 */}
                  <div>
                    <label className="text-[10px] font-display font-bold text-ink-300 uppercase tracking-widest block mb-1.5">
                      文字色
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={project.style.colors.text}
                        onChange={(e) => updateStyle({
                          colors: { ...project.style.colors, text: e.target.value }
                        })}
                        className="w-12 h-9 rounded"
                      />
                      <input
                        type="text"
                        value={project.style.colors.text}
                        onChange={(e) => updateStyle({
                          colors: { ...project.style.colors, text: e.target.value }
                        })}
                        className="input-brutal flex-1 font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* 圆角 */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-display font-bold text-ink-300 uppercase tracking-widest">
                        圆角
                      </label>
                      <span className="text-[10px] font-mono text-ink-300">
                        {project.style.borderRadius}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="24"
                      value={project.style.borderRadius}
                      onChange={(e) => updateStyle({ borderRadius: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {/* 内边距 */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-display font-bold text-ink-300 uppercase tracking-widest">
                        内边距
                      </label>
                      <span className="text-[10px] font-mono text-ink-300">
                        {project.canvas.padding}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="32"
                      value={project.canvas.padding}
                      onChange={(e) => updateCanvas({ padding: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {/* 边框 */}
                  <div className="border-t-2 border-dashed border-ink-200 pt-4">
                    <label className="text-[10px] font-display font-extrabold text-ink uppercase tracking-widest block mb-3">
                      边框
                    </label>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[10px] font-display font-bold text-ink-300 uppercase tracking-widest">
                              宽度
                            </label>
                            <span className="text-[10px] font-mono text-ink-300">
                              {project.style.borderWidth}px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="8"
                            value={project.style.borderWidth}
                            onChange={(e) => updateStyle({ borderWidth: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-display font-bold text-ink-300 uppercase tracking-widest block mb-1.5">
                            样式
                          </label>
                          <select
                            value={project.style.borderStyle}
                            onChange={(e) => updateStyle({ borderStyle: e.target.value })}
                            className="select-brutal text-xs py-1.5"
                          >
                            <option value="solid">实线</option>
                            <option value="dashed">虚线</option>
                            <option value="dotted">点线</option>
                            <option value="double">双线</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-display font-bold text-ink-300 uppercase tracking-widest block mb-1.5">
                          颜色
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={project.style.borderColor}
                            onChange={(e) => updateStyle({ borderColor: e.target.value })}
                            className="w-12 h-9 rounded"
                          />
                          <input
                            type="text"
                            value={project.style.borderColor}
                            onChange={(e) => updateStyle({ borderColor: e.target.value })}
                            className="input-brutal flex-1 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 侧边栏底部品牌水印 */}
          <div className="border-t-2 border-ink bg-butter px-4 py-2.5 flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-ink font-bold">
              v1.0 · canvas
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-ink font-bold">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-leaf-300 animate-pulse" />
              {saveState}
            </span>
          </div>
        </aside>

        {/* ===== 中间编辑列表 ===== */}
        <main className="flex-1 overflow-y-auto relative dot-grid">
          <div className="sticky top-0 z-10 bg-paper/90 backdrop-blur-sm border-b-2 border-ink px-4 sm:px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <Layout className="w-4 h-4 text-ink" strokeWidth={2.5} />
              <h2 className="text-sm font-display font-extrabold text-ink">
                编辑区
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-ink text-paper text-[10px] font-mono font-bold rounded">
                {project.modules.length} MODULES
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-ink-300">
              <GripVertical className="w-3 h-3" />
              拖拽排序
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="editor-card-rail max-w-sm mx-auto relative z-[1]">
              {project.modules.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={project.modules.map(m => m.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {project.modules.map((module, index) => (
                        <SortableModuleItem
                          key={`${module.id}-${historyIndex}`}
                          module={module}
                          index={index}
                          editingModule={editingModule}
                          setEditingModule={setEditingModule}
                          removeModule={removeModule}
                          updateModule={updateModule}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="relative bg-paper border-2 border-dashed border-ink rounded-brutal p-10 text-center animate-fade-in-up">
                  <div className="inline-flex w-14 h-14 bg-butter border-2 border-ink rounded-brutal shadow-brutal items-center justify-center mb-4 -rotate-6">
                    <Sparkles className="w-7 h-7 text-ink" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-display font-extrabold text-ink mb-1">
                    开始你的第一张卡片
                  </h3>
                  <p className="text-sm text-ink-300 font-medium mb-3">
                    从左侧选一个模块，或者试试「资料卡」/「视频标签」
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                    <button
                      onClick={() => addAndFocusModule('profile')}
                      className="btn-brutal-primary !px-3 !py-2 text-xs"
                    >
                      添加资料卡
                    </button>
                    <button
                      onClick={() => addAndFocusModule('videoTags')}
                      className="btn-brutal !px-3 !py-2 text-xs"
                    >
                      添加视频标签
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-ink-300">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-coral animate-pulse-ring" />
                    empty canvas
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ===== 右侧预览 ===== */}
        <aside className="preview-panel w-[420px] bg-canvas border-l-2 border-ink overflow-auto">
          <div className="sticky top-0 z-10 bg-paper/90 backdrop-blur-sm border-b-2 border-ink px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-5 h-5 bg-leaf-300 border-2 border-ink rounded-brutal flex items-center justify-center">
                <span className="block w-1.5 h-1.5 bg-paper rounded-full animate-pulse" />
              </div>
              <h2 className="text-sm font-display font-extrabold text-ink">
                实时预览
              </h2>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-ink-300">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-leaf-300" />
              live
            </div>
          </div>

          <div className="p-6 flex justify-center">
            <div
              ref={canvasRef}
              className="relative overflow-hidden animate-float flex-shrink-0"
              style={{
                width: project.canvas.width,
                minHeight: layoutMode === 'web' ? pageUnitHeight : project.canvas.minHeight,
                ...generateBackgroundStyle(),
                padding: project.canvas.padding,
                borderRadius: project.style.borderRadius,
                borderWidth: project.style.borderWidth,
                borderColor: project.style.borderColor,
                borderStyle: project.style.borderWidth > 0 ? project.style.borderStyle : undefined,
                fontFamily: project.style.fontFamily === '__custom__'
                  ? (project.style.customFontName || 'system-ui, -apple-system, sans-serif')
                  : project.style.fontFamily,
                fontSize: project.style.baseFontSize,
                lineHeight: project.style.lineHeight,
                boxShadow: '0 1px 2px rgba(10,10,10,0.04), 0 24px 48px rgba(10,10,10,0.16), 0 48px 96px rgba(10,10,10,0.08)',
                color: project.style.colors.text,
              }}
            >
              {/* 背景图片层（每层独立 DOM，支持透明度） */}
              {project.canvas.background.type === 'images' && project.canvas.background.images.map((img) => (
                <div
                  key={img.id}
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `url(${img.src})`,
                    backgroundPosition: img.position,
                    backgroundSize: img.size,
                    backgroundRepeat: img.repeat,
                    opacity: img.opacity ?? 1,
                    borderRadius: project.style.borderRadius,
                    overflow: 'hidden',
                  }}
                />
              ))}
              {/* 模块内容层 */}
              <div className="space-y-3 relative z-10">
                {project.modules.map((module) => (
                  <div key={`${module.id}-${historyIndex}`}>
                    <ModuleRenderer module={module} isEditing={false} theme={project.style.colors} />
                  </div>
                ))}
              </div>
              {/* 手机屏幕分页提示，仅用于实时预览，不进入导出图片 */}
              <div className="page-break-hint absolute right-2 top-2 z-20 pointer-events-none rounded-full bg-ink/85 px-2 py-0.5 text-[10px] font-mono font-bold text-paper shadow-brutal-sm">
                {layoutMode === 'web' ? 'A4 · P1' : 'MOBILE · S1'}
              </div>
              {pageBreaks.map((top, index) => (
                <div
                  key={top}
                  className="page-break-hint absolute left-0 right-0 z-20 pointer-events-none border-t-2 border-dashed border-coral"
                  style={{ top }}
                >
                  <span className="absolute right-2 -translate-y-1/2 rounded-full bg-coral px-2 py-0.5 text-[10px] font-mono font-bold text-paper shadow-brutal-sm border-2 border-ink">
                    {layoutMode === 'web' ? `P${index + 2}` : `S${index + 2}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ===== 导出码弹窗 ===== */}
      {showExportModal && (
        <div className="modal-backdrop" onClick={() => setShowExportModal(false)}>
          <div className="modal-brutal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-butter border-2 border-ink rounded-brutal shadow-brutal-sm flex items-center justify-center">
                <FileCode className="w-4 h-4 text-ink" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-display font-extrabold text-ink">导出短码</h3>
                <p className="text-xs font-mono text-ink-300 uppercase tracking-widest">export · share-code</p>
              </div>
            </div>
            <p className="text-sm text-ink-300 font-medium mb-4">
              复制以下代码，可以在其他地方导入恢复当前卡片
            </p>
            <div className="bg-ink border-2 border-ink rounded-brutal p-3 mb-4 max-h-40 overflow-y-auto shadow-brutal-sm">
              <code className="text-xs font-mono text-butter break-all leading-relaxed">
                {exportCode}
              </code>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyCode}
                className="btn-brutal-primary flex-1"
              >
                <Copy className="w-4 h-4" strokeWidth={2.5} />
                复制短码
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="btn-brutal"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 导入码弹窗 ===== */}
      {showImportModal && (
        <div className="modal-backdrop" onClick={() => { setShowImportModal(false); setImportCode('') }}>
          <div className="modal-brutal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-coral border-2 border-ink rounded-brutal shadow-brutal-sm flex items-center justify-center">
                <FileText className="w-4 h-4 text-paper" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-display font-extrabold text-ink">导入卡片</h3>
                <p className="text-xs font-mono text-ink-300 uppercase tracking-widest">import · paste-code</p>
              </div>
            </div>
            <p className="text-sm text-ink-300 font-medium mb-4">
              粘贴之前导出的短码
            </p>
            <textarea
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              className="input-brutal font-mono text-xs mb-4 resize-none"
              rows={5}
              placeholder="card://..."
            />
            <div className="flex gap-2">
              <button
                onClick={handleImportCode}
                className="btn-brutal-primary flex-1"
              >
                导入
              </button>
              <button
                onClick={() => { setShowImportModal(false); setImportCode('') }}
                className="btn-brutal flex-1"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 清空确认弹窗 ===== */}
      {showClearConfirm && (
        <div className="modal-backdrop" onClick={() => setShowClearConfirm(false)}>
          <div className="modal-brutal max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-coral border-2 border-ink rounded-brutal shadow-brutal-sm flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-paper" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-display font-extrabold text-ink">确认清空</h3>
            </div>
            <p className="text-sm text-ink font-medium mb-6 leading-relaxed">
              将清除所有模块和设置，恢复为空白卡片。<br />
              <span className="text-ink-300 text-xs">此操作可通过撤销恢复。</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  useCardStore.getState().initProject()
                  setShowClearConfirm(false)
                }}
                className="btn-brutal-primary flex-1 !bg-coral"
              >
                确认清空
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="btn-brutal flex-1"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 移动端预览弹窗 ===== */}
      {isMobile && showMobilePreview && (
        <div
          className="fixed inset-0 z-50 bg-canvas flex flex-col"
          style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex items-center justify-between px-4 h-14 bg-paper border-b-2 border-ink flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative w-6 h-6 bg-leaf-300 border-2 border-ink rounded-brutal flex items-center justify-center">
                <span className="block w-1.5 h-1.5 bg-paper rounded-full animate-pulse" />
              </div>
              <h2 className="text-sm font-display font-extrabold text-ink truncate">
                实时预览
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportImage(mobileCanvasRef)}
                disabled={isExporting}
                className="btn-brutal !px-3 !py-1.5 min-w-11 min-h-11"
                title="导出图片"
                aria-label="导出图片"
              >
                <Download className="w-4 h-4" strokeWidth={2.5} />
              </button>
              <button
                onClick={() => setShowMobilePreview(false)}
                className="inline-flex items-center justify-center w-11 h-11 bg-paper text-ink border-2 border-ink rounded-brutal shadow-brutal-sm hover:bg-butter"
                title="关闭"
                aria-label="关闭预览"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex justify-center dot-grid">
            <div
              ref={mobileCanvasRef}
              className="relative overflow-hidden my-auto flex-shrink-0"
              style={{
                width: project.canvas.width,
                minHeight: layoutMode === 'web' ? pageUnitHeight : project.canvas.minHeight,
                ...generateBackgroundStyle(),
                padding: project.canvas.padding,
                borderRadius: project.style.borderRadius,
                borderWidth: project.style.borderWidth,
                borderColor: project.style.borderColor,
                borderStyle: project.style.borderWidth > 0 ? project.style.borderStyle : undefined,
                fontFamily: project.style.fontFamily === '__custom__'
                  ? (project.style.customFontName || 'system-ui, -apple-system, sans-serif')
                  : project.style.fontFamily,
                fontSize: project.style.baseFontSize,
                lineHeight: project.style.lineHeight,
                boxShadow: '0 1px 2px rgba(10,10,10,0.04), 0 24px 48px rgba(10,10,10,0.16), 0 48px 96px rgba(10,10,10,0.08)',
                color: project.style.colors.text,
              }}
            >
              {project.canvas.background.type === 'images' && project.canvas.background.images.map((img) => (
                <div
                  key={img.id}
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `url(${img.src})`,
                    backgroundPosition: img.position,
                    backgroundSize: img.size,
                    backgroundRepeat: img.repeat,
                    opacity: img.opacity ?? 1,
                    borderRadius: project.style.borderRadius,
                    overflow: 'hidden',
                  }}
                />
              ))}
              <div className="space-y-3 relative z-10">
                {project.modules.map((module) => (
                  <div key={`${module.id}-${historyIndex}`}>
                    <ModuleRenderer module={module} isEditing={false} theme={project.style.colors} />
                  </div>
                ))}
              </div>
              {pageBreaks.map((top, index) => (
                <div
                  key={top}
                  className="page-break-hint absolute left-0 right-0 z-20 pointer-events-none border-t-2 border-dashed border-coral"
                  style={{ top }}
                >
                  <span className="absolute right-2 -translate-y-1/2 rounded-full bg-coral px-2 py-0.5 text-[10px] font-mono font-bold text-paper shadow-brutal-sm border-2 border-ink">
                    {layoutMode === 'web' ? `P${index + 2}` : `S${index + 2}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-brutal border-2 border-ink bg-ink px-4 py-2 text-sm font-display font-semibold text-paper shadow-brutal-lg"
        >
          {toast}
        </div>
      )}
    </div>
  )
}
