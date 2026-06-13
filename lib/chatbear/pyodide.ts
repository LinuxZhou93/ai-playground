'use client';

export async function loadPyodideEnvironment(stdoutCallback: (msg: string) => void) {
  if (typeof window === 'undefined') return null;

  // 检查是否已经加载过
  if (!(window as any).loadPyodide) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
    script.async = true;
    document.body.appendChild(script);

    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
    });
  }

  const pyodide = await (window as any).loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
  });

  // 设置输出回调
  pyodide.setStdout({ batched: (msg: string) => stdoutCallback(msg) });
  pyodide.setStderr({ batched: (msg: string) => stdoutCallback(`[ERROR] ${msg}`) });

  // 注入预置的上下文或者虚拟库 (可选)
  // 这里我们可以注入一个假的 chatbear 库，防止 import chatbear 报错
  await pyodide.runPythonAsync(`
import sys
import js
from pyodide.ffi import create_proxy

# 创建一个 mock 的 chatbear.eai 模块
class RobotAgentMock:
    def __init__(self, name="Xiao Chuang"):
        self.name = name
        print(f"🤖 机器人 Agent \\"{self.name}\\" 已初始化。")
        try:
            js.window.onRobotReset()
        except:
            pass
    
    def move_to(self, position):
        print(f"[{self.name}] 移动到: {position}")
        try:
            # 兼容 position 数组
            x = float(position[0])
            y = float(position[1])
            js.window.onRobotMove(x, y)
        except Exception as e:
            print(f"JS Bridge Error: {e}")
        
    def say(self, message):
        print(f"[{self.name}] 说: {message}")
        try:
            js.window.onRobotSay(message)
        except:
            pass
        
    def start_perception(self, callback):
        print(f"[{self.name}] 视觉感知已启动。正在扫描周围物体...")
        try:
            js.window.onRobotScan(True)
        except:
            pass
            
        # 模拟 1 秒后检测到苹果
        class Data:
            object_name = "Apple"
            position = [80.0, 50.0, 0.0]
        
        try:
            callback(Data())
        except Exception as e:
            print(f"Perception Callback Error: {e}")

# 注入到 sys.modules
import types
chatbear_mock = types.ModuleType("chatbear")
chatbear_eai_mock = types.ModuleType("chatbear.eai")
chatbear_eai_mock.RobotAgent = RobotAgentMock

sys.modules["chatbear"] = chatbear_mock
sys.modules["chatbear.eai"] = chatbear_eai_mock
  `);

  return pyodide;
}
