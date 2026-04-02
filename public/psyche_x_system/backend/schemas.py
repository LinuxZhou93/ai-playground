from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

# --- Common ---
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str
    age: Optional[int] = None
    grade: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- N-Back Exam ---
class ExamResultBase(BaseModel):
    score_working_memory: Optional[float] = None
    # ... allow other scores to be optional for submission flexibility
    raw_data_log: Optional[Any] = None
    session_id: Optional[str] = None
    adaptive_level_start: Optional[int] = None
    adaptive_level_end: Optional[int] = None

class ExamResultCreate(ExamResultBase):
    user_id: int

class ExamResultResponse(ExamResultBase):
    id: int
    completed_at: datetime
    
    class Config:
        from_attributes = True

# --- Stroop Task ---
class StroopResultBase(BaseModel):
    rt_congruent: float
    rt_incongruent: float
    interference_score: float
    accuracy: float
    raw_data: Optional[Any] = None

class StroopResultCreate(StroopResultBase):
    user_id: int

class StroopResultResponse(StroopResultBase):
    id: int
    completed_at: datetime
    
    class Config:
        from_attributes = True

# --- Content Library ---
class ArticleBase(BaseModel):
    title: str
    category: str
    content: str
    author: Optional[str] = "Psyche-X Team"

class ArticleResponse(ArticleBase):
    id: int
    published_at: datetime
    
    class Config:
        from_attributes = True

# --- Gamification ---
class AchievementBase(BaseModel):
    code: str
    name: str
    description: str
    icon_url: str

class AchievementResponse(AchievementBase):
    id: int
    unlocked_at: Optional[datetime] = None # For user specific response
    
    class Config:
        from_attributes = True
