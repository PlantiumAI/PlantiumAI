# Gerador de RELATÓRIO PDF profissional do PlantiumAI — Python/ReportLab.
# Função serverless da Vercel (Root Directory = web → esta pasta vira /api/pdf/relatorio).
# ReportLab é PURO PYTHON (sem libs nativas) → roda no runtime Python da Vercel.
# Recebe POST JSON com os dados do painel e devolve o PDF (tema verde PlantiumAI).
from http.server import BaseHTTPRequestHandler
import json
from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
)
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
import base64

# Ícone oficial embutido (base64) — independe do filesystem da Vercel.
try:
    from _logo import LOGO_B64
    _LOGO = ImageReader(BytesIO(base64.b64decode(LOGO_B64)))
except Exception:
    _LOGO = None

# Helvetica (WinAnsi) não tem subscritos (₂) → vira quadrado. Normaliza.
_SUBS = {"₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5",
         "₆": "6", "₇": "7", "₈": "8", "₉": "9"}


def clean(s):
    if s is None:
        return ""
    s = str(s)
    for k, v in _SUBS.items():
        s = s.replace(k, v)
    return s

GREEN = colors.HexColor("#16a34a")
GREEN2 = colors.HexColor("#22c55e")
GREEN_TINT = colors.HexColor("#dcfce7")
AMBER = colors.HexColor("#f59e0b")
RED = colors.HexColor("#ef4444")
INK = colors.HexColor("#152a1f")
MUTED = colors.HexColor("#5b6b61")
LINE = colors.HexColor("#cbd5e1")
HEADER_BG = colors.HexColor("#e2e8f0")

MARGIN = 16 * mm


def _status_color(state):
    s = (state or "").lower()
    if "crít" in s or "crit" in s:
        return RED
    if "aten" in s:
        return AMBER
    if "sem" in s:
        return MUTED
    return GREEN


