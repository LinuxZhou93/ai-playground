"""
Psyche-X Report Generator
生成用户认知评估报告
"""

def calculate_grade(score):
    """将分数转换为等级"""
    if score >= 80: return "A"
    elif score >= 60: return "B"
    elif score >= 40: return "C"
    elif score >= 20: return "D"
    else: return "E"

def generate_recommendation(dimension, grade):
    """根据维度和等级生成建议"""
    recommendations = {
        "Gf": {
            "A": "流体智力优秀，建议挑战更高难度的逻辑推理任务。",
            "B": "流体智力良好，可尝试 Raven's Progressive Matrices 进阶训练。",
            "C": "建议增加抽象思维训练，如数独、魔方等。",
            "D": "需要系统性训练，从简单的模式识别开始。",
            "E": "建议咨询专业认知训练师，制定个性化方案。"
        },
        "Gwm": {
            "A": "工作记忆卓越，可尝试 4-Back 或 5-Back 挑战。",
            "B": "工作记忆良好，建议保持每日 15 分钟训练。",
            "C": "建议增加 Dual N-Back 训练频率至每日 2 次。",
            "D": "从 1-Back 开始，逐步提升难度。",
            "E": "建议结合冥想、睡眠优化等辅助手段。"
        },
        "Att": {
            "A": "执行功能优秀，适合高强度多任务工作。",
            "B": "注意力控制良好，可尝试 Stroop 任务进阶。",
            "C": "建议减少干扰源，进行专注力训练。",
            "D": "推荐番茄工作法，培养持续专注能力。",
            "E": "建议咨询注意力缺陷相关专业人士。"
        },
        "Meta": {
            "A": "元认知能力出色，善于自我监控和调整。",
            "B": "自我觉察良好，建议记录训练日志。",
            "C": "建议增加反思性思考，定期复盘。",
            "D": "推荐学习认知策略，如记忆宫殿法。",
            "E": "建议从简单的自我评估开始培养。"
        },
        "Res": {
            "A": "心理韧性强，能有效应对挫折。",
            "B": "抗压能力良好，建议保持积极心态。",
            "C": "建议增加正念训练，提升情绪调节能力。",
            "D": "推荐渐进式挑战，避免过度焦虑。",
            "E": "建议寻求心理支持，建立健康应对机制。"
        }
    }
    return recommendations.get(dimension, {}).get(grade, "继续保持训练。")

def generate_user_report(user_results):
    """
    生成用户综合报告
    
    Args:
        user_results: List of ExamResult objects
        
    Returns:
        dict: 包含评分、等级、建议的报告
    """
    if not user_results:
        return {
            "status": "insufficient_data",
            "message": "需要至少完成一次测评才能生成报告"
        }
    
    # 计算平均分
    total_sessions = len(user_results)
    avg_scores = {
        "Gf": sum(r.score_fluid_intelligence or 0 for r in user_results) / total_sessions,
        "Gwm": sum(r.score_working_memory or 0 for r in user_results) / total_sessions,
        "Att": sum(r.score_executive_function or 0 for r in user_results) / total_sessions,
        "Meta": sum(r.score_metacognition or 0 for r in user_results) / total_sessions,
        "Res": sum(r.score_resilience or 0 for r in user_results) / total_sessions
    }
    
    # 生成等级
    grades = {dim: calculate_grade(score) for dim, score in avg_scores.items()}
    
    # 生成建议
    recommendations = {dim: generate_recommendation(dim, grade) 
                      for dim, grade in grades.items()}
    
    # 识别优势和劣势
    sorted_dims = sorted(avg_scores.items(), key=lambda x: x[1], reverse=True)
    strengths = [sorted_dims[0][0], sorted_dims[1][0]]
    weaknesses = [sorted_dims[-1][0], sorted_dims[-2][0]]
    
    # 计算进步趋势（最近5次 vs 之前5次）
    if total_sessions >= 10:
        recent = user_results[-5:]
        previous = user_results[-10:-5]
        
        recent_avg = sum(r.score_working_memory or 0 for r in recent) / 5
        previous_avg = sum(r.score_working_memory or 0 for r in previous) / 5
        
        trend = "improving" if recent_avg > previous_avg else "stable" if abs(recent_avg - previous_avg) < 5 else "declining"
    else:
        trend = "insufficient_data"
    
    return {
        "status": "success",
        "total_sessions": total_sessions,
        "scores": avg_scores,
        "grades": grades,
        "recommendations": recommendations,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "trend": trend,
        "summary": f"您已完成 {total_sessions} 次认知训练。优势领域：{', '.join(strengths)}。建议重点提升：{', '.join(weaknesses)}。"
    }
