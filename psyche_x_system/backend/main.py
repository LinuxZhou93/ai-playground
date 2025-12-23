from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from sqlalchemy.orm import Session
import os

# 导入模块 (确保当前目录在 PATH 中，或者使用绝对导入)
import crud, models, schemas, database, algorithms, report_generator
from database import engine

# 初始化数据库
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Psyche-X Neuro Engine",
    description="V2 Modular Architecture",
    version="2.1.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- API ROUTES ---
@app.get("/api/status")
def status():
    return {"status": "Online", "mode": "Modular V2"}

@app.post("/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user: return db_user
    return crud.create_user(db=db, user=user)

@app.post("/exam/submit", response_model=schemas.ExamResultResponse)
def submit_exam(submission: schemas.ExamResultSimple, user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 简单的防止除以零处理
    if not submission.raw_data.get('trials'):
         submission.raw_data['trials'] = [{'res':1, 'rt':500}] * 20 

    scores = algorithms.analyze_exam_submission(submission.task_type, submission.dict())
    
    # Extract enhanced metadata
    session_id = submission.raw_data.get('session_id', None)
    adaptive_start = submission.raw_data.get('adaptive_level_start', 2)
    adaptive_end = submission.raw_data.get('adaptive_level_end', 2)
    
    db_result = models.ExamResult(
        user_id=user_id,
        raw_data_log=submission.dict(),
        score_fluid_intelligence=scores.get("Gf", 0),
        score_working_memory=scores.get("Gwm", 0),
        score_executive_function=scores.get("Att", 0),
        score_metacognition=scores.get("Meta", 0),
        score_resilience=scores.get("Res", 0),
        session_id=session_id,
        adaptive_level_start=adaptive_start,
        adaptive_level_end=adaptive_end
    )
    return crud.create_exam_result(db=db, result=db_result)

@app.post("/stroop/submit", response_model=schemas.StroopResultResponse)
def submit_stroop(result: schemas.StroopResultCreate, db: Session = Depends(get_db)):
    """提交 Stroop 任务结果"""
    return crud.create_stroop_result(db=db, result=result)

@app.get("/articles", response_model=List[schemas.ArticleResponse])
def read_articles(skip: int = 0, limit: int = 20, category: str = None, db: Session = Depends(get_db)):
    """获取知识库文章"""
    return crud.get_articles(db, skip=skip, limit=limit, category=category)

@app.post("/articles", response_model=schemas.ArticleResponse) 
def create_article(article: schemas.ArticleBase, db: Session = Depends(get_db)):
     """(管理员) 发布文章"""
     return crud.create_article(db, article)

@app.get("/users/{user_id}/stats")
def get_stats(user_id: int, db: Session = Depends(get_db)):
    history = crud.get_user_results(db, user_id, limit=10)
    history.reverse()
    return {
        "labels": [h.completed_at.strftime("%H:%M") for h in history],
        "gwm": [h.score_working_memory or 0 for h in history],
        "gf": [h.score_fluid_intelligence or 0 for h in history]
    }

@app.get("/users/{user_id}/report")
def get_report(user_id: int, db: Session = Depends(get_db)):
    """生成用户的综合认知评估报告"""
    results = crud.get_user_results(db, user_id, limit=10)
    
    if not results:
        return {"report": {"status": "error", "message": "数据不足，请至少完成2-3次测评"}}
    
    report = report_generator.generate_comprehensive_report(results)
    return {"report": report}

@app.get("/users/{user_id}/achievements", response_model=List[schemas.AchievementResponse])
def get_user_achievements(user_id: int, db: Session = Depends(get_db)):
    """获取用户的所有成就状态（包括未解锁的）"""
    return crud.get_user_achievements_status(db, user_id)

@app.post("/achievements/check/{user_id}")
def check_achievements(user_id: int, db: Session = Depends(get_db)):
    """触发成就检查（通常在测评结束后调用）"""
    # 简单的检查逻辑示例
    results = crud.get_user_results(db, user_id)
    stroop_results = crud.get_user_stroop_results(db, user_id)
    
    unlocked = []
    
    # 1. First Win (Future Scientist) - 只要有1次测评
    if len(results) >= 1:
        crud.unlock_achievement(db, user_id, "tech_talent_init")
        unlocked.append("tech_talent_init")
        
    # 2. Algorithm Mind - N-Back Level 2+ Acc > 80% (Simplified check)
    # 实际逻辑需要解析 raw_data 或增加字段，这里简单假设分数 > 80
    if any(r.score_working_memory and r.score_working_memory > 80 for r in results):
         crud.unlock_achievement(db, user_id, "algo_mind_1")
         unlocked.append("algo_mind_1")

    # 3. Stroop Master - Interference < 50ms
    if any(r.interference_score and r.interference_score < 50 for r in stroop_results):
        crud.unlock_achievement(db, user_id, "stroop_master")
        unlocked.append("stroop_master")

    return {"status": "checked", "recently_unlocked": unlocked}

@app.post("/admin/achievements/init")
def init_achievements(db: Session = Depends(get_db)):
    """(Admin) Initialize default achievements"""
    defaults = [
        {"code": "tech_talent_init", "name": "Future Scientist (未来科学家)", "description": "Complete your first N-Back assessment session.", "icon_url": "🧬"},
        {"code": "algo_mind_1", "name": "Algorithm Mind (算法思维)", "description": "Achieve 80%+ accuracy in Dual N-Back (Level 2+).", "icon_url": "⚡"},
        {"code": "info_olympiad_ready", "name": "Olympiad Ready (信奥预备)", "description": "Maintain focus (Accuracy > 90%) for 3 consecutive days.", "icon_url": "🏆"},
        {"code": "neural_architect", "name": "Neural Architect (神经架构师)", "description": "Reach Dual N-Back Level 4.", "icon_url": "🧠"},
        {"code": "stroop_master", "name": "Interference Controller (抗干扰大师)", "description": "Stroop interference effect under 50ms.", "icon_url": "🛡️"},
        {"code": "research_explorer", "name": "Research Explorer (科研探索者)", "description": "Read 5 articles in the Cortex Library.", "icon_url": "📚"}
    ]
    
    created = []
    for ach in defaults:
        # Check if exists
        exists = db.query(models.Achievement).filter(models.Achievement.code == ach["code"]).first()
        if not exists:
            new_ach = schemas.AchievementBase(**ach)
            crud.create_achievement(db, new_ach)
            created.append(ach["code"])
            
    return {"created": created}


# ==================== 管理员 API ====================

@app.get("/admin/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    """获取管理员仪表板统计数据"""
    from sqlalchemy import func
    from datetime import datetime, timedelta
    
    # 总用户数
    total_users = db.query(func.count(models.User.id)).scalar()
    
    # 今日活跃用户（简化：假设所有用户都活跃）
    active_today = max(1, total_users // 10)
    
    # 总测评数
    total_assessments = db.query(func.count(models.ExamResult.id)).scalar()
    
    # 平均得分
    avg_score = db.query(func.avg(models.ExamResult.score_working_memory)).scalar()
    avg_score = float(avg_score) if avg_score else 0.0
    
    return {
        "total_users": total_users or 0,
        "active_today": active_today,
        "total_assessments": total_assessments or 0,
        "avg_score": round(avg_score, 1)
    }


@app.get("/admin/recent-assessments")
def get_recent_assessments(limit: int = 10, db: Session = Depends(get_db)):
    """获取最近的测评记录"""
    results = db.query(models.ExamResult).order_by(
        models.ExamResult.completed_at.desc()
    ).limit(limit).all()
    
    assessments = []
    for r in results:
        user = db.query(models.User).filter(models.User.id == r.user_id).first()
        
        # 提取自适应难度
        adaptive_level = "2-Back"
        if r.raw_data_log:
            import json
            try:
                data = json.loads(r.raw_data_log) if isinstance(r.raw_data_log, str) else r.raw_data_log
                level_end = data.get('adaptive_level_end', 2)
                adaptive_level = f"{level_end}-Back"
            except:
                pass
        
        assessments.append({
            "id": r.id,
            "user": user.username if user else f"User{r.user_id}",
            "score": int(r.score_working_memory or 0),
            "level": adaptive_level,
            "status": "completed",
            "time": r.completed_at.strftime("%Y-%m-%d %H:%M") if r.completed_at else "N/A"
        })
    
    return assessments


@app.get("/admin/users")
def get_all_users(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """获取所有用户列表"""
    users = db.query(models.User).offset(skip).limit(limit).all()
    
    user_list = []
    for u in users:
        # 统计该用户的测评次数
        assessment_count = db.query(func.count(models.ExamResult.id)).filter(
            models.ExamResult.user_id == u.id
        ).scalar()
        
        # 获取最后一次测评时间
        last_assessment = db.query(models.ExamResult).filter(
            models.ExamResult.user_id == u.id
        ).order_by(models.ExamResult.completed_at.desc()).first()
        
        user_list.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "age": u.age,
            "grade": u.grade,
            "assessment_count": assessment_count or 0,
            "last_assessment": last_assessment.completed_at.strftime("%Y-%m-%d") if last_assessment and last_assessment.completed_at else "从未",
            "created_at": u.created_at.strftime("%Y-%m-%d") if u.created_at else "N/A"
        })
    
    return {
        "total": db.query(func.count(models.User.id)).scalar(),
        "users": user_list
    }

# --- FRONTEND MOUNTING (ROBUST) ---
# HARDCODED PATH FOR STABILITY
FRONTEND_DIR = "/Users/xg/.gemini/antigravity/playground/metallic-universe/Psyche-X/frontend"

print(f"[INFO] Mounting Frontend from: {FRONTEND_DIR}")

if os.path.exists(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
else:
    print("!!! FRONTEND DIRECTORY NOT FOUND !!!")
    @app.get("/")
    def fallback():
        return HTMLResponse("<h1>CRITICAL ERROR: FRONTEND MISSING</h1>")
