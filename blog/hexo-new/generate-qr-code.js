const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// 网站 URL
const websiteUrl = 'https://minakam1.github.io/'; // 替换为你的网站 URL

// 输出目录
const outputDir = path.join(__dirname, 'source', 'img');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 生成多种样式的二维码
async function generateQRCodes() {
  // 基本二维码配置
  const baseOptions = {
    width: 300,
    margin: 2
  };
  
  // 不同样式的配置
  const styles = [
    {
      name: 'qrcode-black-white',
      options: {
        ...baseOptions,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }
    },
    {
      name: 'qrcode-blue-white',
      options: {
        ...baseOptions,
        color: {
          dark: '#1a73e8',
          light: '#ffffff'
        }
      }
    },
    {
      name: 'qrcode-green-white',
      options: {
        ...baseOptions,
        color: {
          dark: '#34a853',
          light: '#ffffff'
        }
      }
    },
    {
      name: 'qrcode-rounded',
      options: {
        ...baseOptions,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        type: 'svg'
      }
    }
  ];
  
  for (const style of styles) {
    try {
      // 生成二维码数据 URL
      const dataUrl = await QRCode.toDataURL(websiteUrl, style.options);
      
      // 提取 base64 数据
      const base64Data = dataUrl.replace(/^data:image\/(png|svg);base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // 保存文件
      const extension = style.options.type === 'svg' ? 'svg' : 'png';
      const outputPath = path.join(outputDir, `${style.name}.${extension}`);
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`二维码已生成并保存到: ${outputPath}`);
      
    } catch (error) {
      console.error(`生成 ${style.name} 二维码时出错:`, error);
    }
  }
}

// 运行生成函数
generateQRCodes();
