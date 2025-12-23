from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    # K12 特有字段
    age = Column(Integer)
    grade = Column(String) # e.g. "Year 5", "Grade 7"
    school = Column(String, nullable=True)
    
    # 账户属性
    account_type = Column(String, default="individual") # individual, organization
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关联
    results = relationship("ExamResult", back_populates="user")

class ExamResult(Base):
    __tablename__ = "exam_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Core Cognitive Metrics (N-Back)
    score_working_memory = Column(Float)
    score_fluid_intelligence = Column(Float)
    score_attention = Column(Float)
    score_meta_cognition = Column(Float)
    score_resilience = Column(Float)
    
    # Metadata
    session_id = Column(String, index=True)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
    device_info = Column(String, nullable=True)
    raw_data_log = Column(JSON, nullable=True)
    adaptive_level_start = Column(Integer, nullable=True)
    adaptive_level_end = Column(Integer, nullable=True)
    
    user = relationship("User", back_populates="results")

class StroopResult(Base):
    __tablename__ = "stroop_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Metrics
    rt_congruent = Column(Float)   # 一致性试炼平均反应时
    rt_incongruent = Column(Float) # 冲突性试炼平均反应时
    interference_score = Column(Float) # 干扰分数
    accuracy = Column(Float)
    
    raw_data = Column(JSON, nullable=True)

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    category = Column(String, index=True) # e.g., 'Neuroscience', 'Training Tips'
    content = Column(String) # Markdown or HTML
    author = Column(String)
    published_at = Column(DateTime(timezone=True), server_default=func.now())
    is_published = Column(Boolean, default=True)

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, PrimaryKey=True, index=True)
    code = Column(String, unique=True, index=True) # e.g. "future_scientist_1"
    name = Column(String)
    description = Column(String)
    icon_url = Column(String) # or emoji
    criteria_type = Column(String) # e.g. "score_threshold", "streak", "completion_count"
    criteria_value = Column(Integer)

class UserAchievement(Base):
    __tablename__ = "user_achievements"
    
    id = Column(Integer, PrimaryKey=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    achievement_id = Column(Integer, ForeignKey("achievements.id"))
    unlocked_at = Column(DateTime(timezone=True), server_default=func.now())
    
    unique_constraint = (user_id, achievement_id)
