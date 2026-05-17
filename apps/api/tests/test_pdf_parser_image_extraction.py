from src.modules.pdf_parser import service


def test_parse_lab_image_extracts_simple_ocr_lines(monkeypatch):
    monkeypatch.setattr(
        service,
        "extract_text_from_image_bytes",
        lambda _file_bytes: "Hemoglobin 13.5 g/dL\nWBC 11.2 K/uL H",
    )

    parsed = service.parse_lab_image(b"fake-image")

    assert parsed["needsReview"] is True
    assert len(parsed["extractedResults"]) == 2

    first = parsed["extractedResults"][0]
    assert first["normalizedName"] == "hemoglobin"
    assert first["value"] == 13.5
    assert first["unit"] == "g/dL"
    assert first["referenceRange"] is None

    second = parsed["extractedResults"][1]
    assert second["normalizedName"] == "wbc"
    assert second["flag"] == "H"
