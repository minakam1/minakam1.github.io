# 图片压缩脚本

一个简单的图片压缩脚本，支持拖拽操作，一键压缩到指定尺寸并输出到原目录。

## 功能特性

- ✅ 支持拖拽图片文件到脚本上进行压缩
- ✅ 自动压缩到指定大小（默认200KB）
- ✅ 输出到原文件所在目录
- ✅ 支持多种图片格式：jpg、jpeg、png、webp
- ✅ 显示压缩前后的文件大小和使用的质量

## 使用方法

### 方法1：直接拖拽
1. 找到 `compress_image.bat` 文件
2. 将图片文件拖拽到 `compress_image.bat` 上
3. 等待压缩完成，查看原目录中的压缩文件

### 方法2：命令行运行
1. 打开命令提示符
2. 导航到脚本所在目录
3. 运行：`python compress_image.py 图片路径`

## 配置

可以修改 `compress_image.py` 文件中的 `TARGET_SIZE_KB` 参数来调整目标文件大小：

```python
# 目标文件大小（KB）
TARGET_SIZE_KB = 200
```

## 依赖

- Python 3
- Pillow 库

## 安装依赖

如果未安装 Pillow 库，请运行：

```bash
pip install Pillow
```

## 输出文件命名

压缩后的文件会在原文件名前添加 `compressed_` 前缀，例如：
- 原始文件：`example.jpg`
- 压缩后：`compressed_example.jpg`