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
from pyodide.ffi import create_proxy

# 创建一个 mock 的 chatbear.eai 模块
class RobotAgentMock:
    def __init__(self, name="Xiao Chuang"):
        self.name = name
        print(f"🤖 机器人 Agent \\"{self.name}\\" 已初始化。")
    
    def move_to(self, position):
        print(f"[{self.name}] 移动到: {position}")
        
    def say(self, message):
        print(f"[{self.name}] 说: {message}")
        
    def start_perception(self, callback):
        print(f"[{self.name}] 视觉感知已启动。")
        # 模拟检测到苹果
        class Data:
            object_name = "Apple"
            position = [1.0, 2.0, 0.0]
        
        callback(Data())

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
