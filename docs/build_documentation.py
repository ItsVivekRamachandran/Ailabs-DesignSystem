"""Build both manuals: python3 docs/build_documentation.py (requires reportlab)."""
from pathlib import Path
import re
import textwrap
from html import escape
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak,
    CondPageBreak, Preformatted, Table, TableStyle, Flowable, KeepTogether,
)
from reportlab.platypus.tableofcontents import TableOfContents

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/pdf'
OUT.mkdir(parents=True, exist_ok=True)
W, H = A4
M = 48
CW = W - 2 * M
INK = colors.HexColor('#172D28')
GREEN = colors.HexColor('#123F36')
MUTED = colors.HexColor('#596963')
PALE = colors.HexColor('#EFF4F1')
GOLD = colors.HexColor('#C49A45')

ST = {
    'body': ParagraphStyle('body', fontName='Helvetica', fontSize=9.2,
        leading=13.5, textColor=INK, spaceAfter=7),
    'h2': ParagraphStyle('h2', fontName='Helvetica-Bold', fontSize=17,
        leading=21, textColor=GREEN, spaceBefore=16, spaceAfter=10,
        keepWithNext=True),
    'h3': ParagraphStyle('h3', fontName='Helvetica-Bold', fontSize=11.5,
        leading=15, textColor=GREEN, spaceBefore=12, spaceAfter=7,
        keepWithNext=True),
    'code': ParagraphStyle('code', fontName='Courier', fontSize=8,
        leading=10.8, textColor=INK, backColor=PALE, borderPadding=7,
        spaceBefore=5, spaceAfter=12),
    'cell': ParagraphStyle('cell', fontName='Helvetica', fontSize=8.1,
        leading=11.2, textColor=INK, wordWrap='CJK'),
    'headcell': ParagraphStyle('headcell', fontName='Helvetica-Bold',
        fontSize=8.1, leading=11.2, textColor=colors.white, wordWrap='CJK'),
    'note': ParagraphStyle('note', fontName='Helvetica', fontSize=9,
        leading=13.4, textColor=GREEN, backColor=PALE, borderPadding=8,
        spaceBefore=6, spaceAfter=12),
    'list': ParagraphStyle('list', fontName='Helvetica', fontSize=9.2,
        leading=13.5, textColor=INK, leftIndent=16, firstLineIndent=-12,
        spaceAfter=5),
}

def clean(s):
    return (s.replace('\u2014', ' - ').replace('\u2013', '-')
        .replace('\u2011', '-').replace('\u2019', "'")
        .replace('\u2018', "'").replace('\u201c', '"').replace('\u201d', '"')
        .replace('\u2026', '...').replace('\u2192', '->')
        .replace('\u203a', '>').replace('\u00a0', ' '))

def inline(s):
    placeholders = []
    def hold(txt):
        placeholders.append(txt)
        return f'ZZZPH{len(placeholders)-1}ZZZ'
    s = clean(s).replace('\\|', '|')
    s = re.sub(r'`([^`]+)`', lambda m: hold(
        '<font name="Courier" size="8">' + escape(m[1]) + '</font>'), s)
    s = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', lambda m: hold(
        '<link href="' + escape(m[2], quote=True) + '" color="#246858">' +
        escape(m[1]) + '</link>'), s)
    s = escape(s)
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
    for i, value in enumerate(placeholders):
        s = s.replace(f'ZZZPH{i}ZZZ', value)
    return s

class Cover(Flowable):
    def __init__(self, subtitle, tag):
        super().__init__()
        self.width, self.height = CW, 640
        self.subtitle, self.tag = subtitle, tag
    def draw(self):
        c = self.canv
        c.setFillColor(GREEN)
        c.roundRect(0, 160, CW, 458, 15, fill=1, stroke=0)
        c.setFillColor(GOLD)
        c.rect(26, 568, 44, 5, fill=1, stroke=0)
        c.setFillColor(colors.HexColor('#DCE9E2'))
        c.setFont('Helvetica-Bold', 10)
        c.drawString(26, 542, 'AI LABS  /  DESIGN SYSTEM')
        c.setFillColor(colors.white)
        c.setFont('Helvetica-Bold', 30)
        for i, line in enumerate(self.subtitle.split('|')):
            c.drawString(26, 475 - i * 38, line)
        c.setFont('Helvetica', 12)
        c.drawString(26, 354, self.tag)
        c.setStrokeColor(colors.HexColor('#4C6A60'))
        c.line(26, 325, CW - 26, 325)
        c.setFont('Helvetica', 10)
        for i, line in enumerate([
            'Angular components, tokens, and the component showcase',
            'Repository baseline 0.1.2  |  Commit 88d2cc8',
            '22 September 2026',
        ]):
            c.drawString(26, 299 - i * 23, line)
        c.setFillColor(GREEN)
        c.setFont('Helvetica-Bold', 11)
        c.drawString(0, 115, 'DESIGN  >  CODE  >  REVIEW  >  RELEASE  >  ADOPT')
        c.setFillColor(MUTED)
        c.setFont('Helvetica', 9)
        c.drawString(0, 90, 'A source-checked reference for designers, developers, and maintainers.')
        c.drawString(0, 72, 'Includes practical limits, verification steps, and official workflow references.')

