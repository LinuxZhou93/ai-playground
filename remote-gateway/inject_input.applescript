
on run argv
    set inputString to item 1 of argv
    
    -- 将内容拷贝到剪贴板，这能完美处理中文和特殊符号
    set the clipboard to inputString
    
    tell application "System Events"
        -- 确保作用于当前最前端窗口
        set frontApp to name of first application process whose frontmost is true
        
        -- 模拟 Cmd+V 粘贴
        keystroke "v" using {command down}
        delay 0.1
        
        -- 模拟回车
        keystroke return
    end tell
end run
