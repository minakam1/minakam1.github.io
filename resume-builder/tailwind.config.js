/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 工作室暗调色板
        ink: {
          DEFAULT: '#0A0A0A',
          50: '#F7F7F7',
          100: '#E5E5E5',
          200: '#C9C9C9',
          300: '#8B8B8B',
          400: '#525252',
          500: '#2A2A2A',
          600: '#1A1A1A',
          700: '#121212',
          800: '#0A0A0A',
          900: '#050505',
        },
        paper: {
          DEFAULT: '#FAF8F4',
          50: '#FFFEFB',
          100: '#FAF8F4',
          200: '#F2EEE6',
          300: '#E8E3D6',
        },
        canvas: {
          DEFAULT: '#F0EEE8',
          50: '#F8F7F3',
          100: '#F0EEE8',
          200: '#E5E2D8',
          300: '#D6D2C4',
        },
        // 强调色：小红书红升级版
        coral: {
          50: '#FFF1F4',
          100: '#FFD9E0',
          200: '#FFB1BF',
          300: '#FF7A8E',
          400: '#FF5470',
          500: '#FF2E55',
          600: '#E81E45',
          700: '#C4173A',
          800: '#9B0F2D',
          900: '#700922',
          DEFAULT: '#FF2E55',
        },
        // 点缀色：奶油黄（单值，可直接 bg-butter / text-butter）
        butter: '#FFE45C',
        // 草本绿（成功/选中）
        leaf: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#66BB6A',
          300: '#2E7D32',
          DEFAULT: '#66BB6A',
        },
        // 兼容旧 color name（不改组件代码）
        primary: {
          50: '#FFF1F4',
          100: '#FFD9E0',
          500: '#FF2E55',
          600: '#E81E45',
          700: '#C4173A',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
        sans: ['"Noto Sans SC"', '"Bricolage Grotesque"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Noto Serif SC"', '"Songti SC"', 'STSong', 'serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'monospace'],
      },
      boxShadow: {
        // 硬投影（新粗野主义）
        'brutal': '4px 4px 0 0 #0A0A0A',
        'brutal-sm': '2px 2px 0 0 #0A0A0A',
        'brutal-lg': '6px 6px 0 0 #0A0A0A',
        'brutal-coral': '4px 4px 0 0 #FF2E55',
        'brutal-butter': '4px 4px 0 0 #FFE45C',
        'brutal-white': '4px 4px 0 0 #FAF8F4',
        // 软阴影保留（用于画布/模态）
        'soft': '0 1px 2px rgba(10,10,10,0.04), 0 8px 24px rgba(10,10,10,0.08)',
        'soft-lg': '0 4px 8px rgba(10,10,10,0.06), 0 24px 48px rgba(10,10,10,0.12)',
      },
      borderRadius: {
        'brutal': '6px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: 0, transform: 'scale(0.96)' },
          '60%': { opacity: 1, transform: 'scale(1.01)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        'slide-down': {
          '0%': { opacity: 0, transform: 'translateY(-8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(255,46,85,0.5)' },
          '70%': { boxShadow: '0 0 0 8px rgba(255,46,85,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255,46,85,0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out both',
        'fade-in-up': 'fade-in-up 0.4s ease-out both',
        'pop-in': 'pop-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-down': 'slide-down 0.2s ease-out both',
        'marquee': 'marquee 28s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