class NumberedCanvas(canvas.Canvas):
    """Two-pass: numera 'Página X de Y' sabendo o total no fim."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved = []

    def showPage(self):
        self._saved.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        total = len(self._saved)
        for st in self._saved:
            self.__dict__.update(st)
            self._draw_footer(total)
            super().showPage()
        super().save()

    def _draw_footer(self, total):
        w, _ = A4
        self.setStrokeColor(LINE)
        self.setLineWidth(0.5)
        self.line(MARGIN, 14 * mm, w - MARGIN, 14 * mm)
        self.setFont("Helvetica", 8)
        self.setFillColor(MUTED)
        self.drawString(MARGIN, 9 * mm, "PlantiumAI · Micro estufas e hortas verticais inteligentes")
        self.drawRightString(w - MARGIN, 9 * mm, "Página %d de %d" % (self._pageNumber, total))


def _header(canvas_, doc):
    w, h = A4
    canvas_.saveState()
    # ícone oficial no canto superior esquerdo (antes do nome)
    if _LOGO is not None:
        canvas_.drawImage(_LOGO, MARGIN, h - 16.5 * mm, width=9 * mm, height=9 * mm, mask="auto")
    else:
        canvas_.setFillColor(GREEN)
        canvas_.circle(MARGIN + 4.5 * mm, h - 12.5 * mm, 4.5 * mm, fill=1, stroke=0)
    canvas_.setFillColor(INK)
    canvas_.setFont("Helvetica-Bold", 14)
    canvas_.drawString(MARGIN + 12 * mm, h - 14.6 * mm, "PlantiumAI")
    canvas_.setFillColor(MUTED)
    canvas_.setFont("Helvetica", 9)
    canvas_.drawRightString(w - MARGIN, h - 15.5 * mm, "Relatório de Monitoramento")
    canvas_.setStrokeColor(GREEN2)
    canvas_.setLineWidth(1.2)
    canvas_.line(MARGIN, h - 19 * mm, w - MARGIN, h - 19 * mm)
    canvas_.restoreState()


def build_pdf(data):
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=26 * mm, bottomMargin=20 * mm,
        title="Relatório PlantiumAI", author="PlantiumAI",
    )
    ss = getSampleStyleSheet()
    h1 = ParagraphStyle("h1", parent=ss["Heading1"], textColor=GREEN, fontSize=18, spaceAfter=4, alignment=TA_LEFT)
    h2 = ParagraphStyle("h2", parent=ss["Heading2"], textColor=INK, fontSize=12.5, spaceBefore=14, spaceAfter=6)
    meta = ParagraphStyle("meta", parent=ss["Normal"], textColor=MUTED, fontSize=9.5, leading=14)
    body = ParagraphStyle("body", parent=ss["Normal"], textColor=INK, fontSize=10, leading=14)

    location = clean(data.get("location", "—"))
    period = clean(data.get("period", "24h"))
    generated = clean(data.get("generatedAt", ""))
    user = clean(data.get("user", ""))
    health = data.get("health", None)
    variant = (data.get("variant") or "tecnico").lower()
    titulo = "Relatório resumido" if variant == "resumo" else "Relatório técnico"

    story = []
    story.append(Paragraph(titulo, h1))
    story.append(Paragraph(
        f"Local: <b>{location}</b> &nbsp;·&nbsp; Período: <b>{period}</b>"
        + (f" &nbsp;·&nbsp; Emitido em: {generated}" if generated else "")
        + (f"<br/>Responsável: {user}" if user else ""),
        meta,
    ))
    story.append(Spacer(1, 8))

    # Destaque do índice de saúde (compacto, % proporcional)
    if health is not None:
        hstat = "Saúde ótima" if health >= 85 else ("Atenção" if health >= 65 else "Crítico")
        card = Table([[
            Paragraph("<b>Índice de saúde da estufa</b>", body),
            Paragraph(f"<font size=20 color='#16a34a'><b>{health}%</b></font>&nbsp;&nbsp;<font size=9 color='#5b6b61'>{hstat}</font>", body),
        ]], colWidths=[None, 60 * mm])
        card.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), GREEN_TINT),
            ("BOX", (0, 0), (-1, -1), 0.5, GREEN2),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ("TOPPADDING", (0, 0), (-1, -1), 9),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
            ("ALIGN", (1, 0), (1, 0), "RIGHT"),
        ]))
        story.append(card)

    # Leituras atuais
    sensors = data.get("sensors") or []
    if sensors:
        story.append(Paragraph("Leituras atuais", h2))
        rows = [["Sensor", "Valor", "Estado"]]
        for s in sensors:
            unit = (" " + clean(s.get("unit", ""))) if s.get("unit") else ""
            rows.append([clean(s.get("label", "—")), f"{clean(s.get('value', '—'))}{unit}", clean(s.get("status", "—"))])
        t = Table(rows, colWidths=[None, 35 * mm, 30 * mm])
        st = [
            ("BACKGROUND", (0, 0), (-1, 0), HEADER_BG),
            ("TEXTCOLOR", (0, 0), (-1, 0), INK),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9.5),
            ("GRID", (0, 0), (-1, -1), 0.5, LINE),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f6faf6")]),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("ALIGN", (1, 0), (2, -1), "CENTER"),
        ]
        for i, s in enumerate(sensors, start=1):
            st.append(("TEXTCOLOR", (2, i), (2, i), _status_color(s.get("status"))))
            st.append(("FONTNAME", (2, i), (2, i), "Helvetica-Bold"))
        t.setStyle(TableStyle(st))
        story.append(t)

    # Estatísticas do período
    stats = data.get("stats") or []
    if variant == "tecnico" and stats:
        story.append(Paragraph(f"Estatísticas por sensor — {period}", h2))
        rows = [["Sensor", "Mín", "Máx", "Média", "Desvio", "Estado"]]
        for s in stats:
            rows.append([clean(s.get("name", "—")), clean(s.get("min", "—")), clean(s.get("max", "—")),
                         clean(s.get("avg", "—")), clean(s.get("std", "—")), clean(s.get("state", "—"))])
        t = Table(rows, colWidths=[None, 22 * mm, 22 * mm, 24 * mm, 22 * mm, 26 * mm])
        st = [
            ("BACKGROUND", (0, 0), (-1, 0), HEADER_BG),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, LINE),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f6faf6")]),
            ("ALIGN", (1, 0), (-1, -1), "CENTER"),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]
        for i, s in enumerate(stats, start=1):
            st.append(("TEXTCOLOR", (5, i), (5, i), _status_color(s.get("state"))))
            st.append(("FONTNAME", (5, i), (5, i), "Helvetica-Bold"))
        t.setStyle(TableStyle(st))
        story.append(t)

    # Alertas
    alerts = data.get("alerts") or []
    story.append(Paragraph("Alertas recentes", h2))
    if alerts:
        for a in alerts:
            hexcol = "#ef4444" if "crít" in (a.get("sev", "").lower()) else "#f59e0b"
            story.append(Paragraph(
                f"<font color='{hexcol}'><b>{clean(a.get('sev', ''))}</b></font> "
                f"— {clean(a.get('title', ''))} <font color='#8a978f'>({clean(a.get('local', ''))} · {clean(a.get('time', ''))})</font>",
                body,
            ))
            story.append(Spacer(1, 3))
    else:
        story.append(Paragraph("Nenhum alerta no período. Tudo dentro do ideal.", meta))

    story.append(Spacer(1, 16))
    story.append(Paragraph(
        "Documento gerado automaticamente pela plataforma PlantiumAI. "
        "Fluxo: sensores ESP32 → borda (Rust) → API → banco → relatório.",
        meta,
    ))

    doc.build(story, onFirstPage=_header, onLaterPages=_header, canvasmaker=NumberedCanvas)
    return buf.getvalue()


def _safe_data(raw):
    try:
        return json.loads(raw or b"{}")
    except Exception:
        return {}


class handler(BaseHTTPRequestHandler):
    def _send(self, pdf):
        self.send_response(200)
        self.send_header("Content-Type", "application/pdf")
        self.send_header("Content-Disposition", 'attachment; filename="relatorio-plantiumai.pdf"')
        self.send_header("Content-Length", str(len(pdf)))
        self.end_headers()
        self.wfile.write(pdf)

    def do_POST(self):
        length = int(self.headers.get("content-length", 0) or 0)
        raw = self.rfile.read(length) if length else b"{}"
        pdf = build_pdf(_safe_data(raw))
        self._send(pdf)

    def do_GET(self):
        # Amostra (sem dados) — útil para validar o deploy.
        pdf = build_pdf({"location": "Estufa Central · SP", "period": "24h", "health": 96})
        self._send(pdf)
