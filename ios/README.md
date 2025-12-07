# 科技特长生 iOS App

这是一个混合架构的 iOS 应用，将现有的"科技特长生培养系统"网站完整移植到 iOS 平台。

## 核心特性

### 🎯 设计理念
- **保留原生Web体验**：完整保留网站的交互、动画、3D背景等所有视觉效果
- **原生导航架构**：使用 SwiftUI NavigationStack 实现符合 iOS 规范的双层导航
- **零侵入式集成**：不修改网站原有的 HTML/CSS/JS，通过导航拦截实现混合体验

### 📱 双层架构
1. **第一层 - 主页**：加载 `index.html`，用户可以与原生 Web Hotbar 交互
2. **第二层 - 详情页**：点击 Hotbar 按钮后，原生导航栈推送新页面，支持侧滑返回

### 🛠️ 技术实现
- **WebView 导航拦截**：通过 `WKNavigationDelegate` 拦截链接点击
- **智能路由**：区分页面跳转（原生导航）和 JS 交互（Web 内处理）
- **资源加载**：支持本地文件系统访问，确保 CSS/JS/Assets 正确加载

## 项目结构

```
ios/AiPlayground/AiPlayground/
├── AiPlaygroundApp.swift      # App 入口
├── ContentView.swift          # 主视图（NavigationStack + WebView）
├── WebView.swift              # WebKit 封装（支持导航拦截）
├── NavigationItem.swift       # 导航数据模型
└── Info.plist                 # 应用配置
```

## 🚀 Xcode 项目设置指南

### 步骤 1: 创建 Xcode 项目
1. 打开 **Xcode**
2. 选择 **File → New → Project**
3. 选择 **iOS → App**
4. 配置项目：
   - Product Name: `AiPlayground`
   - Team: 选择你的开发团队
   - Organization Identifier: `com.yourcompany`
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Storage: **None**

### 步骤 2: 添加 Swift 源文件
1. 删除 Xcode 自动生成的 `ContentView.swift`
2. 将以下文件拖入项目（勾选 "Copy items if needed"）：
   ```
   - AiPlaygroundApp.swift
   - ContentView.swift
   - WebView.swift
   - NavigationItem.swift
   ```
3. 替换 `Info.plist`（或手动配置显示名称为"科技特长生"）

### 步骤 3: 添加网站资源 ⚠️ 关键步骤
1. 将网站根目录的所有文件拖入 Xcode 项目：
   ```
   - index.html
   - *.html (所有页面文件)
   - assets/ 文件夹（包含 css/, js/, images/ 等）
   - *.css, *.js, *.png, *.mp3 等所有资源
   ```
2. **重要**：在弹窗中配置：
   - ✅ **Copy items if needed**
   - ✅ **Create folder references**（选择蓝色文件夹图标，而非黄色）
   - ✅ Add to targets: `AiPlayground`

3. 验证：在 Xcode 左侧导航栏中，`assets` 应显示为**蓝色文件夹**

### 步骤 4: 配置 Build Settings
1. 选择项目 → Target → **Build Settings**
2. 搜索 "Other Linker Flags"
3. 添加: `-weak_framework WebKit`（通常不需要，SwiftUI 自动处理）

### 步骤 5: 运行应用
1. 选择目标设备（iOS Simulator 或真机）
2. 点击 **Run** (⌘R)
3. 首次运行可能需要等待资源加载

## 📝 常见问题

### Q: WebView 显示空白？
**A**: 检查资源是否正确添加到 Bundle：
```bash
# 在 Xcode 中检查
Project Navigator → AiPlayground → Build Phases → Copy Bundle Resources
# 确保 index.html 和 assets 文件夹在列表中
```

### Q: CSS/JS 加载失败？
**A**: 确保使用了 **folder references**（蓝色文件夹），而非 group references（黄色文件夹）

### Q: 导航拦截不工作？
**A**: 检查 `WebView.swift` 中的 `navigationDelegate` 是否正确设置

### Q: 如何调试 WebView 内容？
**A**: 
1. 在 Mac 上打开 **Safari → 开发菜单**
2. 选择你的 iOS 模拟器/设备
3. 选择 WebView 进行调试

## 🔧 高级定制

### 添加新页面
1. 在网站根目录添加新的 `.html` 文件
2. 更新 `NavigationItem.swift` 的 `navigationItems` 数组
3. 将新文件添加到 Xcode 项目的 Bundle Resources

### 修改导航逻辑
编辑 `WebView.swift` 中的 `decidePolicyFor navigationAction` 方法：
```swift
// 例如：过滤特定链接
if filename.contains("external") {
    // 使用 Safari 打开外部链接
    UIApplication.shared.open(url)
    decisionHandler(.cancel)
    return
}
```

### 禁用某些交互
如果需要禁用网页中的某些元素（如登录按钮），可以在 `WebView.updateUIView` 中注入 JS：
```swift
webView.evaluateJavaScript("""
    document.getElementById('auth-btn').style.display = 'none';
""", completionHandler: nil)
```

## 📦 构建发布版本

### TestFlight 测试
1. 在 Xcode 中选择 **Product → Archive**
2. 上传到 App Store Connect
3. 在 TestFlight 中分发给测试用户

### App Store 上架
1. 准备应用截图（5.5", 6.5" 尺寸）
2. 编写应用描述
3. 提交审核（确保遵守 Apple 审核指南）

## 🎨 UI 优化建议

1. **启动画面**：在 `Assets.xcassets` 中添加 LaunchScreen 图片
2. **图标**：设计 1024x1024 的 App Icon
3. **暗色模式**：已默认启用 `.preferredColorScheme(.dark)`

## 📄 许可证

与主网站项目保持一致。

---

**技术支持**: 如有问题，请参考 [SwiftUI WebView 官方文档](https://developer.apple.com/documentation/webkit/wkwebview)