class Manual(BaseDocTemplate):
    def __init__(self, path, title):
        super().__init__(str(path), pagesize=A4, rightMargin=M, leftMargin=M,
            topMargin=54, bottomMargin=48, title=title,
            author='AI Labs Design System', subject='Technical and operational documentation')
        self.short_title = title
        self.section = ''
        self.addPageTemplates(PageTemplate(id='normal', frames=[
            Frame(M, 48, CW, H - 102, leftPadding=0, rightPadding=0,
                topPadding=0, bottomPadding=0)], onPage=self.page_chrome))
    def beforeDocument(self):
        self.section = ''
    def page_chrome(self, c, doc):
        c.saveState()
        if doc.page > 1:
            c.setFont('Helvetica-Bold', 8)
            c.setFillColor(GREEN)
            c.drawString(M, H - 30, 'AI LABS DESIGN SYSTEM')
            c.setFont('Helvetica', 8)
            c.setFillColor(MUTED)
            c.drawRightString(W - M, H - 30, self.short_title)
            c.setStrokeColor(colors.HexColor('#DDE5DF'))
            c.line(M, H - 39, W - M, H - 39)
        c.setFillColor(MUTED)
        c.setFont('Helvetica', 7.5)
        c.drawString(M, 28, 'v0.1.2  |  22 Sep 2026')
        c.drawRightString(W - M, 28, str(doc.page))
        c.restoreState()
    def afterFlowable(self, flow):
        if isinstance(flow, Paragraph) and flow.style.name == 'h2':
            txt = flow.getPlainText()
            key = 'section-' + re.sub(r'[^a-zA-Z0-9]', '-', txt)
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(txt, key, level=0, closed=False)
            self.notify('TOCEntry', (0, txt, self.page, key))

def make_table(lines):
    rows = []
    for line in lines:
        cells = re.split(r'(?<!\\)\|', line.strip().strip('|'))
        if all(re.fullmatch(r'\s*:?-+:?\s*', x) for x in cells):
            continue
        rows.append(cells)
    n = len(rows[0])
    ratios = {2: [.32, .68], 3: [.26, .34, .40], 4: [.20, .30, .20, .30]}.get(n, [1/n]*n)
    data = [[Paragraph(inline(cell.strip()), ST['headcell' if i == 0 else 'cell'])
        for cell in row] for i, row in enumerate(rows)]
    table = Table(data, colWidths=[CW * x for x in ratios], repeatRows=1,
        hAlign='LEFT', spaceBefore=4, spaceAfter=12)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), GREEN),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, PALE]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LINEBELOW', (0,-1), (-1,-1), .4, colors.HexColor('#DDE5DF')),
    ]))
    return table

def body(markdown):
    lines = clean(markdown).splitlines()
    out = []
    i = 0
    while i < len(lines):
        s = lines[i].strip()
        if not s or s == '---' or s.startswith('# '):
            i += 1
            continue
        if s.startswith('```'):
            code = []
            i += 1
            while i < len(lines) and not lines[i].startswith('```'):
                code.extend(textwrap.wrap(lines[i], 99, replace_whitespace=False,
                    drop_whitespace=False, subsequent_indent='  ') or [''])
                i += 1
            block = Preformatted('\n'.join(code), ST['code'])
            out.append(KeepTogether([block]) if len(code) < 54 else block)
            i += 1
            continue
        if s.startswith('|'):
            chunk = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                chunk.append(lines[i]); i += 1
            out.append(Spacer(1, 1))
            out.append(make_table(chunk))
            continue
        if s.startswith('## '):
            out.extend([CondPageBreak(290 if s.startswith('## Appendix C.') else 135), Paragraph(inline(s[3:]), ST['h2'])])
        elif s.startswith('### '):
            out.extend([CondPageBreak(95), Paragraph(inline(s[4:]), ST['h3'])])
        elif s.startswith('> '):
            out.append(Paragraph(inline(s[2:]), ST['note']))
        elif s.startswith('- '):
            out.append(Paragraph('-  ' + inline(s[2:]), ST['list']))
        elif re.match(r'^\d+\. ', s):
            out.append(Paragraph(inline(s), ST['list']))
        else:
            para = [s]
            while i+1 < len(lines) and lines[i+1].strip() and not re.match(
                r'^(#|\||```|>|- |\d+\. )', lines[i+1].strip()):
                i += 1; para.append(lines[i].strip())
            out.append(Paragraph(inline(' '.join(para)), ST['body']))
        i += 1
    return out

def build(source, filename, title, subtitle, tag):
    toc = TableOfContents()
    toc.levelStyles = [ParagraphStyle('toc', fontName='Helvetica', fontSize=9.5,
        leading=13, textColor=INK, leftIndent=0, firstLineIndent=0,
        spaceBefore=0, spaceAfter=0)]
    story = [Cover(subtitle, tag), PageBreak(),
        Paragraph('Contents', ParagraphStyle('contents', parent=ST['h2'])),
        Paragraph('Click a section title to jump to it. PDF bookmarks provide the same navigation.', ST['body']),
        Spacer(1, 10), toc, PageBreak()]
    story.extend(body((ROOT / source).read_text()))
    doc = Manual(OUT / filename, title)
    doc.multiBuild(story)
    print(OUT / filename)

if __name__ == '__main__':
    build('docs/TECHNICAL_DOCUMENTATION.md',
        'AI_Labs_Design_System_Technical_Documentation.pdf', 'Technical reference',
        'Technical|documentation', 'Architecture / APIs / Tokens / Packaging / Operations')
    build('docs/STEP_BY_STEP_GUIDE.md',
        'AI_Labs_Design_System_Step_by_Step_Guide.pdf', 'Step-by-step guide',
        'Step-by-step|user & release guide', 'Figma / Installation / GitHub / npm / Recovery')
