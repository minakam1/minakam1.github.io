import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import LZString from 'lz-string'

// 生成唯一ID
const generateId = () => Math.random().toString(36).substr(2, 9)

// 默认画布配置 - 无限高度信息流
const defaultCanvas = {
  layoutMode: 'mobile', // mobile, web
  width: 360, // 手机信息流标准宽度
  height: 'auto', // 无限高度，自适应内容
  minHeight: 450, // 最小高度
  background: {
    type: 'solid', // solid, gradient, image, images
    value: '#ffffff',
    images: [] // 多张背景图
  },
  padding: 16
}

// 默认样式配置
const defaultStyle = {
  fontFamily: 'system-ui, -apple-system, sans-serif',
  customFontName: '',
  customFontData: '',
  baseFontSize: 14,
  lineHeight: 1.5,
  colors: {
    primary: '#ff2442', // 小红书红
    secondary: '#8b5cf6',
    background: '#ffffff',
    text: '#333333'
  },
  borderRadius: 12,
  borderWidth: 0,
  borderColor: '#e5e7eb',
  borderStyle: 'solid',
  shadow: 'sm'
}

// 创建空白项目
const createEmptyProject = () => ({
  id: generateId(),
  version: '1.0',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  canvas: { ...defaultCanvas },
  style: { ...defaultStyle },
  modules: [],
  layout: 'vertical'
})

const cloneProject = (project) => JSON.parse(JSON.stringify(project))
const initialProject = createEmptyProject()
let historyTimer = null

// 压缩本地项目，降低图片/字体导致 localStorage 超限的概率；兼容旧的明文存储
const compressedStorage = {
  getItem: (name) => {
    if (typeof localStorage === 'undefined') return null
    const value = localStorage.getItem(name)
    if (!value) return null
    return LZString.decompressFromUTF16(value) || value
  },
  setItem: (name, value) => {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(name, LZString.compressToUTF16(value))
  },
  removeItem: (name) => {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(name)
  }
}

let storageDbPromise
const openStorageDb = () => {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('IndexedDB unavailable'))
  if (!storageDbPromise) {
    storageDbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open('canvas-studio', 1)
      request.onupgradeneeded = () => request.result.createObjectStore('projects')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
  return storageDbPromise
}

const projectStorage = {
  getItem: async (name) => {
    try {
      const db = await openStorageDb()
      const value = await new Promise((resolve, reject) => {
        const request = db.transaction('projects', 'readonly').objectStore('projects').get(name)
        request.onsuccess = () => resolve(request.result || null)
        request.onerror = () => reject(request.error)
      })
      if (value) return value

      // 首次升级时迁移之前的压缩 localStorage 数据
      const legacyValue = compressedStorage.getItem(name)
      if (legacyValue) {
        await projectStorage.setItem(name, legacyValue)
        return legacyValue
      }
      return null
    } catch {
      return compressedStorage.getItem(name)
    }
  },
  setItem: async (name, value) => {
    try {
      const db = await openStorageDb()
      await new Promise((resolve, reject) => {
        const request = db.transaction('projects', 'readwrite').objectStore('projects').put(value, name)
        request.onsuccess = resolve
        request.onerror = () => reject(request.error)
      })
    } catch {
      compressedStorage.setItem(name, value)
    }
  },
  removeItem: async (name) => {
    try {
      const db = await openStorageDb()
      await new Promise((resolve, reject) => {
        const request = db.transaction('projects', 'readwrite').objectStore('projects').delete(name)
        request.onsuccess = resolve
        request.onerror = () => reject(request.error)
      })
    } catch {
      compressedStorage.removeItem(name)
    }
  }
}

// 预设标签库（可搜索）
export const presetTags = {
  // 兴趣爱好
  hobbies: [
    '游戏', '动漫', '电影', '音乐', '读书', '旅行', '摄影', '美食',
    '运动', '健身', '瑜伽', '跑步', '篮球', '足球', '羽毛球',
    '绘画', '手工', '烘焙', '咖啡', '茶艺', '花艺', '养宠'
  ],
  // 游戏相关
  gaming: [
    '原神', '崩坏：星穹铁道', '明日方舟', '王者荣耀', '和平精英',
    '英雄联盟', 'CS:GO', 'Valorant', 'APEX', '永劫无间',
    '塞尔达', '宝可梦', '动森', '糖豆人', '双人成行',
    'Steam', 'Switch', 'PS5', 'Xbox', '手游', '端游', '主机'
  ],
  // 二次元
  anime: [
    '新番', '经典', '热血', '治愈', '悬疑', '恋爱', '搞笑',
    'B站', '追番', '补番', '漫展', 'cosplay', '手办', '谷子',
    'VTuber', '虚拟主播', '音声', 'ASMR'
  ],
  // 社交属性
  social: [
    '扩列', '交友', '聊天', '约饭', '约拍', '约游戏', '约运动',
    '同城', '线上', '线下', '慢热', '社恐', '社牛', '话痨'
  ],
  // 个性标签
  personality: [
    'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP',
    '夜猫子', '早起党', '宅', '现充', '佛系', '卷王', '摆烂'
  ],
  // 状态
  status: [
    '学生', '工作党', '自由职业', '待业', '考研', '考公',
    '单身', '恋爱中', '已婚', '保密',
    '求带', '求组队', '求搭子', '求推荐'
  ]
}

