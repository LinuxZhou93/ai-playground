from sqlalchemy.orm import Session
import models, schemas
# 实际生产中应使用 passlib 进行哈希
# from passlib.context import CryptContext 

# pseudo hash for MVP
def get_password_hash(password):
    return password + "notreallyhashed"

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username, 
        email=user.email, 
        hashed_password=hashed_password,
        age=user.age,
        grade=user.grade,
        school=user.school,
        account_type=user.account_type
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_user_exam_result(db: Session, result: schemas.ExamResultCreate):
    db_result = models.ExamResult(**result.dict())
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    return db_result

def get_user_results(db: Session, user_id: int, limit: int = 10):
    return db.query(models.ExamResult).filter(models.ExamResult.user_id == user_id).order_by(models.ExamResult.completed_at.desc()).limit(limit).all()

# --- Stroop Task ---
def create_stroop_result(db: Session, result: schemas.StroopResultCreate):
    db_result = models.StroopResult(**result.dict())
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    return db_result

def get_user_stroop_results(db: Session, user_id: int, limit: int = 10):
    return db.query(models.StroopResult).filter(models.StroopResult.user_id == user_id).order_by(models.StroopResult.completed_at.desc()).limit(limit).all()

# --- Content Library ---
def create_article(db: Session, article: schemas.ArticleBase):
    db_article = models.Article(**article.dict())
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return db_article

def get_articles(db: Session, skip: int = 0, limit: int = 20, category: str = None):
    query = db.query(models.Article).filter(models.Article.is_published == True)
    if category:
        query = query.filter(models.Article.category == category)
    return query.order_by(models.Article.published_at.desc()).offset(skip).limit(limit).all()

# --- Gamification ---
def create_achievement(db: Session, achievement: schemas.AchievementBase):
    db_ach = models.Achievement(**achievement.dict())
    db.add(db_ach)
    db.commit()
    db.refresh(db_ach)
    return db_ach

def get_all_achievements(db: Session):
    return db.query(models.Achievement).all()

def get_user_achievements_status(db: Session, user_id: int):
    """Returns a list of all achievements with unlocked_at timestamp if unlocked by user"""
    # This is a bit complex in SQL, doing it simply in Python for now
    all_achievements = db.query(models.Achievement).all()
    unlocked = db.query(models.UserAchievement).filter(models.UserAchievement.user_id == user_id).all()
    
    unlocked_map = {ua.achievement_id: ua.unlocked_at for ua in unlocked}
    
    results = []
    for ach in all_achievements:
        # Convert ORM object to dict/schema to add the extra field
        ach_data = schemas.AchievementResponse.from_orm(ach)
        if ach.id in unlocked_map:
            ach_data.unlocked_at = unlocked_map[ach.id]
        results.append(ach_data)
        
    return results

def unlock_achievement(db: Session, user_id: int, achievement_code: str):
    ach = db.query(models.Achievement).filter(models.Achievement.code == achievement_code).first()
    if not ach:
        return None
        
    # Check if already unlocked
    existing = db.query(models.UserAchievement).filter(
        models.UserAchievement.user_id == user_id,
        models.UserAchievement.achievement_id == ach.id
    ).first()
    
    if existing:
        return existing
        
    new_unlock = models.UserAchievement(user_id=user_id, achievement_id=ach.id)
    db.add(new_unlock)
    db.commit()
    db.refresh(new_unlock)
    return new_unlock
