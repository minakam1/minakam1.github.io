---
title: 想做个好！用！的录音
date: 2026-03-09 19:30:25
tags: coding
---

# 实时录音与编辑App开发文档  
**版本**：1.0  
**最后更新**：2026-03-09  

---

## 1. 项目概述

### 1.1 背景与目标
本项目旨在开发一款跨平台的录音应用，核心特色包括：
- **实时编辑**：在录音过程中或录音后，可对任意音频段落进行删除、重录、插入、排序等操作。
- **撤回上一句**：支持撤销最近一次录音或编辑动作（可多次撤回）。
- **实时语音识别**：在录音同时，通过端侧引擎将语音实时转换为文字，并与音频段落同步展示，便于基于文本的内容定位和编辑。
- **多平台支持**：基于Flutter框架，覆盖iOS、Android、Web及桌面端（Windows/macOS）。

**性能优先**是贯穿设计的核心原则，所有功能需保证低延迟、低资源消耗，并在端侧完成隐私数据处理。

### 1.2 目标用户
- 播客/访谈录制者
- 语言学习者
- 会议记录人员
- 创意工作者

---

## 2. 技术栈概览

| 领域         | 技术选择                                                                 |
|--------------|--------------------------------------------------------------------------|
| 跨平台框架   | Flutter 3.x                                                              |
| 状态管理     | BLoC / Riverpod（视团队偏好）                                            |
| 音频录制与播放 | `flutter_sound` 或自定义原生插件（需获取实时PCM回调）                    |
| 实时语音识别 | **Moonshine**（端侧，跨平台C++核心，MIT协议）                              |
| 音频处理（编辑/导出） | 分段存储 + FFmpeg（用于拼接导出）                                        |
| 本地存储     | 文件系统（音频分段）+ SQLite（元数据）                                   |
| 波形绘制     | 自定义绘制（基于振幅数据）或使用 `fl_chart` 扩展                         |

---

## 3. 整体架构

### 3.1 分层架构图（文字描述）
```
┌─────────────────────────────────────────────────────────────┐
│                         UI层 (Flutter Widgets)                │
│  - 录音控制面板、波形显示、段落列表、文字展示、撤回/重做按钮        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      逻辑层 (BLoC/Provider)                   │
│  - 管理录音状态、段落列表、操作历史（命令模式）                    │
│  - 协调音频引擎与识别引擎的数据流                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     音频引擎层 (原生模块)                      │
│  - 录音模块：获取PCM流，分段存储音频文件                          │
│  - 播放模块：播放指定段落或混合播放                              │
│  - 波形生成：实时计算振幅数据                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     识别引擎层 (Moonshine)                     │
│  - 接收PCM流，返回实时文字片段                                   │
│  - 支持增量识别（缓存机制）                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       数据层 (本地)                            │
│  - 音频分段文件（.wav/.aac）                                    │
│  - 项目元数据数据库（SQLite）                                   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 核心数据模型
```dart
class AudioSegment {
  final String id;               // UUID
  final String filePath;          // 音频文件路径
  double startTime;               // 在整个项目中的起始时间（秒）
  double duration;                // 时长
  List<double> waveformPeaks;     // 波形峰值（用于显示）
  String transcript;              // 实时识别的文字内容
  // ... 其他元数据
}

class Project {
  final String id;
  List<AudioSegment> segments;    // 有序段落列表
  DateTime createdAt;
  DateTime modifiedAt;
  // ... 项目设置（采样率、格式等）
}

