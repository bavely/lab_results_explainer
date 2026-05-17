from pathlib import Path

from src.modules.pdf_parser.service import parse_lab_pdf


SAMPLE_PDF = (
    Path(__file__).resolve().parents[3]
    / "testing pdf"
    / "sterling-accuris-pathology-sample-report-unlocked.pdf"
)


def test_sample_pdf_extracts_structured_values():
    parsed = parse_lab_pdf(SAMPLE_PDF.read_bytes())

    assert parsed["needsReview"] is True
    assert len(parsed["extractedResults"]) > 0

    names = {r["normalizedName"] for r in parsed["extractedResults"]}
    assert "hemoglobin" in names
    assert "rbc_count" in names
