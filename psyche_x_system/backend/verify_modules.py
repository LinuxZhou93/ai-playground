import sys
import os

# Ensure backend context
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    print("[1] Importing Modules...")
    import models
    import schemas
    import crud
    import database
    from database import engine
    print("    - Import Success.")
except ImportError as e:
    print(f"!!! IMPORT ERROR: {e}")
    sys.exit(1)

def run_test():
    print("[2] Initializing Database...")
    models.Base.metadata.create_all(bind=engine)
    db = database.SessionLocal()
    
    print("[3] Testing User Creation (CRUD)...")
    test_email = "architect@psyche.io"
    
    # Clean up first
    existing = crud.get_user_by_email(db, test_email)
    if existing:
        print("    - User exists, skipping create.")
        user = existing
    else:
        new_user = schemas.UserCreate(
            username="Architect",
            email=test_email,
            password="secure_password",
            age=30,
            grade="Admin",
            school="Deepmind"
        )
        user = crud.create_user(db, new_user)
        print(f"    - User Created: ID {user.id}")

    print("[4] Testing Exam Submission...")
    # Mock submission
    submission = schemas.ExamResultSimple(
        task_type="n-back",
        raw_data={"score": 100, "trials": []}
    )
    
    # Mock algorithm result
    import algorithms
    scores = algorithms.analyze_exam_submission("n-back", submission.dict())
    
    db_res = models.ExamResult(
        user_id=user.id,
        raw_data_log=submission.dict(),
        score_fluid_intelligence=scores["Gf"],
        score_working_memory=scores["Gwm"],
        score_executive_function=scores["Att"],
        score_metacognition=scores["Meta"],
        score_resilience=scores["Res"]
    )
    res = crud.create_exam_result(db, db_res)
    print(f"    - Exam Result Saved: ID {res.id}")
    
    db.close()
    print("\n[SUCCESS] Modular Architecture Verified.")

if __name__ == "__main__":
    run_test()