// 操作历史记录（命令模式）
abstract class EditCommand {
  void apply(Project project);
  void undo(Project project);
}
```

---

## 4. 模块设计与实现

### 4.1 录音模块
**职责**：采集麦克风音频，提供实时PCM回调，自动分段存储。

**技术实现**：
- 使用 `flutter_sound` 的 `Recorder` 类，开启 `enableVoiceProcessing` 并设置回调频率（如每100ms回调一次）。
- 在回调中获取 `buffer`，同时写入当前段落文件和传递给识别模块。
- 自动分段逻辑：可基于静音检测（振幅低于阈值持续X秒）或用户手动打点。
- 每段结束时，关闭文件并创建新的 `AudioSegment` 对象，更新UI。

**性能要点**：
- 音频格式统一为 **16kHz采样率、单声道、PCM 16bit**，这是Moonshine推荐的输入格式，同时可降低存储和计算开销。
- 写入文件使用异步IO，避免阻塞录音线程。

### 4.2 Moonshine实时识别模块
**职责**：将PCM流实时转换为文字，并返回带时间戳的片段。

#### 4.2.1 Moonshine集成步骤（以Flutter插件形式）
由于Moonshine官方提供C++核心及iOS/Android示例，需要封装为Flutter插件。

1. **创建Flutter插件**（如 `moonshine_flutter`）：
   - 在 `ios/` 和 `android/` 目录下分别集成Moonshine的native库。
2. **iOS集成**：
   - 下载Moonshine iOS示例，将 `Moonshine.xcframework` 添加到插件Xcode项目。
   - 创建Swift类封装识别器，通过`FlutterMethodChannel`与Dart通信。
3. **Android集成**：
   - 将Moonshine的C++库通过CMake或预编译 `.so` 集成到Android模块。
   - 使用JNI封装调用，同样通过MethodChannel暴露给Dart。
4. **Dart API设计**：
```dart
abstract class MoonshineRecognizer {
  Future<void> initialize({required String modelPath}); // 加载模型
  void startListening();                                 // 开始识别（需持续传入PCM）
  void stopListening();                                  // 停止识别
  Stream<RecognitionResult> get onPartialResult;         // 实时结果流
  Stream<RecognitionResult> get onFinalResult;           // 最终结果流（句子结束）
}

class RecognitionResult {
  final String text;
  final double startTime; // 相对录音开始的时间
  final double endTime;
  final bool isFinal;
}
```
5. **数据传输**：在录音模块的PCM回调中，通过MethodChannel将数据传递给native识别器（或使用共享内存优化）。

#### 4.2.2 识别结果与段落关联
- 识别引擎返回的文本片段带有时间戳，逻辑层根据时间戳将其追加到对应的 `AudioSegment` 的 `transcript` 字段。
- 如果识别结果是最终结果（句子结束），可将其作为一个独立的“子句”存储，便于后续基于句子的撤回。

#### 4.2.3 性能优化
- **模型选择**：Moonshine提供Tiny、Base、Small、Medium模型。对于移动端，推荐**Tiny或Base**（34MB/74MB），延迟<100ms；桌面端可选用Medium（245MB）以获得更高精度。
- **缓存机制**：Moonshine内部支持编码器缓存，每次处理新音频时只需处理新增部分，无需重复计算，务必启用。
- **降采样**：若系统麦克风默认采样率高，在录音模块提前降采样至16kHz，减少识别模块负担。

### 4.3 编辑与撤回模块
**职责**：维护段落列表，支持用户编辑操作，并记录操作历史。

**实现方式**：
- 使用**命令模式**封装所有编辑操作（添加段落、删除段落、替换段落、移动顺序等）。
- 每次操作生成一个命令对象，执行后推入 `undoStack`，同时清空 `redoStack`。
- 撤回时弹出栈顶命令，执行其 `undo` 方法，并推入 `redoStack`。

**示例命令**：
```dart
class DeleteSegmentCommand implements EditCommand {
  final String segmentId;
  AudioSegment? _deletedSegment; // 保存快照用于撤销

  void apply(Project project) {
    _deletedSegment = project.segments.firstWhere((s) => s.id == segmentId);
    project.segments.removeWhere((s) => s.id == segmentId);
  }

