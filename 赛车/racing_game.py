import tkinter as tk
from tkinter import messagebox
import random
import time

# 设置游戏窗口参数
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
GAME_SPEED = 16  # 毫秒

# 颜色定义 (RGB)
BLACK = "#000000"
WHITE = "#FFFFFF"
RED = "#FF0000"
GREEN = "#00FF00"
BLUE = "#0064FF"
YELLOW = "#FFFF00"
GRAY = "#808080"



class Player:
    """玩家赛车类"""
    def __init__(self, x, y, width, height):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.speed = 15
        self.canvas_id = None

    def move_left(self, max_x=0):
        """向左移动"""
        if self.x > max_x:
            self.x -= self.speed

    def move_right(self, max_x=SCREEN_WIDTH):
        """向右移动"""
        if self.x + self.width < max_x:
            self.x += self.speed

    def get_rect(self):
        """获取玩家矩形"""
        return (self.x, self.y, self.x + self.width, self.y + self.height)


class Obstacle:
    """障碍物类"""
    def __init__(self):
        self.width = random.randint(40, 80)
        self.x = random.randint(0, SCREEN_WIDTH - self.width)
        self.y = -50
        self.height = 50
        self.speed = 3
        self.canvas_id = None

    def update(self):
        """更新障碍物位置"""
        self.y += self.speed

    def get_rect(self):
        """获取障碍物矩形"""
        return (self.x, self.y, self.x + self.width, self.y + self.height)

    def is_off_screen(self):
        """检查是否超出屏幕"""
        return self.y > SCREEN_HEIGHT


