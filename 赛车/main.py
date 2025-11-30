import pygame
import random
import sys
from enum import Enum

# 初始化 Pygame
pygame.init()

# 颜色定义
class Color:
    BLACK = (0, 0, 0)
    WHITE = (255, 255, 255)
    RED = (255, 0, 0)
    BLUE = (0, 0, 255)
    GREEN = (0, 255, 0)
    YELLOW = (255, 255, 0)
    GRAY = (128, 128, 128)

# 游戏状态
class GameState(Enum):
    MENU = 1
    PLAYING = 2
    GAME_OVER = 3

# 屏幕设置
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
FPS = 60

# 创建屏幕
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("赛车小游戏")
clock = pygame.time.Clock()
font_large = pygame.font.Font(None, 72)
font_medium = pygame.font.Font(None, 48)
font_small = pygame.font.Font(None, 32)

class Player(pygame.sprite.Sprite):
    """玩家赛车"""
    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.Surface((50, 80))
        self.image.fill(Color.BLUE)
        self.rect = self.image.get_rect()
        self.rect.center = (x, y)
        self.speed_x = 0
        self.speed_y = 5
        self.max_speed_y = 7
        self.acceleration = 0.3
        self.health = 1
        
    def update(self):
        # 处理输入
        keys = pygame.key.get_pressed()
        
        # 水平移动
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            self.speed_x = -7
        elif keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            self.speed_x = 7
        else:
            self.speed_x = 0
            
        # 垂直速度
        if keys[pygame.K_UP] or keys[pygame.K_w]:
            self.speed_y = min(self.speed_y + self.acceleration, self.max_speed_y)
        elif keys[pygame.K_DOWN] or keys[pygame.K_s]:
            self.speed_y = max(self.speed_y - self.acceleration, 3)
        else:
            self.speed_y = 5
        
        # 更新位置
        self.rect.x += self.speed_x
        self.rect.y -= self.speed_y
        
        # 边界检测
        if self.rect.left < 0:
            self.rect.left = 0
        if self.rect.right > SCREEN_WIDTH:
            self.rect.right = SCREEN_WIDTH
        if self.rect.top < 0:
            self.rect.top = 0
        if self.rect.bottom > SCREEN_HEIGHT:
            self.rect.bottom = SCREEN_HEIGHT
    
    def draw_advanced(self, surface):
        """绘制更复杂的赛车外形"""
        pygame.draw.rect(surface, Color.BLUE, self.rect)
        # 前窗
        pygame.draw.rect(surface, Color.YELLOW, 
                        (self.rect.x + 10, self.rect.y + 10, 30, 20))
        # 轮子
        pygame.draw.circle(surface, Color.BLACK, 
                          (self.rect.x + 15, self.rect.y), 5)
        pygame.draw.circle(surface, Color.BLACK, 
                          (self.rect.x + 35, self.rect.y), 5)

class Enemy(pygame.sprite.Sprite):
    """敌车"""
    def __init__(self, x, y, speed):
        super().__init__()
        self.image = pygame.Surface((50, 80))
        self.image.fill(Color.RED)
        self.rect = self.image.get_rect()
        self.rect.center = (x, y)
        self.speed = speed
        
    def update(self):
        self.rect.y += self.speed
        
        # 如果敌车离开屏幕，移除它
        if self.rect.top > SCREEN_HEIGHT:
            self.kill()
    
    def draw_advanced(self, surface):
        """绘制敌车"""
        pygame.draw.rect(surface, Color.RED, self.rect)
        # 前窗
        pygame.draw.rect(surface, Color.YELLOW, 
                        (self.rect.x + 10, self.rect.y + 10, 30, 20))