  void undo(Project project) {
    if (_deletedSegment != null) {
      project.segments.insertAtOriginalPosition(_deletedSegment);
    }
  }
}
```

**撤回与重做UI**：顶部工具栏显示可撤销/重做次数，按钮状态实时更新。

### 4.4 播放与波形模块
- **播放**：使用音频播放器支持播放指定段落（`flutter_sound` 或 `audioplayers`）。若需连续播放多个段落，可依次播放或先拼接再播放（后者可能涉及临时文件）。
- **波形绘制**：
  - 录制时：从PCM回调计算振幅（如取绝对值平均值），每50ms更新一次波形图。
  - 回放时：从存储的 `waveformPeaks` 绘制，无需重新计算。
  - 使用 `CustomPainter` 在Canvas上绘制波形条。

### 4.5 导出模块
**职责**：将段落列表按顺序拼接，导出为单一音频文件（MP3或WAV）。

**实现**：
- 使用FFmpeg命令行工具或Flutter FFmpeg封装库，将所有分段文件列表拼接。
- 若需要格式转换，一并完成。
- 导出进度通过Stream反馈给UI。

---

## 5. 多平台注意事项

### 5.1 iOS
- **权限**：需在 `Info.plist` 添加麦克风权限描述（`NSMicrophoneUsageDescription`）。
- **音频会话**：确保录音时设置 `AVAudioSessionCategoryPlayAndRecord`，并启用扬声器输出。
- **后台模式**：若需后台录音，需勾选 `Audio, AirPlay, and Picture in Picture` 后台模式。

### 5.2 Android
- **权限**：动态申请 `RECORD_AUDIO` 权限。
- **音频焦点**：正确处理音频焦点变化，避免与其他应用冲突。
- **低延迟**：在 `AndroidManifest.xml` 中为MainActivity添加 `android:hardwareAccelerated="true"`。

### 5.3 Web
- **录音**：使用Web Audio API，通过 `dart:html` 或 `package:web` 调用。
- **Moonshine**：Moonshine目前未提供官方WebAssembly版本。可选方案：
  - 自行编译C++核心为WASM，并提供JS桥接。
  - 如果Web不是核心目标，可暂缓或降级使用浏览器原生Web Speech API（但非端侧，隐私性降低）。

### 5.4 桌面端（Windows/macOS）
- **录音**：桌面平台可使用 `flutter_sound` 的桌面支持或调用系统API。
- **Moonshine**：可直接集成C++库，Windows上使用MSVC编译，macOS上使用Xcode。

---

## 6. 性能优化策略

### 6.1 音频处理优化
- **分段存储**：避免单一大文件，编辑时只需操作对应分段，无需重编码。
- **波形预计算**：每个段落保存压缩后的波形峰值（如每100ms一个点），避免每次绘制读取文件。
- **缓存识别结果**：识别文字与段落绑定，编辑段落时清除对应文字缓存。

### 6.2 内存优化
- **音频文件流式读写**：不将整个文件加载到内存，使用文件流。
- **模型加载**：Moonshine模型文件较大，初始化时一次性加载到内存，后续重复使用。
- **及时释放**：停止录音后，释放音频资源和识别引擎。

### 6.3 线程管理
- **录音线程**：保持高优先级，避免卡顿。
- **识别线程**：Moonshine内部可能使用多线程，确保在native层配置合理线程数。
- **UI线程**：所有UI更新在主线程，耗时操作（如文件写入、模型加载）放在后台Isolate或原生线程。

### 6.4 模型量化与裁剪
- Moonshine支持量化版本（如int8），可进一步减少模型体积和加速推理。如有需要，可自行量化模型。

---

## 7. 开发与测试指南

### 7.1 环境准备
- Flutter SDK 3.x
- 各平台原生开发环境（Xcode, Android Studio, VS Code）
- 下载Moonshine预训练模型（https://github.com/usefulsensors/moonshine）

### 7.2 关键代码示例
#### 录音与识别协同（Dart层简化）
```dart
class RecordingBloc {
  final MoonshineRecognizer _recognizer;
  final AudioRecorder _recorder;
  final List<AudioSegment> _segments = [];

  void startRecording() async {
    _recorder.start(
      sampleRate: 16000,
      onData: (List<int> pcmData) {
        // 写入当前段落文件
        _currentSegmentFile.writeAsBytes(pcmData, mode: FileMode.append);
        // 发送到识别器
        _recognizer.addAudio(pcmData);
      },
    );
    _recognizer.onPartialResult.listen((result) {
      // 更新当前段落的transcript
      _segments.last.transcript += result.text;
      // 通知UI更新
    });
  }
}
```

### 7.3 测试要点
- **实时性测试**：录制一段话，观察文字出现延迟（应小于200ms）。
- **撤回测试**：执行多次编辑操作，验证撤回/重做后状态正确。
- **多平台兼容性**：在真实设备上测试录音、识别和导出功能。
- **压力测试**：长时间录音（如1小时），监控内存和CPU占用。

---

## 8. 常见问题与解决方案

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| 录音有杂音或断流 | 音频会话冲突或缓冲区太小 | 调整录音参数，增加缓冲区大小；确保音频焦点唯一 |
| 识别结果延迟大 | 模型太大或CPU过载 | 换用Tiny模型；启用Moonshine缓存；检查是否降采样至16kHz |
| 撤回后音频文件未删除 | 命令未正确处理文件清理 | 在命令的undo中删除对应文件（注意引用计数） |
| Web平台无识别 | Moonshine无WASM支持 | 降级使用Web Speech API；或暂不支持Web端识别 |
| 导出文件时长不对 | 分段时间戳计算错误 | 检查每个段落的startTime和duration，确保连续 |

---

## 9. 未来扩展
- **云端同步**：将项目文件同步到用户云盘（如iCloud、Google Drive）。
- **多轨编辑**：支持同时录制多个音轨（如访谈双方）。
- **智能标记**：基于识别文字自动标记关键词或发言人。
- **实时翻译**：将识别文字实时翻译为目标语言。

---

**文档结束**  
如有疑问或需要进一步细化，请联系开发团队。