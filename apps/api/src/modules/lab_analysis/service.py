from src.config import Settings
from src.modules.ai.ai_service import generate_explanations
from src.modules.lab_analysis.rules import classify_results, detect_combination_flags
from src.modules.lab_analysis.schemas import AnalysisSummary, AnalyzeRequest, AnalyzeResponse


def analyze_labs(request_data: AnalyzeRequest, settings: Settings) -> AnalyzeResponse:
    classified = classify_results(request_data.results)
    combination_flags = detect_combination_flags(classified)
    explanations = generate_explanations(settings, request_data.patientContext, classified, combination_flags)

    normal_count = sum(1 for item in classified if item.status == "normal")
    abnormal_count = sum(1 for item in classified if item.status in {"low", "high", "borderline"})
    follow_up = abnormal_count > 0 or bool(combination_flags)

    summary = AnalysisSummary(
        totalResults=len(classified),
        normalCount=normal_count,
        abnormalCount=abnormal_count,
        followUpRecommended=follow_up,
        overallPlainLanguageSummary=(
            "Some results appear outside the provided reference ranges. Review these results with a licensed healthcare professional."
            if follow_up
            else "The submitted results appear within the provided reference ranges. Continue to review lab results with your healthcare professional."
        ),
        importantNotes=[
            "This app is educational and does not provide medical advice, diagnosis, or treatment.",
            "Reference ranges can vary by lab, age, sex, pregnancy status, medications, and clinical context.",
            "Seek urgent medical care for severe symptoms such as chest pain, severe shortness of breath, fainting, confusion, stroke-like symptoms, or severe bleeding.",
        ],
    )

    return AnalyzeResponse(summary=summary, results=explanations, combinationFlags=combination_flags)