// 所有预设标签（扁平化）
export const allPresetTags = Object.values(presetTags).flat()

// 模块模板
export const moduleTemplates = {
  // 基础模块
  heading: {
    type: 'heading',
    name: '大标题',
    icon: 'Heading',
    defaultData: {
      text: '标题文字',
      level: 1,
      align: 'left'
    }
  },
  text: {
    type: 'text',
    name: '文本段落',
    icon: 'Type',
    defaultData: {
      text: '在这里输入文字内容...',
      align: 'left'
    }
  },
  divider: {
    type: 'divider',
    name: '分割线',
    icon: 'Minus',
    defaultData: {
      style: 'solid',
      width: '100%',
      color: '#e5e7eb'
    }
  },
  image: {
    type: 'image',
    name: '图片',
    icon: 'Image',
    defaultData: {
      src: '',
      alt: '',
      shape: 'square',
      width: '100%'
    }
  },

  // 信息模块
  profile: {
    type: 'profile',
    name: '资料卡',
    icon: 'User',
    defaultData: {
      avatar: '',
      name: '昵称',
      bio: '简介文字...',
      align: 'center'
    }
  },
  infoList: {
    type: 'infoList',
    name: '信息列表',
    icon: 'List',
    defaultData: {
      items: [
        { label: '标签1', value: '值1' },
        { label: '标签2', value: '值2' }
      ]
    }
  },
  timeline: {
    type: 'timeline',
    name: '时间轴',
    icon: 'Clock',
    defaultData: {
      items: [
        { title: '事件1', time: '2024.01', description: '描述...' },
        { title: '事件2', time: '2023.06', description: '描述...' }
      ]
    }
  },
  progress: {
    type: 'progress',
    name: '进度条',
    icon: 'BarChart',
    defaultData: {
      items: [
        { label: '技能1', value: 80 },
        { label: '技能2', value: 60 }
      ],
      showPercentage: true
    }
  },

  // 展示模块
  tags: {
    type: 'tags',
    name: '标签云',
    icon: 'Tag',
    defaultData: {
      items: ['标签1', '标签2', '标签3'],
      style: 'default'
    }
  },
  videoTags: {
    type: 'videoTags',
    name: '视频标签',
    icon: 'Hash',
    defaultData: {
      items: ['原神', '攻略', '新手'],
      showSearch: true,
      maxDisplay: 8
    }
  },
  rating: {
    type: 'rating',
    name: '评分',
    icon: 'Star',
    defaultData: {
      value: 4,
      max: 5,
      label: '评分'
    }
  },
  tierList: {
    type: 'tierList',
    name: '排名表',
    icon: 'Trophy',
    defaultData: {
      tiers: [
        { id: 'tier-ss', name: 'SS', color: '#ff6b6b' },
        { id: 'tier-s', name: 'S', color: '#feca57' },
        { id: 'tier-a', name: 'A', color: '#48dbfb' },
        { id: 'tier-b', name: 'B', color: '#1dd1a1' }
      ],
      items: []
    }
  },
  grid: {
    type: 'grid',
    name: '网格图',
    icon: 'Grid',
    defaultData: {
      columns: 3,
      items: [
        { src: '', label: '1' },
        { src: '', label: '2' },
        { src: '', label: '3' }
      ]
    }
  },
  quote: {
    type: 'quote',
    name: '引用块',
    icon: 'Quote',
    defaultData: {
      text: '引用文字内容...',
      author: '作者'
    }
  },

  // 社交模块
  social: {
    type: 'social',
    name: '社交链接',
    icon: 'Share2',
    defaultData: {
      links: [
        { platform: 'github', url: '' },
        { platform: 'twitter', url: '' },
        { platform: 'bilibili', url: '' }
      ]
    }
  },
  qrcode: {
    type: 'qrcode',
    name: '二维码',
    icon: 'QrCode',
    defaultData: {
      content: '',
      size: 128,
      label: '扫码添加'
    }
  },
  markdown: {
    type: 'markdown',
    name: 'MD文本',
    icon: 'Hash',
    defaultData: {
      content: ''
    }
  },
  music: {
    type: 'music',
    name: '音乐',
    icon: 'Music',
    defaultData: {
      songs: []
    }
  },
  bangumi: {
    type: 'bangumi',
    name: '作品',
    icon: 'Tv',
    defaultData: {
      items: []
    }
  }
}