class Game:
    """游戏主类"""
    def __init__(self, root):
        self.root = root
        self.root.title("赛车小游戏")
        self.root.geometry(f"{SCREEN_WIDTH}x{SCREEN_HEIGHT}")
        self.root.resizable(False, False)
        
        # 创建画布
        self.canvas = tk.Canvas(self.root, width=SCREEN_WIDTH, height=SCREEN_HEIGHT, bg=BLACK)
        self.canvas.pack()
        self.canvas.bind("<Key>", self.on_key_press)
        self.canvas.focus()
        
        # 游戏状态
        self.running = True
        self.game_started = False
        self.game_over = False
        self.score = 0
        self.difficulty = 0
        
        # 游戏对象
        self.player = Player(SCREEN_WIDTH // 2 - 25, SCREEN_HEIGHT - 70, 50, 60)
        self.obstacles = []
        
        # 计时器
        self.spawn_timer = 0
        self.spawn_rate = 60
        self.base_speed = 3
        
        # 键盘状态
        self.keys_pressed = set()
        
        # 绘制开始画面
        self.draw_start_screen()
        
        # 启动游戏循环
        self.game_loop()

    def on_key_press(self, event):
        """处理键盘按下"""
        self.keys_pressed.add(event.keysym)
        
        if event.keysym == "space":
            if not self.game_started or self.game_over:
                self.reset_game()
        elif event.keysym == "Escape":
            self.running = False
            self.root.quit()

    def on_key_release(self, event):
        """处理键盘释放"""
        if event.keysym in self.keys_pressed:
            self.keys_pressed.discard(event.keysym)

    def detect_collision(self, rect1, rect2):
        """检测两个矩形是否碰撞"""
        x1_min, y1_min, x1_max, y1_max = rect1
        x2_min, y2_min, x2_max, y2_max = rect2
        return not (x1_max < x2_min or x1_min > x2_max or y1_max < y2_min or y1_min > y2_max)

    def reset_game(self):
        """重置游戏"""
        self.game_started = True
        self.game_over = False
        self.score = 0
        self.difficulty = 0
        self.spawn_timer = 0
        self.obstacles = []
        self.player.x = SCREEN_WIDTH // 2 - 25
        self.base_speed = 3
        self.spawn_rate = 60

    def update(self):
        """更新游戏状态"""
        if not self.game_started or self.game_over:
            return

        # 更新玩家位置
        if "Left" in self.keys_pressed or "a" in self.keys_pressed:
            self.player.move_left()
        if "Right" in self.keys_pressed or "d" in self.keys_pressed:
            self.player.move_right()

        # 生成障碍物
        self.spawn_timer += 1
        if self.spawn_timer >= self.spawn_rate:
            self.obstacles.append(Obstacle())
            self.spawn_timer = 0
            if self.spawn_rate > 30:
                self.spawn_rate -= 1

        # 更新障碍物
        for obstacle in self.obstacles:
            obstacle.speed = self.base_speed + (self.difficulty * 0.1)
            obstacle.update()

        # 检查碰撞
        player_rect = self.player.get_rect()
        for obstacle in self.obstacles:
            if self.detect_collision(player_rect, obstacle.get_rect()):
                self.game_over = True
                return

        # 移除超出屏幕的障碍物并增加分数
        self.obstacles = [obs for obs in self.obstacles if not obs.is_off_screen()]
        self.score = (60 - len(self.obstacles)) * 10  # 简单计分方式
        self.difficulty = self.score // 100

        if self.base_speed < 8:
            self.base_speed += 0.01

    def draw_start_screen(self):
        """绘制开始画面"""
        self.canvas.delete("all")
        
        # 绘制标题
        self.canvas.create_text(
            SCREEN_WIDTH // 2, 150,
            text="赛车小游戏",
            font=("Arial", 48, "bold"),
            fill=BLUE
        )
        
        # 绘制开始提示
        self.canvas.create_text(
            SCREEN_WIDTH // 2, 250,
            text="按 SPACE 开始游戏",
            font=("Arial", 36),
            fill=WHITE
        )
        
        # 绘制操作说明
        self.canvas.create_text(
            SCREEN_WIDTH // 2, 350,
            text="左/右箭头 或 A/D 键 - 移动赛车",
            font=("Arial", 20),
            fill=GRAY
        )
        
        self.canvas.create_text(
            SCREEN_WIDTH // 2, 380,
            text="ESC - 退出游戏",
            font=("Arial", 20),
            fill=GRAY
        )

    def draw_game_screen(self):
        """绘制游戏画面"""
        self.canvas.delete("all")
        
        # 绘制背景
        self.canvas.create_rectangle(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, fill=BLACK, outline=BLACK)
        
        # 绘制道路线
        self.canvas.create_line(SCREEN_WIDTH // 4, 0, SCREEN_WIDTH // 4, SCREEN_HEIGHT, fill=GRAY, width=2)
        self.canvas.create_line(3 * SCREEN_WIDTH // 4, 0, 3 * SCREEN_WIDTH // 4, SCREEN_HEIGHT, fill=GRAY, width=2)
        
        # 绘制玩家
        px1, py1, px2, py2 = self.player.get_rect()
        self.canvas.create_rectangle(px1, py1, px2, py2, fill=GREEN, outline=GREEN)
        
        # 绘制障碍物
        for obstacle in self.obstacles:
            ox1, oy1, ox2, oy2 = obstacle.get_rect()
            self.canvas.create_rectangle(ox1, oy1, ox2, oy2, fill=RED, outline=RED)
        
        # 显示分数
        self.canvas.create_text(20, 20, text=f"分数: {self.score}", font=("Arial", 24), fill=WHITE, anchor="nw")
        
        # 显示难度
        self.canvas.create_text(20, 50, text=f"难度等级: {self.difficulty}", font=("Arial", 16), fill=YELLOW, anchor="nw")

    def draw_game_over_screen(self):
        """绘制游戏结束画面"""
        self.canvas.delete("all")
        
        # 绘制背景
        self.canvas.create_rectangle(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, fill=BLACK, outline=BLACK)
        
        # 绘制游戏结束文本
        self.canvas.create_text(
            SCREEN_WIDTH // 2, 150,
            text="游戏结束",
            font=("Arial", 48, "bold"),
            fill=RED
        )
        
        self.canvas.create_text(
            SCREEN_WIDTH // 2, 250,
            text=f"最终分数: {self.score}",
            font=("Arial", 36),
            fill=WHITE
        )
        
        self.canvas.create_text(
            SCREEN_WIDTH // 2, 310,
            text=f"达到难度等级: {self.difficulty}",
            font=("Arial", 36),
            fill=WHITE
        )
        
        self.canvas.create_text(
            SCREEN_WIDTH // 2, 400,
            text="按 SPACE 重新开始",
            font=("Arial", 32),
            fill=YELLOW
        )

    def draw(self):
        """绘制游戏"""
        if not self.game_started:
            self.draw_start_screen()
        elif self.game_over:
            self.draw_game_over_screen()
        else:
            self.draw_game_screen()

    def game_loop(self):
        """游戏主循环"""
        if self.running:
            self.canvas.bind("<KeyRelease>", self.on_key_release)
            self.update()
            self.draw()
            self.root.after(GAME_SPEED, self.game_loop)
        else:
            self.root.quit()


if __name__ == "__main__":
    root = tk.Tk()
    game = Game(root)
    root.mainloop()
