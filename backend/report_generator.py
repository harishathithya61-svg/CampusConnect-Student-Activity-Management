import io
import csv
from datetime import datetime, timezone
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether

def generate_csv_report(students, report_type="complete"):
    """Generates a raw CSV export of students."""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "USN", "Full Name", "Email", "Phone", "Department", "Branch", 
        "Section", "Academic Year", "Technical", "Sports", "Cultural", 
        "Activities Enrolled", "Registration Date"
    ])
    
    for s in students:
        s_dict = s.to_dict() if hasattr(s, 'to_dict') else s
        writer.writerow([
            s_dict['usn'],
            s_dict['full_name'],
            s_dict['email'],
            s_dict['phone'],
            s_dict['department'],
            s_dict['branch'],
            s_dict['section'],
            s_dict['academic_year'],
            "YES" if s_dict['participates_technical'] else "NO",
            "YES" if s_dict['participates_sports'] else "NO",
            "YES" if s_dict['participates_cultural'] else "NO",
            ", ".join(s_dict.get('activities', [])),
            s_dict['created_at']
        ])
    
    output.seek(0)
    return output.getvalue().encode('utf-8')


def generate_excel_report(students, math_analysis, report_type="complete"):
    """
    Generates a multi-sheet formatted XLSX workbook with openpyxl:
    - Sheet 1: Executive Summary & Set Theory Analysis
    - Sheet 2: Student Participation Roster
    - Sheet 3: Venn Disjoint Regions
    """
    wb = Workbook()
    
    # Styles
    title_font = Font(name='Calibri', size=16, bold=True, color='FFFFFF')
    header_font = Font(name='Calibri', size=11, bold=True, color='FFFFFF')
    bold_font = Font(name='Calibri', size=11, bold=True)
    regular_font = Font(name='Calibri', size=11)
    
    header_fill = PatternFill(start_color='1E3A8A', end_color='1E3A8A', fill_type='solid') # Deep blue
    sub_fill = PatternFill(start_color='2563EB', end_color='2563EB', fill_type='solid')    # Blue
    highlight_fill = PatternFill(start_color='EFF6FF', end_color='EFF6FF', fill_type='solid')
    thin_border = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )

    # ---------------- SHEET 1: Executive Summary & Math ----------------
    ws1 = wb.active
    ws1.title = "Summary & Set Theory"
    
    # Title Block
    ws1.merge_cells('A1:F1')
    title_cell = ws1['A1']
    title_cell.value = "CampusConnect – Student Activity Participation & Set Theory Analysis Report"
    title_cell.font = title_font
    title_cell.fill = header_fill
    title_cell.alignment = Alignment(horizontal='center', vertical='center')
    ws1.row_dimensions[1].height = 36

    ws1.cell(row=2, column=1, value=f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')} | Report Type: {report_type.upper()}").font = regular_font

    # Set Theory Metrics Table
    ws1.cell(row=4, column=1, value="Set Theory Cardinalities & Inclusive Intersections").font = bold_font
    metrics = [
        ("Universal Set |U|", math_analysis['universal_set']['count'], f"{math_analysis['universal_set']['percentage']}%"),
        ("Technical Activities |A|", math_analysis['individual_sets']['set_a']['count'], f"{math_analysis['individual_sets']['set_a']['percentage']}%"),
        ("Sports Activities |B|", math_analysis['individual_sets']['set_b']['count'], f"{math_analysis['individual_sets']['set_b']['percentage']}%"),
        ("Cultural Activities |C|", math_analysis['individual_sets']['set_c']['count'], f"{math_analysis['individual_sets']['set_c']['percentage']}%"),
        ("Technical ∩ Sports |A ∩ B|", math_analysis['inclusive_intersections']['a_cap_b']['count'], f"{math_analysis['inclusive_intersections']['a_cap_b']['percentage']}%"),
        ("Technical ∩ Cultural |A ∩ C|", math_analysis['inclusive_intersections']['a_cap_c']['count'], f"{math_analysis['inclusive_intersections']['a_cap_c']['percentage']}%"),
        ("Sports ∩ Cultural |B ∩ C|", math_analysis['inclusive_intersections']['b_cap_c']['count'], f"{math_analysis['inclusive_intersections']['b_cap_c']['percentage']}%"),
        ("All Three Activities |A ∩ B ∩ C|", math_analysis['inclusive_intersections']['a_cap_b_cap_c']['count'], f"{math_analysis['inclusive_intersections']['a_cap_b_cap_c']['percentage']}%"),
        ("Unique Participants |A ∪ B ∪ C|", math_analysis['union_and_complements']['union']['count'], f"{math_analysis['union_and_complements']['union']['percentage']}%"),
        ("Non-Participants (None)", math_analysis['union_and_complements']['none']['count'], f"{math_analysis['union_and_complements']['none']['percentage']}%")
    ]

    ws1.append(["Metric / Set", "Count", "Percentage of Universal Set"])
    h_row = 5
    for col in range(1, 4):
        c = ws1.cell(row=h_row, column=col)
        c.font = header_font
        c.fill = sub_fill
        c.alignment = Alignment(horizontal='center' if col > 1 else 'left')

    for label, count, pct_str in metrics:
        ws1.append([label, count, pct_str])
        curr_row = ws1.max_row
        for col in range(1, 4):
            c = ws1.cell(row=curr_row, column=col)
            c.font = regular_font
            c.border = thin_border
            if col > 1:
                c.alignment = Alignment(horizontal='center')

    # Inclusion-Exclusion Formula block
    f_row = ws1.max_row + 2
    ws1.cell(row=f_row, column=1, value="Principle of Inclusion-Exclusion Validation").font = bold_font
    ws1.cell(row=f_row+1, column=1, value=math_analysis['inclusion_exclusion_breakdown']['formula']).font = bold_font
    ws1.cell(row=f_row+2, column=1, value=f"Substituted Values: {math_analysis['inclusion_exclusion_breakdown']['substituted']}").font = regular_font
    ws1.cell(row=f_row+3, column=1, value=f"Double Counting Eliminated: {math_analysis['inclusion_exclusion_breakdown']['raw_double_counted_difference']} duplicated registrations removed").font = regular_font

    ws1.column_dimensions['A'].width = 38
    ws1.column_dimensions['B'].width = 16
    ws1.column_dimensions['C'].width = 28

    # ---------------- SHEET 2: Student Roster ----------------
    ws2 = wb.create_sheet(title="Student Roster")
    headers = [
        "USN", "Full Name", "Email", "Department", "Section", "Year", 
        "Technical", "Sports", "Cultural", "Total Activities", "Venn Region"
    ]
    ws2.append(headers)
    for col in range(1, len(headers) + 1):
        c = ws2.cell(row=1, column=col)
        c.font = header_font
        c.fill = header_fill
        c.alignment = Alignment(horizontal='center')
        ws2.column_dimensions[c.column_letter].width = 18

    ws2.column_dimensions['B'].width = 24
    ws2.column_dimensions['C'].width = 32
    ws2.column_dimensions['D'].width = 26

    for s in students:
        s_dict = s.to_dict() if hasattr(s, 'to_dict') else s
        ws2.append([
            s_dict['usn'],
            s_dict['full_name'],
            s_dict['email'],
            s_dict['department'],
            s_dict['section'],
            s_dict['academic_year'],
            "Yes" if s_dict['participates_technical'] else "No",
            "Yes" if s_dict['participates_sports'] else "No",
            "Yes" if s_dict['participates_cultural'] else "No",
            s_dict['activity_count'],
            s_dict['participation_region'].replace('_', ' ').title()
        ])
        curr_row = ws2.max_row
        for col in range(1, len(headers) + 1):
            c = ws2.cell(row=curr_row, column=col)
            c.font = regular_font
            c.border = thin_border
            if col in [1, 5, 6, 7, 8, 9, 10]:
                c.alignment = Alignment(horizontal='center')

    # ---------------- SHEET 3: 7 Disjoint Venn Regions ----------------
    ws3 = wb.create_sheet(title="Venn Regions Breakdown")
    ws3.append(["Region ID", "Region Name", "Set Notation", "Count", "Percentage of U"])
    for col in range(1, 6):
        c = ws3.cell(row=1, column=col)
        c.font = header_font
        c.fill = sub_fill
        c.alignment = Alignment(horizontal='center')

    regions = math_analysis['venn_regions']
    for k, reg in regions.items():
        ws3.append([
            reg['id'],
            reg['label'],
            reg['symbol'],
            reg['count'],
            f"{reg['percentage']}%"
        ])
        curr_row = ws3.max_row
        for col in range(1, 6):
            c = ws3.cell(row=curr_row, column=col)
            c.font = regular_font
            c.border = thin_border
            if col in [1, 4, 5]:
                c.alignment = Alignment(horizontal='center')

    ws3.column_dimensions['A'].width = 16
    ws3.column_dimensions['B'].width = 36
    ws3.column_dimensions['C'].width = 24
    ws3.column_dimensions['D'].width = 12
    ws3.column_dimensions['E'].width = 20

    stream = io.BytesIO()
    wb.save(stream)
    stream.seek(0)
    return stream.getvalue()


def generate_pdf_report(students, math_analysis, report_type="complete"):
    """
    Generates a professional academic PDF report using ReportLab with:
    - Official Header & University Metadata
    - Executive Summary
    - Set Theory & Inclusion-Exclusion Formulas & Calculated Table
    - Venn 7 Disjoint Regions Table
    - Formatted Student List
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0F172A'),
        alignment=1, # Center
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#475569'),
        alignment=1, # Center
        spaceAfter=14
    )
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1E3A8A'),
        spaceBefore=10,
        spaceAfter=6,
        borderPadding=(0, 0, 2, 0),
        borderColor=colors.HexColor('#2563EB')
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#1E293B')
    )
    formula_style = ParagraphStyle(
        'Formula',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#1E40AF'),
        backColor=colors.HexColor('#EFF6FF'),
        borderPadding=6,
        spaceAfter=8
    )
    table_text = ParagraphStyle(
        'TableText',
        parent=styles['Normal'],
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#0F172A')
    )
    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontSize=8,
        leading=10,
        fontName='Helvetica-Bold',
        textColor=colors.white
    )

    elements = []

    # Title & Header
    elements.append(Paragraph("CampusConnect", title_style))
    elements.append(Paragraph("Student Activity Participation and Overlap Analysis System", ParagraphStyle('SubHeader', parent=title_style, fontSize=12, leading=15, textColor=colors.HexColor('#2563EB'))))
    elements.append(Paragraph(
        f"<b>Discrete Mathematics and Graph Theory (25BSMA10) Experiential Learning</b><br/>"
        f"Generated: {datetime.now(timezone.utc).strftime('%B %d, %Y - %H:%M UTC')} | Scope: {report_type.upper()} REPORT",
        subtitle_style
    ))
    elements.append(Spacer(1, 8))

    # Section 1: Set Theory Analysis Summary
    elements.append(Paragraph("1. Mathematical Model & Inclusion-Exclusion Principle", section_heading))
    
    pie_text = (
        f"<b>Formula:</b> |A ∪ B ∪ C| = |A| + |B| + |C| - |A ∩ B| - |A ∩ C| - |B ∩ C| + |A ∩ B ∩ C|<br/>"
        f"<b>Substituted:</b> {math_analysis['inclusion_exclusion_breakdown']['substituted']}<br/>"
        f"<b>Deduplication:</b> {math_analysis['inclusion_exclusion_breakdown']['raw_double_counted_difference']} duplicate instances eliminated. "
        f"Universal Cohort |U| = {math_analysis['universal_set']['count']} students."
    )
    elements.append(Paragraph(pie_text, formula_style))

    # Mathematical Table
    set_data = [
        [Paragraph("<b>Set / Overlap Category</b>", table_header), Paragraph("<b>Notation</b>", table_header), Paragraph("<b>Count</b>", table_header), Paragraph("<b>Percentage (% U)</b>", table_header)],
        [Paragraph("Universal Set", table_text), Paragraph("U", table_text), Paragraph(str(math_analysis['universal_set']['count']), table_text), Paragraph(f"{math_analysis['universal_set']['percentage']}%", table_text)],
        [Paragraph("Technical Activities", table_text), Paragraph("A", table_text), Paragraph(str(math_analysis['individual_sets']['set_a']['count']), table_text), Paragraph(f"{math_analysis['individual_sets']['set_a']['percentage']}%", table_text)],
        [Paragraph("Sports Activities", table_text), Paragraph("B", table_text), Paragraph(str(math_analysis['individual_sets']['set_b']['count']), table_text), Paragraph(f"{math_analysis['individual_sets']['set_b']['percentage']}%", table_text)],
        [Paragraph("Cultural Activities", table_text), Paragraph("C", table_text), Paragraph(str(math_analysis['individual_sets']['set_c']['count']), table_text), Paragraph(f"{math_analysis['individual_sets']['set_c']['percentage']}%", table_text)],
        [Paragraph("Technical & Sports", table_text), Paragraph("A ∩ B", table_text), Paragraph(str(math_analysis['inclusive_intersections']['a_cap_b']['count']), table_text), Paragraph(f"{math_analysis['inclusive_intersections']['a_cap_b']['percentage']}%", table_text)],
        [Paragraph("Technical & Cultural", table_text), Paragraph("A ∩ C", table_text), Paragraph(str(math_analysis['inclusive_intersections']['a_cap_c']['count']), table_text), Paragraph(f"{math_analysis['inclusive_intersections']['a_cap_c']['percentage']}%", table_text)],
        [Paragraph("Sports & Cultural", table_text), Paragraph("B ∩ C", table_text), Paragraph(str(math_analysis['inclusive_intersections']['b_cap_c']['count']), table_text), Paragraph(f"{math_analysis['inclusive_intersections']['b_cap_c']['percentage']}%", table_text)],
        [Paragraph("All Three Activities", table_text), Paragraph("A ∩ B ∩ C", table_text), Paragraph(str(math_analysis['inclusive_intersections']['a_cap_b_cap_c']['count']), table_text), Paragraph(f"{math_analysis['inclusive_intersections']['a_cap_b_cap_c']['percentage']}%", table_text)],
        [Paragraph("<b>Unique Participants</b>", table_text), Paragraph("<b>A ∪ B ∪ C</b>", table_text), Paragraph(f"<b>{math_analysis['union_and_complements']['union']['count']}</b>", table_text), Paragraph(f"<b>{math_analysis['union_and_complements']['union']['percentage']}%</b>", table_text)],
        [Paragraph("Non-Participants", table_text), Paragraph("U - (A ∪ B ∪ C)", table_text), Paragraph(str(math_analysis['union_and_complements']['none']['count']), table_text), Paragraph(f"{math_analysis['union_and_complements']['none']['percentage']}%", table_text)]
    ]

    t1 = Table(set_data, colWidths=[200, 120, 90, 110])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E3A8A')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (2, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t1)
    elements.append(Spacer(1, 10))

    # Section 2: Seven Disjoint Venn Regions
    elements.append(Paragraph("2. Mutually Exclusive (Disjoint) Venn Diagram Regions", section_heading))
    venn_data = [
        [Paragraph("<b>Region Name</b>", table_header), Paragraph("<b>Mathematical Definition</b>", table_header), Paragraph("<b>Count</b>", table_header), Paragraph("<b>% of U</b>", table_header)]
    ]
    for k, reg in math_analysis['venn_regions'].items():
        venn_data.append([
            Paragraph(reg['label'], table_text),
            Paragraph(reg['symbol'], table_text),
            Paragraph(str(reg['count']), table_text),
            Paragraph(f"{reg['percentage']}%", table_text)
        ])

    t2 = Table(venn_data, colWidths=[180, 160, 80, 100])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563EB')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (2, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(t2)
    elements.append(Spacer(1, 10))

    # Section 3: Student Roster
    elements.append(Paragraph(f"3. Registered Students Roster ({len(students)} Records Included)", section_heading))
    roster_headers = [
        Paragraph("<b>USN</b>", table_header),
        Paragraph("<b>Student Name</b>", table_header),
        Paragraph("<b>Department</b>", table_header),
        Paragraph("<b>Sec</b>", table_header),
        Paragraph("<b>Tech</b>", table_header),
        Paragraph("<b>Sports</b>", table_header),
        Paragraph("<b>Cultural</b>", table_header),
        Paragraph("<b>Total</b>", table_header)
    ]
    roster_data = [roster_headers]
    
    # Show first 150 students if list is very large, with note
    max_in_pdf = 150
    display_students = students[:max_in_pdf]
    for s in display_students:
        s_dict = s.to_dict() if hasattr(s, 'to_dict') else s
        roster_data.append([
            Paragraph(s_dict['usn'], table_text),
            Paragraph(s_dict['full_name'], table_text),
            Paragraph(s_dict['department'], table_text),
            Paragraph(s_dict['section'], table_text),
            Paragraph("✓" if s_dict['participates_technical'] else "—", table_text),
            Paragraph("✓" if s_dict['participates_sports'] else "—", table_text),
            Paragraph("✓" if s_dict['participates_cultural'] else "—", table_text),
            Paragraph(str(s_dict['activity_count']), table_text)
        ])

    t3 = Table(roster_data, colWidths=[95, 140, 150, 35, 30, 35, 40, 30])
    t3.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (3, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    elements.append(t3)

    if len(students) > max_in_pdf:
        elements.append(Spacer(1, 6))
        elements.append(Paragraph(
            f"<i>* Note: Displaying first {max_in_pdf} of {len(students)} student records in printable PDF format. "
            f"Download the comprehensive Excel (XLSX) or CSV report for complete database extraction.</i>",
            body_style
        ))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
