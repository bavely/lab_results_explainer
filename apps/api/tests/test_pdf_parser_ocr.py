from unittest.mock import Mock

from src.modules.pdf_parser import service


def test_extract_text_uses_ocr_when_page_text_empty(monkeypatch):
    mock_page = Mock()
    mock_page.extract_text.return_value = ""

    mock_reader = Mock()
    mock_reader.pages = [mock_page]

    monkeypatch.setattr(service, "PdfReader", lambda *_args, **_kwargs: mock_reader)
    monkeypatch.setattr(service, "_extract_text_with_ocr", lambda page: "Hemoglobin 13.5 g/dL")

    extracted = service.extract_text_from_pdf_bytes(b"fake-pdf")

    assert extracted == "Hemoglobin 13.5 g/dL"


def test_extract_text_prefers_embedded_text_over_ocr(monkeypatch):
    mock_page = Mock()
    mock_page.extract_text.return_value = "RBC 4.8"

    mock_reader = Mock()
    mock_reader.pages = [mock_page]

    monkeypatch.setattr(service, "PdfReader", lambda *_args, **_kwargs: mock_reader)

    ocr_spy = Mock(return_value="should-not-be-used")
    monkeypatch.setattr(service, "_extract_text_with_ocr", ocr_spy)

    extracted = service.extract_text_from_pdf_bytes(b"fake-pdf")

    assert extracted == "RBC 4.8"
    ocr_spy.assert_not_called()
