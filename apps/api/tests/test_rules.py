from src.modules.lab_analysis.rules import classify_lab_value


def test_classify_low():
    assert classify_lab_value(11.2, 12, 16) == "low"


def test_classify_high():
    assert classify_lab_value(180, None, 150) == "high"


def test_classify_normal():
    assert classify_lab_value(14, 12, 16) == "normal"


def test_classify_unknown_without_range():
    assert classify_lab_value(14) == "unknown"
