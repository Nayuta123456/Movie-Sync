# 一起看Movie-Sync 🎬

基于 [VaalaCat/movie-sync](https://github.com/VaalaCat/movie-sync) 项目的定制版本，专为异地情侣打造的在线同步观影体验。

原作者可能没有异地了，所以没有维护，用起来有一点小bug，遂修改了一下



## ✨ 主要改进

本项目在原版基础上进行了以下优化和改进：

### 🐛 Bug 修复

- **修复用户名不显示问题** - 使用受控组件管理输入状态，确保用户名正确显示
- **修复修改链接无反应问题** - 修复状态和事件监听逻辑
- **修复视频无法播放问题** - 移除 `crossorigin` 属性解决跨域问题
- **修复播放后自动暂停问题** - 忽略自己发出的播放/暂停事件，避免状态冲突
- **修复播放后跳到视频结尾问题** - 修复进度同步逻辑，不同步自己的进度，只同步其他用户

### 🎨 UI 美化

- **全新主题设计** - 粉紫渐变主题，温馨浪漫
- **首页优化**
  - 浮动动画装饰元素
  - 毛玻璃卡片效果
  - 渐变标题和使用说明
- **房间页面优化**
  - 顶部渐变导航栏，显示房间名和当前用户
  - 卡片式布局（加入房间、视频控制、在线观众）
  - 视频加载占位动画
- **用户列表美化**
  - 卡片式用户显示
  - 当前用户高亮
  - 头像和播放状态标签
  - 格式化时间显示
- **播放器优化**
  - 中央粉色播放按钮
  - 加载动画指示器

### 🆕 新增功能

- **🔄 同步进度按钮** - 手动同步到房间内其他用户的播放进度
  - 显示当前在线用户数量
  - 无其他用户时自动禁用

## 🚀 快速开始

### Docker 部署（推荐）

```bash
docker run -d -p 9999:9999 -e PORT=9999 -e ALLOW_ORIGIN=http://localhost:9999 --name=movie-sync vaalacat/movie-sync
```

### 手动部署

1. 下载 Release 中的可执行文件
2. 创建 `.env` 文件：

```
PORT=8000
ALLOW_ORIGIN=http://localhost:8000
```

3. 运行：

```bash
chmod +x movie-sync-server-linux-amd64
./movie-sync-server-linux-amd64
```

4. 访问 `http://localhost:8000` 开始使用

## 📖 使用说明

1. 打开网站，输入房间名进入
2. 输入你的昵称，点击「加入房间」
3. 粘贴视频直链（支持 MP4、M3U8 等格式），点击「设置视频」
4. 点击播放按钮开始观看
5. 如需同步进度，点击「🔄 同步进度」按钮

## 🛠️ 技术栈

**前端：**
- React 18 + Next.js 14
- TypeScript
- TailwindCSS
- Vidstack (视频播放器)
- Socket.io-client
- Nanostores (状态管理)

**后端：**
- Golang
- Gin
- Socket.io

## 🙏 致谢

- 原项目作者：[VaalaCat](https://github.com/VaalaCat)
- 原项目地址：[https://github.com/VaalaCat/movie-sync](https://github.com/VaalaCat/movie-sync)
- 博客原文：[异地多人在线电影院](https://vaala.cat/2022/04/17/%E5%BC%82%E5%9C%B0%E5%A4%9A%E4%BA%BA%E5%9C%A8%E7%BA%BF%E7%94%B5%E5%BD%B1%E9%99%A2/)

## 📝 License

MIT License
