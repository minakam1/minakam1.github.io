import { useState } from 'react'
import { Plus, X, GripVertical, Settings, Image as ImageIcon } from 'lucide-react'
import ImageUploader from '../ImageUploader'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// 可排序项目组件
function SortableTierItem({ item, onDelete, isOverlay }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isOverlay ? 1000 : 'auto'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative group flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 
        bg-white rounded-lg shadow-sm border-2 border-gray-200
        cursor-grab active:cursor-grabbing overflow-hidden
        ${isOverlay ? 'shadow-2xl scale-110 rotate-3' : ''}
      `}
      {...attributes}
      {...listeners}
    >
      {item.image ? (
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <span className="text-xs text-gray-400 text-center px-1 truncate">
            {item.name}
          </span>
        </div>
      )}
      
      {/* 悬停显示名称 */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="text-white text-xs text-center px-1 truncate">
          {item.name}
        </span>
      </div>

      {/* 删除按钮 */}
      {!isOverlay && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(item.id)
          }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

// 等级行组件
function TierRow({ tier, items, onUpdateTier, sensors, onDragEnd, activeId, activeItem, onDeleteItem }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(tier.name)
  const [editColor, setEditColor] = useState(tier.color)

  const handleSave = () => {
    onUpdateTier(tier.id, { name: editName, color: editColor })
    setIsEditing(false)
  }

  return (
    <div className="flex items-stretch min-h-[80px] sm:min-h-[100px]">
      {/* 等级标签 */}
      <div
        className="w-16 sm:w-20 flex-shrink-0 flex items-center justify-center font-bold text-white text-lg sm:text-2xl rounded-l-lg cursor-pointer"
        style={{ backgroundColor: tier.color }}
        onClick={() => setIsEditing(true)}
      >
        {isEditing ? (
          <div className="p-2 space-y-2" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-1 py-0.5 text-sm text-gray-900 rounded"
              maxLength={3}
            />
            <input
              type="color"
              value={editColor}
              onChange={(e) => setEditColor(e.target.value)}
              className="w-full h-6"
            />
            <div className="flex gap-1">
              <button
                onClick={handleSave}
                className="flex-1 py-0.5 bg-green-500 text-white text-xs rounded"
              >
                ✓
              </button>
              <button
                onClick={() => {
                  setEditName(tier.name)
                  setEditColor(tier.color)
                  setIsEditing(false)
                }}
                className="flex-1 py-0.5 bg-gray-500 text-white text-xs rounded"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div className="relative group w-full h-full flex items-center justify-center">
            <span>{tier.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 项目区域 - 使用Droppable */}
      <TierDropZone 
        tierId={tier.id}
        items={items}
        sensors={sensors}
        onDragEnd={onDragEnd}
        activeId={activeId}
        activeItem={activeItem}
        onDeleteItem={onDeleteItem}
      />
    </div>
  )
}

// 等级投放区域组件
function TierDropZone({ tierId, items, sensors, onDragEnd, activeId, activeItem, onDeleteItem }) {
  return (
    <div className="flex-1 bg-gray-100/50 border-y-2 border-r-2 border-gray-200 rounded-r-lg p-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(e) => onDragEnd(e, tierId)}
      >
        <SortableContext
          items={items.map(i => i.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-wrap gap-2 min-h-[60px]">
            {items.map((item) => (
              <SortableTierItem
                key={item.id}
                item={item}
                onDelete={onDeleteItem}
              />
            ))}
          </div>
        </SortableContext>
        
        <DragOverlay>
          {activeId && activeItem ? (
            <SortableTierItem
              item={activeItem}
              onDelete={null}
              isOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export default function TierListModule({ data, isEditing, onUpdate }) {
  // 确保数据格式正确
  const safeData = {
    tiers: data?.tiers || [],
    items: data?.items || []
  }
  
  const [localData, setLocalData] = useState(safeData)
  const [activeId, setActiveId] = useState(null)
  const [activeItem, setActiveItem] = useState(null)
  const [showAddItem, setShowAddItem] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemImage, setNewItemImage] = useState('')

  // 配置传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value }
    setLocalData(newData)
    onUpdate?.(newData)
  }

  // 更新等级
  const updateTier = (tierId, updates) => {
    handleChange('tiers', localData.tiers.map(t =>
      t.id === tierId ? { ...t, ...updates } : t
    ))
  }

  // 删除等级
  const deleteTier = (tierId) => {
    handleChange('tiers', localData.tiers.filter(t => t.id !== tierId))
    handleChange('items', localData.items.map(i => 
      i.tierId === tierId ? { ...i, tierId: null } : i
    ))
  }

  // 添加等级
  const addTier = () => {
    const defaultNames = ['S', 'A', 'B', 'C', 'D', 'E', 'F']
    const usedNames = localData.tiers.map(t => t.name)
    const newName = defaultNames.find(n => !usedNames.includes(n)) || '?'

    const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#5f27cd', '#ff9f43', '#ee5a24']
    const newColor = colors[localData.tiers.length % colors.length]

    handleChange('tiers', [...localData.tiers, {
      id: Date.now().toString(),
      name: newName,
      color: newColor
    }])
  }

  // 夯到拉预设
  const applyHangLaPreset = () => {
    const presetTiers = [
      { id: Date.now().toString(), name: '夯', color: '#ff2442' },
      { id: (Date.now() + 1).toString(), name: '顶级', color: '#ff6b6b' },
      { id: (Date.now() + 2).toString(), name: '人上人', color: '#feca57' },
      { id: (Date.now() + 3).toString(), name: 'NPC', color: '#48dbfb' },
      { id: (Date.now() + 4).toString(), name: '拉', color: '#636e72' },
    ]
    // 一次性合并更新，避免闭包竞态
    const newData = {
      ...localData,
      tiers: presetTiers,
      items: localData.items.map(i => ({ ...i, tierId: null }))
    }
    setLocalData(newData)
    onUpdate?.(newData)
  }

  // 添加项目
  const addItem = () => {
    if (!newItemName.trim() && !newItemImage) return

    const newItem = {
      id: Date.now().toString(),
      name: newItemName || '未命名',
      image: newItemImage,
      tierId: null // 未分类
    }

    handleChange('items', [...localData.items, newItem])
    setNewItemName('')
    setNewItemImage('')
    setShowAddItem(false)
  }

  // 删除项目
  const deleteItem = (itemId) => {
    handleChange('items', localData.items.filter(i => i.id !== itemId))
  }

  // 处理拖拽
  const handleDragStart = (event) => {
    const { active } = event
    setActiveId(active.id)
    const item = localData.items.find(i => i.id === active.id)
    setActiveItem(item)
  }

  const handleDragEnd = (event, targetTierId) => {
    const { active, over } = event
    setActiveId(null)
    setActiveItem(null)

    if (!over) return

    const activeItem = localData.items.find(i => i.id === active.id)
    if (!activeItem) return

    // 如果拖放到不同的等级
    if (targetTierId !== undefined && activeItem.tierId !== targetTierId) {
      handleChange('items', localData.items.map(i =>
        i.id === active.id ? { ...i, tierId: targetTierId } : i
      ))
      return
    }

    // 在同一等级内重新排序
    if (active.id !== over.id) {
      const tierItems = localData.items.filter(i => i.tierId === targetTierId)
      const oldIndex = tierItems.findIndex(i => i.id === active.id)
      const newIndex = tierItems.findIndex(i => i.id === over.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(tierItems, oldIndex, newIndex)
        const otherItems = localData.items.filter(i => i.tierId !== targetTierId)
        handleChange('items', [...otherItems, ...reordered])
      }
    }
  }

  // 获取等级的项目
  const getTierItems = (tierId) => {
    return localData.items.filter(i => i.tierId === tierId)
  }

  // 获取未分类项目
  const getUncategorizedItems = () => {
    return localData.items.filter(i => !i.tierId)
  }

  if (isEditing) {
    return (
      <div className="space-y-4">
        {/* 等级列表 */}
        <div className="space-y-2">
          {localData.tiers.map((tier) => (
            <TierRow
              key={tier.id}
              tier={tier}
              items={getTierItems(tier.id)}
              onUpdateTier={updateTier}
              onDeleteTier={deleteTier}
              sensors={sensors}
              onDragEnd={handleDragEnd}
              activeId={activeId}
              activeItem={activeItem}
              onDeleteItem={deleteItem}
            />
          ))}
        </div>

        {/* 按钮行 */}
        <div className="flex gap-2">
          <button
            onClick={addTier}
            className="flex-1 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-pink-400 hover:text-pink-500 transition-colors text-sm"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            添加等级
          </button>
          <button
            onClick={applyHangLaPreset}
            className="px-3 py-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 text-sm transition-colors"
            title="替换为 夯→顶级→人上人→NPC→拉"
          >
            夯→拉预设
          </button>
        </div>

        {/* 未分类项目池 */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">项目池（拖拽到上方等级）</h4>
            <button
              onClick={() => setShowAddItem(!showAddItem)}
              className="text-xs px-2 py-1 bg-pink-100 text-pink-600 rounded hover:bg-pink-200"
            >
              {showAddItem ? '取消' : '添加项目'}
            </button>
          </div>

          {/* 添加项目表单 */}
          {showAddItem && (
            <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="项目名称"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
              <ImageUploader
                value={newItemImage}
                onChange={setNewItemImage}
                aspectRatio={1}
              />
              <button
                onClick={addItem}
                className="w-full py-2 bg-pink-500 text-white rounded text-sm hover:bg-pink-600"
              >
                添加
              </button>
            </div>
          )}

          {/* 未分类项目 */}
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={(e) => handleDragEnd(e, null)}
          >
            <SortableContext
              items={getUncategorizedItems().map(i => i.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex flex-wrap gap-2 min-h-[80px] p-3 bg-gray-100 rounded-lg">
                {getUncategorizedItems().length === 0 ? (
                  <span className="text-sm text-gray-400 w-full text-center py-4">
                    暂无项目，点击"添加项目"创建
                  </span>
                ) : (
                  getUncategorizedItems().map((item) => (
                    <SortableTierItem
                      key={item.id}
                      item={item}
                      onDelete={deleteItem}
                    />
                  ))
                )}
              </div>
            </SortableContext>
            
            <DragOverlay>
              {activeId && activeItem ? (
                <SortableTierItem
                  item={activeItem}
                  onDelete={null}
                  isOverlay
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* 提示 */}
        <p className="text-xs text-gray-400">
          提示：拖拽项目到不同等级，或在同一等级内排序。点击等级标签可编辑名称和颜色。
        </p>
      </div>
    )
  }

  // 预览模式 - 使用localData而不是data
  const displayData = localData.items.length > 0 ? localData : safeData
  
  return (
    <div className="space-y-2">
      {displayData.tiers.map((tier) => {
        const tierItems = displayData.items.filter(i => i.tierId === tier.id)
        if (tierItems.length === 0) return null
        
        return (
          <div key={tier.id} className="flex items-stretch">
            <div
              className="w-12 sm:w-16 flex-shrink-0 flex items-center justify-center font-bold text-white text-base sm:text-xl rounded-l-lg"
              style={{ backgroundColor: tier.color }}
            >
              {tier.name}
            </div>
            <div className="flex-1 bg-gray-50 border-y border-r border-gray-200 rounded-r-lg p-2">
              <div className="flex flex-wrap gap-1">
                {tierItems.map((item) => (
                  <div
                    key={item.id}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded shadow-sm overflow-hidden"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-[8px] text-gray-400 text-center leading-tight">
                          {item.name?.slice(0, 4)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
