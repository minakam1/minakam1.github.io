# Hexo 博客搭建与 GitHub Pages 部署指南 - 实现计划

## [ ] 任务 1: 安装 Node.js 和 npm
- **优先级**: P0
- **依赖项**: None
- **描述**: 
  - 下载并安装 Node.js（包含 npm）
  - 验证安装成功
- **验收标准**: AC-1
- **测试要求**:
  - `programmatic` TR-1.1: 运行 `node -v` 和 `npm -v` 命令显示版本号
- **说明**: 建议安装 LTS 版本的 Node.js

## [ ] 任务 2: 全局安装 Hexo CLI
- **优先级**: P0
- **依赖项**: 任务 1
- **描述**: 
  - 使用 npm 全局安装 Hexo CLI
  - 验证安装成功
- **验收标准**: AC-1
- **测试要求**:
  - `programmatic` TR-2.1: 运行 `hexo -v` 命令显示版本号
- **说明**: 可使用 `npm install -g hexo-cli` 命令安装

## [ ] 任务 3: 初始化 Hexo 博客项目
- **优先级**: P0
- **依赖项**: 任务 2
- **描述**: 
  - 创建项目目录
  - 初始化 Hexo 项目
  - 安装项目依赖
- **验收标准**: AC-2
- **测试要求**:
  - `human-judgment` TR-3.1: 项目目录结构正确，包含必要文件
- **说明**: 可使用 `hexo init <项目名>` 命令初始化

## [ ] 任务 4: 安装和配置 Fluid 主题
- **优先级**: P0
- **依赖项**: 任务 3
- **描述**: 
  - 克隆或下载 Fluid 主题到 themes 目录
  - 修改 _config.yml 文件，设置主题为 fluid
  - 复制主题配置文件并进行基本配置
- **验收标准**: AC-2
- **测试要求**:
  - `human-judgment` TR-4.1: 本地预览时显示 Fluid 主题效果
- **说明**: 可通过 Git 克隆或直接下载主题文件

## [ ] 任务 5: 安装 hexo-deployer-git 插件
- **优先级**: P0
- **依赖项**: 任务 3
- **描述**: 
  - 在项目目录中安装 hexo-deployer-git 插件
- **验收标准**: AC-3
- **测试要求**:
  - `programmatic` TR-5.1: 插件安装成功，无错误信息
- **说明**: 可使用 `npm install hexo-deployer-git --save` 命令安装

## [ ] 任务 6: 配置 _config.yml 文件以支持 Git 部署
- **优先级**: P0
- **依赖项**: 任务 5
- **描述**: 
  - 编辑 _config.yml 文件，添加 deploy 配置
  - 配置 GitHub 仓库地址和分支
- **验收标准**: AC-3
- **测试要求**:
  - `programmatic` TR-6.1: 配置文件格式正确，无语法错误
- **说明**: 仓库地址应使用 SSH 或 HTTPS 格式

## [x] 任务 7: 创建 GitHub 仓库
- **优先级**: P0
- **依赖项**: 无
- **描述**: 
  - 在 GitHub 上创建新仓库
  - 仓库命名为 username.github.io（username 为 GitHub 用户名）
- **验收标准**: AC-3
- **测试要求**:
  - `human-judgment` TR-7.1: 仓库创建成功，命名正确
- **说明**: 这是 GitHub Pages 的要求，仓库名必须遵循此格式

## [x] 任务 8: 部署博客到 GitHub Pages
- **优先级**: P0
- **依赖项**: 任务 6, 任务 7
- **描述**: 
  - 执行 `hexo deploy` 命令部署博客
  - 验证部署成功
- **验收标准**: AC-3
- **测试要求**:
  - `programmatic` TR-8.1: 部署命令执行成功，无错误信息
  - `human-judgment` TR-8.2: 访问 username.github.io 可看到博客首页
- **说明**: 首次部署可能需要一些时间来生效

## [x] 任务 9: 创建新文章
- **优先级**: P1
- **依赖项**: 任务 3
- **描述**: 
  - 使用 Hexo 命令创建新文章
  - 编辑文章内容
- **验收标准**: AC-4
- **测试要求**:
  - `human-judgment` TR-9.1: 文章文件创建成功，内容符合 Markdown 格式
- **说明**: 可使用 `hexo new "文章标题"` 命令创建

## [x] 任务 10: 发布新文章到 GitHub Pages
- **优先级**: P1
- **依赖项**: 任务 8, 任务 9
- **描述**: 
  - 生成静态文件
  - 部署到 GitHub Pages
  - 验证文章发布成功
- **验收标准**: AC-4
- **测试要求**:
  - `programmatic` TR-10.1: 执行 `hexo generate` 和 `hexo deploy` 命令成功
  - `human-judgment` TR-10.2: 访问博客可看到新发布的文章
- **说明**: 可使用 `hexo g -d` 命令一步完成生成和部署