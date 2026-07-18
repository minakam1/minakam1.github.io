# poetry-in-noise · 噪点里的诗

一个实验艺术气质的个人主页。纯 HTML / CSS / JavaScript，零依赖。

## 美学

- **风格**：Zine 印刷感 × 像素美学（1-bit/2-bit 调色板 + 像素字体 + 噪点 + 错位）
- **记忆锚点**：1995 年的针式打印机试着打印一本艺术家的 zine
- **色彩**：纸张白 `#f1e6cf` × 墨黑 `#141414` × 印章红 `#c8341f`

## 文件

```
poetry-in-noise/
├── index.html   # 结构 + 内容
├── styles.css   # 视觉系统
├── main.js      # 交互（光标 / 墨迹 / 打字机 / 滚动揭示）
└── README.md
```

## 本地运行

任何静态服务器都行：

```bash
cd poetry-in-noise
python3 -m http.server 5173
# 浏览器打开 http://localhost:5173
```

或用 `npx serve`、`php -S` 等。

## 改一改

- **内容**：直接编辑 `index.html` 里的文字
- **字体**：在 `styles.css` 的 `:root` 改 `--f-*` 变量
- **颜色**：在 `styles.css` 的 `:root` 改 `--paper` / `--ink` / `--stamp`
- **动效**：在 `main.js` 改打字速度、墨点密度、滚动阈值

## 部署

直接把四个文件扔到任何静态托管（GitHub Pages / Netlify / Vercel / Cloudflare Pages）即可。