class Game:
    """游戏主类"""
    def __init__(self):
        self.state = GameState.MENU
        self.score = 0
        self.wave = 1
        self.enemy_spawn_rate = 60
        self.enemy_speed = 5
        self.spawn_counter = 0
        
        self.player_group = pygame.sprite.Group()
        self.enemy_group = pygame.sprite.Group()
        
        self.player = Player(SCREEN_WIDTH // 2, SCREEN_HEIGHT - 100)
        self.player_group.add(self.player)
        
    def reset(self):
        """重置游戏"""
        self.score = 0
        self.wave = 1
        self.enemy_spawn_rate = 60
        self.enemy_speed = 5
        self.spawn_counter = 0
        
        self.player_group.empty()
        self.enemy_group.empty()
        
        self.player = Player(SCREEN_WIDTH // 2, SCREEN_HEIGHT - 100)
        self.player_group.add(self.player)
        
    def handle_events(self):
        """处理事件"""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    return False
                elif event.key == pygame.K_SPACE:
                    if self.state == GameState.MENU:
                        self.state = GameState.PLAYING
                    elif self.state == GameState.GAME_OVER:
                        self.reset()
                        self.state = GameState.PLAYING
        return True
    
    def update(self):
        """更新游戏状态"""
        if self.state == GameState.PLAYING:
            self.player_group.update()
            self.enemy_group.update()
            
            # 生成敌车
            self.spawn_counter += 1
            if self.spawn_counter >= self.enemy_spawn_rate:
                x = random.randint(50, SCREEN_WIDTH - 50)
                enemy = Enemy(x, -40, self.enemy_speed)
                self.enemy_group.add(enemy)
                self.spawn_counter = 0
                
                # 难度递增
                self.enemy_spawn_rate = max(30, 60 - self.wave)
                self.enemy_speed = min(10, 5 + self.wave * 0.1)
            
            # 碰撞检测
            collisions = pygame.sprite.spritecollide(self.player, self.enemy_group, True)
            if collisions:
                self.state = GameState.GAME_OVER
                self.final_score = self.score
                self.final_wave = self.wave
            
            # 计分
            initial_enemy_count = len(self.enemy_group)
            # 计数敌车
            for enemy in self.enemy_group:
                if enemy.rect.y > SCREEN_HEIGHT // 2:
                    # 只在敌车通过中线时计分一次
                    if not hasattr(enemy, 'scored'):
                        enemy.scored = False
                    if not enemy.scored and enemy.rect.y > SCREEN_HEIGHT - 150:
                        self.score += 10
                        self.wave = self.score // 100 + 1
                        enemy.scored = True
    
    def draw(self):
        """绘制游戏"""
        screen.fill(Color.BLACK)
        
        if self.state == GameState.MENU:
            self.draw_menu()
        elif self.state == GameState.PLAYING:
            self.draw_game()
        elif self.state == GameState.GAME_OVER:
            self.draw_game_over()
        
        pygame.display.flip()
    
    def draw_menu(self):
        """绘制菜单"""
        title = font_large.render("赛车游戏", True, Color.YELLOW)
        title_rect = title.get_rect(center=(SCREEN_WIDTH // 2, 100))
        screen.blit(title, title_rect)
        
        start = font_medium.render("按 SPACE 开始", True, Color.WHITE)
        start_rect = start.get_rect(center=(SCREEN_WIDTH // 2, 300))
        screen.blit(start, start_rect)
        
        controls = [
            "控制方式:",
            "↑/W - 加速",
            "↓/S - 减速",
            "←/A - 左转",
            "→/D - 右转"
        ]
        
        y = 380
        for control in controls:
            text = font_small.render(control, True, Color.GREEN)
            text_rect = text.get_rect(center=(SCREEN_WIDTH // 2, y))
            screen.blit(text, text_rect)
            y += 40
    
    def draw_game(self):
        """绘制游戏画面"""
        # 绘制道路背景
        pygame.draw.rect(screen, Color.GRAY, (0, 0, SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.draw.line(screen, Color.WHITE, (SCREEN_WIDTH // 2, 0), 
                        (SCREEN_WIDTH // 2, SCREEN_HEIGHT), 3)
        
        # 绘制玩家和敌车
        self.player_group.draw(screen)
        self.enemy_group.draw(screen)
        
        # 绘制分数和波数
        score_text = font_small.render(f"分数: {self.score}", True, Color.WHITE)
        screen.blit(score_text, (10, 10))
        
        wave_text = font_small.render(f"波数: {self.wave}", True, Color.WHITE)
        screen.blit(wave_text, (10, 50))
        
        speed_text = font_small.render(f"敌车速度: {self.enemy_speed:.1f}", True, Color.WHITE)
        screen.blit(speed_text, (SCREEN_WIDTH - 250, 10))
    
    def draw_game_over(self):
        """绘制游戏结束画面"""
        pygame.draw.rect(screen, Color.BLACK, (0, 0, SCREEN_WIDTH, SCREEN_HEIGHT))
        
        # 半透明覆盖层
        overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        overlay.set_alpha(200)
        overlay.fill(Color.BLACK)
        screen.blit(overlay, (0, 0))
        
        game_over_text = font_large.render("游戏结束!", True, Color.RED)
        game_over_rect = game_over_text.get_rect(center=(SCREEN_WIDTH // 2, 100))
        screen.blit(game_over_text, game_over_rect)
        
        final_score_text = font_medium.render(f"最终分数: {self.final_score}", True, Color.YELLOW)
        final_score_rect = final_score_text.get_rect(center=(SCREEN_WIDTH // 2, 250))
        screen.blit(final_score_text, final_score_rect)
        
        wave_text = font_medium.render(f"到达波数: {self.final_wave}", True, Color.YELLOW)
        wave_rect = wave_text.get_rect(center=(SCREEN_WIDTH // 2, 320))
        screen.blit(wave_text, wave_rect)
        
        restart = font_small.render("按 SPACE 重新开始", True, Color.WHITE)
        restart_rect = restart.get_rect(center=(SCREEN_WIDTH // 2, 450))
        screen.blit(restart, restart_rect)
        
        exit_text = font_small.render("按 ESC 退出", True, Color.WHITE)
        exit_rect = exit_text.get_rect(center=(SCREEN_WIDTH // 2, 500))
        screen.blit(exit_text, exit_rect)

def main():
    """主函数"""
    game = Game()
    running = True
    
    while running:
        running = game.handle_events()
        game.update()
        game.draw()
        clock.tick(FPS)
    
    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()
