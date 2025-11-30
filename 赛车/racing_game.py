import pygame
import random
import sys

# 初始化 Pygame
pygame.init()

# 设置游戏窗口
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
SCREEN = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("赛车小游戏")

# 颜色定义
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 100, 255)
YELLOW = (255, 255, 0)
GRAY = (128, 128, 128)

# 时钟
CLOCK = pygame.time.Clock()
FPS = 60

# 字体
FONT_LARGE = pygame.font.Font(None, 48)
FONT_MEDIUM = pygame.font.Font(None, 36)
FONT_SMALL = pygame.font.Font(None, 24)


class Player(pygame.sprite.Sprite):
    """玩家赛车类"""
    def __init__(self):
        super().__init__()
        self.image = pygame.Surface((50, 60))
        self.image.fill(GREEN)
        self.rect = self.image.get_rect()
        self.rect.centerx = SCREEN_WIDTH // 2
        self.rect.bottom = SCREEN_HEIGHT - 10
        self.speed = 5

    def update(self):
        """更新玩家位置"""
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            if self.rect.left > 0:
                self.rect.x -= self.speed
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            if self.rect.right < SCREEN_WIDTH:
                self.rect.x += self.speed

    def draw(self, surface):
        """绘制赛车"""
        surface.blit(self.image, self.rect)


class Obstacle(pygame.sprite.Sprite):
    """障碍物类"""
    def __init__(self):
        super().__init__()
        self.width = random.randint(40, 80)
        self.image = pygame.Surface((self.width, 50))
        self.image.fill(RED)
        self.rect = self.image.get_rect()
        self.rect.x = random.randint(0, SCREEN_WIDTH - self.width)
        self.rect.y = -50
        self.speed = 3

    def update(self):
        """更新障碍物位置"""
        self.rect.y += self.speed

    def draw(self, surface):
        """绘制障碍物"""
        surface.blit(self.image, self.rect)


class Game:
    """游戏主类"""
    def __init__(self):
        self.running = True
        self.game_started = False
        self.game_over = False
        self.score = 0
        self.difficulty = 0
        
        self.player = Player()
        self.obstacles = pygame.sprite.Group()
        
        self.spawn_timer = 0
        self.spawn_rate = 60  # 每60帧生成一个障碍物
        self.base_speed = 3
        
    def handle_events(self):
        """处理游戏事件"""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    if not self.game_started or self.game_over:
                        self.reset_game()
                elif event.key == pygame.K_ESCAPE:
                    self.running = False

    def reset_game(self):
        """重置游戏"""
        self.game_started = True
        self.game_over = False
        self.score = 0
        self.difficulty = 0
        self.spawn_timer = 0
        self.obstacles.empty()
        self.player.rect.centerx = SCREEN_WIDTH // 2
        self.base_speed = 3

    def update(self):
        """更新游戏状态"""
        if not self.game_started or self.game_over:
            return

        # 更新玩家
        self.player.update()

        # 生成障碍物
        self.spawn_timer += 1
        if self.spawn_timer >= self.spawn_rate:
            self.obstacles.add(Obstacle())
            self.spawn_timer = 0
            # 增加难度：障碍物生成更频繁
            if self.spawn_rate > 30:
                self.spawn_rate -= 1

        # 更新障碍物
        for obstacle in self.obstacles:
            obstacle.speed = self.base_speed + (self.difficulty * 0.1)
            obstacle.update()

        # 检查碰撞
        for obstacle in self.obstacles:
            if pygame.sprite.spritecollide(self.player, pygame.sprite.Group(obstacle), False):
                self.game_over = True
                return

        # 移除超出屏幕的障碍物并增加分数
        for obstacle in self.obstacles:
            if obstacle.rect.top > SCREEN_HEIGHT:
                self.obstacles.remove(obstacle)
                self.score += 10
                self.difficulty += 1
                # 增加基础速度
                if self.base_speed < 8:
                    self.base_speed += 0.05

    def draw(self):
        """绘制游戏画面"""
        SCREEN.fill(BLACK)
        
        # 绘制道路背景
        pygame.draw.line(SCREEN, GRAY, (SCREEN_WIDTH // 4, 0), (SCREEN_WIDTH // 4, SCREEN_HEIGHT), 2)
        pygame.draw.line(SCREEN, GRAY, (3 * SCREEN_WIDTH // 4, 0), (3 * SCREEN_WIDTH // 4, SCREEN_HEIGHT), 2)
        
        # 绘制游戏元素
        if self.game_started and not self.game_over:
            self.player.draw(SCREEN)
            for obstacle in self.obstacles:
                obstacle.draw(SCREEN)
            
            # 显示分数
            score_text = FONT_MEDIUM.render(f"分数: {self.score}", True, WHITE)
            SCREEN.blit(score_text, (10, 10))
            
            # 显示难度
            level_text = FONT_SMALL.render(f"难度等级: {self.difficulty}", True, YELLOW)
            SCREEN.blit(level_text, (10, 50))
        
        elif not self.game_started:
            # 显示开始画面
            title_text = FONT_LARGE.render("赛车小游戏", True, BLUE)
            start_text = FONT_MEDIUM.render("按 SPACE 开始游戏", True, WHITE)
            instruction1 = FONT_SMALL.render("左/右箭头 或 A/D 键 - 移动赛车", True, GRAY)
            instruction2 = FONT_SMALL.render("ESC - 退出游戏", True, GRAY)
            
            SCREEN.blit(title_text, (SCREEN_WIDTH // 2 - title_text.get_width() // 2, 150))
            SCREEN.blit(start_text, (SCREEN_WIDTH // 2 - start_text.get_width() // 2, 250))
            SCREEN.blit(instruction1, (SCREEN_WIDTH // 2 - instruction1.get_width() // 2, 350))
            SCREEN.blit(instruction2, (SCREEN_WIDTH // 2 - instruction2.get_width() // 2, 380))
        
        elif self.game_over:
            # 显示游戏结束画面
            game_over_text = FONT_LARGE.render("游戏结束", True, RED)
            final_score_text = FONT_MEDIUM.render(f"最终分数: {self.score}", True, WHITE)
            level_text = FONT_MEDIUM.render(f"达到难度等级: {self.difficulty}", True, WHITE)
            restart_text = FONT_MEDIUM.render("按 SPACE 重新开始", True, YELLOW)
            
            SCREEN.blit(game_over_text, (SCREEN_WIDTH // 2 - game_over_text.get_width() // 2, 150))
            SCREEN.blit(final_score_text, (SCREEN_WIDTH // 2 - final_score_text.get_width() // 2, 250))
            SCREEN.blit(level_text, (SCREEN_WIDTH // 2 - level_text.get_width() // 2, 310))
            SCREEN.blit(restart_text, (SCREEN_WIDTH // 2 - restart_text.get_width() // 2, 400))
        
        pygame.display.flip()

    def run(self):
        """运行游戏主循环"""
        while self.running:
            self.handle_events()
            self.update()
            self.draw()
            CLOCK.tick(FPS)
        
        pygame.quit()
        sys.exit()


if __name__ == "__main__":
    game = Game()
    game.run()
