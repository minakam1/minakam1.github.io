@echo off

REM 一键部署脚本 for Hexo 博客
REM 日期: %date%
REM 时间: %time%

echo ===============================
echo 开始部署 Hexo 博客...
echo ===============================

REM 进入项目目录
cd "d:\blog\hexo-new"

REM 检查是否安装了依赖
echo 检查依赖...
if not exist "node_modules" (
    echo 依赖不存在，正在安装...
    npm install --registry=https://registry.npmmirror.com
    if %errorlevel% neq 0 (
        echo 依赖安装失败，请检查网络或 package.json 配置
        pause
        exit /b 1
    )
    echo 依赖安装成功
)

REM 清理项目
echo 清理项目...
npm run clean
if %errorlevel% neq 0 (
    echo 清理失败
    pause
    exit /b 1
)

REM 构建项目
echo 构建项目...
npm run build
if %errorlevel% neq 0 (
    echo 构建失败
    pause
    exit /b 1
)

REM 部署项目
echo 部署项目...
npm run deploy
if %errorlevel% neq 0 (
    echo 部署失败
    pause
    exit /b 1
)

echo ===============================
echo 部署完成！
echo ===============================
pause
