import os
import sys
from PIL import Image

# 目标文件大小（KB）
TARGET_SIZE_KB = 500

def compress_image(input_path, replace_original=False):
    # 打开图片
    img = Image.open(input_path)
    
    # 初始质量
    quality = 90
    
    # 确定输出路径
    if replace_original:
        output_path = input_path
    else:
        filename = os.path.basename(input_path)
        directory = os.path.dirname(input_path)
        output_path = os.path.join(directory, f"compressed_{filename}")
    
    # 循环压缩直到达到目标大小
    while True:
        # 保存图片
        img.save(output_path, optimize=True, quality=quality)
        
        # 检查文件大小
        current_size = os.path.getsize(output_path) / 1024  # 转换为KB
        
        if current_size <= TARGET_SIZE_KB or quality <= 10:
            break
        
        # 降低质量
        quality -= 5
    
    print(f"压缩完成: {input_path}")
    print(f"压缩后大小: {current_size:.2f} KB")
    print(f"使用质量: {quality}")

def process_directory(directory_path, replace_original=False):
    # 遍历目录中的所有文件
    for root, dirs, files in os.walk(directory_path):
        for file in files:
            # 检查文件扩展名
            ext = os.path.splitext(file)[1].lower()
            if ext in ['.jpg', '.jpeg', '.png', '.webp']:
                file_path = os.path.join(root, file)
                compress_image(file_path, replace_original)

def main():
    # 检查是否有拖拽的文件或目录
    if len(sys.argv) < 2:
        print("请拖拽图片文件或目录到本脚本上")
        input("按Enter键退出...")
        return
    
    # 处理所有拖拽的项目
    for item_path in sys.argv[1:]:
        if os.path.isfile(item_path):
            # 检查文件扩展名
            ext = os.path.splitext(item_path)[1].lower()
            if ext in ['.jpg', '.jpeg', '.png', '.webp']:
                compress_image(item_path)
            else:
                print(f"跳过非图片文件: {item_path}")
        elif os.path.isdir(item_path):
            # 处理目录
            process_directory(item_path, replace_original=True)
        else:
            print(f"跳过不存在的项目: {item_path}")
    
    # 倒计时自动退出
    import time
    countdown = 5
    print(f"压缩完成，{countdown}秒后自动退出...")
    while countdown > 0:
        print(f"{countdown}...", end=" ")
        time.sleep(1)
        countdown -= 1
    print("退出")

if __name__ == "__main__":
    main()