export const useCardStore = create(
  persist(
    (set, get) => ({
      // 当前项目
      project: initialProject,

      // 历史记录
      history: [cloneProject(initialProject)],
      historyIndex: 0,

      hydrateHistory: () => {
        set((state) => ({
          history: [cloneProject(state.project)],
          historyIndex: 0
        }))
      },

      // 初始化项目
      initProject: () => {
        if (historyTimer) clearTimeout(historyTimer)
        const newProject = createEmptyProject()
        set({
          project: newProject,
          history: [cloneProject(newProject)],
          historyIndex: 0
        })
      },

      // 从短码导入
      importFromCode: (code) => {
        try {
          const compressed = code.replace('card://', '')
          const json = LZString.decompressFromBase64(compressed)
          const data = JSON.parse(json)
          if (!data || typeof data !== 'object' || !Array.isArray(data.modules)) {
            throw new Error('无效的卡片数据')
          }
          const baseProject = createEmptyProject()
          const importedProject = {
            ...baseProject,
            ...data,
            canvas: {
              ...baseProject.canvas,
              ...(data.canvas || {}),
              background: {
                ...baseProject.canvas.background,
                ...(data.canvas?.background || {})
              }
            },
            style: {
              ...baseProject.style,
              ...(data.style || {}),
              colors: {
                ...baseProject.style.colors,
                ...(data.style?.colors || {})
              }
            },
            modules: data.modules.map((module) => ({
              ...module,
              id: module.id || generateId(),
              data: {
                ...(moduleTemplates[module.type]?.defaultData || {}),
                ...(module.data || {})
              },
              layout: {
                width: '100%',
                align: 'left',
                ...(module.layout || {})
              }
            })),
            updatedAt: Date.now()
          }
          if (!Array.isArray(importedProject.canvas.background.images)) {
            importedProject.canvas.background.images = []
          }
          set({
            project: importedProject,
            history: [cloneProject(importedProject)],
            historyIndex: 0
          })
          return true
        } catch (e) {
          console.error('导入失败:', e)
          return false
        }
      },

      // 导出为短码
      exportToCode: () => {
        const { project } = get()
        const json = JSON.stringify(project)
        const compressed = LZString.compressToBase64(json)
        return 'card://' + compressed
      },

      // 添加模块
      addModule: (type, parentId = null) => {
        const template = moduleTemplates[type]
        if (!template) return

        const newModule = {
          id: generateId(),
          type: template.type,
          data: { ...template.defaultData },
          layout: {
            width: '100%',
            align: 'left'
          }
        }

        if (parentId) {
          set((state) => ({
            project: {
              ...state.project,
              modules: state.project.modules.map(m => {
                if (m.id === parentId && m.type === 'row') {
                  return {
                    ...m,
                    data: {
                      ...m.data,
                      modules: [...m.data.modules, newModule]
                    }
                  }
                }
                return m
              }),
              updatedAt: Date.now()
            }
          }))
        } else {
          set((state) => ({
            project: {
              ...state.project,
              modules: [...state.project.modules, newModule],
              updatedAt: Date.now()
            }
          }))
        }
        get().commitHistory()
        return newModule.id
      },

      // 更新模块
      updateModule: (moduleId, newData, parentId = null) => {
        if (parentId) {
          set((state) => ({
            project: {
              ...state.project,
              modules: state.project.modules.map(m => {
                if (m.id === parentId && m.type === 'row') {
                  return {
                    ...m,
                    data: {
                      ...m.data,
                      modules: m.data.modules.map(subM =>
                        subM.id === moduleId
                          ? { ...subM, data: { ...subM.data, ...newData } }
                          : subM
                      )
                    }
                  }
                }
                return m
              }),
              updatedAt: Date.now()
            }
          }))
        } else {
          set((state) => ({
            project: {
              ...state.project,
              modules: state.project.modules.map(m =>
                m.id === moduleId ? { ...m, data: { ...m.data, ...newData } } : m
              ),
              updatedAt: Date.now()
            }
          }))
        }
        get().scheduleHistorySave()
      },

      // 删除模块
      removeModule: (moduleId, parentId = null) => {
        if (parentId) {
          set((state) => ({
            project: {
              ...state.project,
              modules: state.project.modules.map(m => {
                if (m.id === parentId && m.type === 'row') {
                  return {
                    ...m,
                    data: {
                      ...m.data,
                      modules: m.data.modules.filter(subM => subM.id !== moduleId)
                    }
                  }
                }
                return m
              }),
              updatedAt: Date.now()
            }
          }))
        } else {
          set((state) => ({
            project: {
              ...state.project,
              modules: state.project.modules.filter(m => m.id !== moduleId),
              updatedAt: Date.now()
            }
          }))
        }
        get().commitHistory()
      },

      // 重新排序模块
      reorderModules: (newOrder) => {
        set((state) => ({
          project: {
            ...state.project,
            modules: newOrder,
            updatedAt: Date.now()
          }
        }))
        get().commitHistory()
      },

      // 更新画布设置
      updateCanvas: (canvasData) => {
        set((state) => ({
          project: {
            ...state.project,
            canvas: { ...state.project.canvas, ...canvasData },
            updatedAt: Date.now()
          }
        }))
        get().scheduleHistorySave()
      },

      // 添加背景图片
      addBackgroundImage: (imageSrc) => {
        set((state) => ({
          project: {
            ...state.project,
            canvas: {
              ...state.project.canvas,
              background: {
                ...state.project.canvas.background,
                type: 'images',
                images: [
                  ...state.project.canvas.background.images,
                  {
                    id: generateId(),
                    src: imageSrc,
                    position: 'center',
                    size: 'cover',
                    repeat: 'no-repeat',
                    opacity: 1
                  }
                ]
              }
            },
            updatedAt: Date.now()
          }
        }))
        get().commitHistory()
      },

      // 更新背景图片
      updateBackgroundImage: (imageId, updates) => {
        set((state) => ({
          project: {
            ...state.project,
            canvas: {
              ...state.project.canvas,
              background: {
                ...state.project.canvas.background,
                images: state.project.canvas.background.images.map(img =>
                  img.id === imageId ? { ...img, ...updates } : img
                )
              }
            },
            updatedAt: Date.now()
          }
        }))
        get().scheduleHistorySave()
      },

      // 删除背景图片
      removeBackgroundImage: (imageId) => {
        set((state) => {
          const newImages = state.project.canvas.background.images.filter(img => img.id !== imageId)
          return {
            project: {
              ...state.project,
              canvas: {
                ...state.project.canvas,
                background: {
                  ...state.project.canvas.background,
                  type: newImages.length > 0 ? 'images' : 'solid',
                  images: newImages
                }
              },
              updatedAt: Date.now()
            }
          }
        })
        get().commitHistory()
      },

      // 更新样式设置
      updateStyle: (styleData) => {
        set((state) => ({
          project: {
            ...state.project,
            style: { ...state.project.style, ...styleData },
            updatedAt: Date.now()
          }
        }))
        get().scheduleHistorySave()
      },

      // 保存到历史
      saveToHistory: () => {
        set((state) => {
          const snapshot = cloneProject(state.project)
          const previousSnapshot = state.history[state.history.length - 1]
          if (previousSnapshot && JSON.stringify(previousSnapshot) === JSON.stringify(snapshot)) {
            return state
          }
          const newHistory = state.history.slice(0, state.historyIndex + 1)
          newHistory.push(snapshot)
          if (newHistory.length > 50) newHistory.shift()
          return {
            history: newHistory,
            historyIndex: newHistory.length - 1
          }
        })
      },

      scheduleHistorySave: () => {
        if (historyTimer) clearTimeout(historyTimer)
        historyTimer = setTimeout(() => {
          historyTimer = null
          get().saveToHistory()
        }, 400)
      },

      commitHistory: () => {
        if (historyTimer) {
          clearTimeout(historyTimer)
          historyTimer = null
        }
        get().saveToHistory()
      },

      // 撤销
      undo: () => {
        set((state) => {
          if (state.historyIndex > 0) {
            return {
              historyIndex: state.historyIndex - 1,
              project: state.history[state.historyIndex - 1]
            }
          }
          return state
        })
      },

      // 重做
      redo: () => {
        set((state) => {
          if (state.historyIndex < state.history.length - 1) {
            return {
              historyIndex: state.historyIndex + 1,
              project: state.history[state.historyIndex + 1]
            }
          }
          return state
        })
      },

      // 是否可以撤销
      canUndo: () => get().historyIndex > 0,

      // 是否可以重做
      canRedo: () => get().historyIndex < get().history.length - 1
    }),
    {
      name: 'card-storage',
      partialize: (state) => ({ project: state.project }),
      storage: projectStorage,
      onRehydrateStorage: () => (state) => {
        state?.hydrateHistory?.()
      }
    }
  )
)
