from __future__ import annotations

import html
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
}


def qn(prefix: str, name: str) -> str:
    return f"{{{NS[prefix]}}}{name}"


def normalize_text(value: str) -> str:
    replacements = {
        "â€“": "-",
        "â€”": "-",
        "â€˜": "'",
        "â€™": "'",
        "â€œ": '"',
        "â€": '"',
        "Â ": " ",
        "\u00a0": " ",
        "â˜º": "",
    }
    for old, new in replacements.items():
        value = value.replace(old, new)
    return value


def load_xml(docx: zipfile.ZipFile, name: str) -> ET.Element | None:
    try:
        return ET.fromstring(docx.read(name))
    except KeyError:
        return None


def relationship_targets(docx: zipfile.ZipFile) -> dict[str, str]:
    root = load_xml(docx, "word/_rels/document.xml.rels")
    if root is None:
        return {}
    return {
        rel.attrib.get("Id", ""): rel.attrib.get("Target", "")
        for rel in root.findall("rel:Relationship", NS)
    }


def text_from_run(run: ET.Element, rels: dict[str, str]) -> str:
    pieces: list[str] = []
    for child in run:
        if child.tag == qn("w", "t"):
            pieces.append(html.escape(normalize_text(child.text or "")))
        elif child.tag == qn("w", "tab"):
            pieces.append("&nbsp;&nbsp;&nbsp;&nbsp;")
        elif child.tag == qn("w", "br"):
            pieces.append("<br>")

    text = "".join(pieces)
    if not text:
        return ""

    props = run.find("w:rPr", NS)
    if props is not None:
        if props.find("w:b", NS) is not None:
            text = f"<strong>{text}</strong>"
        if props.find("w:i", NS) is not None:
            text = f"<em>{text}</em>"
        if props.find("w:u", NS) is not None:
            text = f"<u>{text}</u>"

    return text


def paragraph_text(paragraph: ET.Element, rels: dict[str, str]) -> str:
    pieces: list[str] = []
    for child in paragraph:
        if child.tag == qn("w", "r"):
            pieces.append(text_from_run(child, rels))
        elif child.tag == qn("w", "hyperlink"):
            link_text = "".join(
                text_from_run(run, rels) for run in child.findall("w:r", NS)
            )
            rid = child.attrib.get(qn("r", "id"))
            href = rels.get(rid or "")
            if href and link_text:
                pieces.append(
                    f'<a href="{html.escape(href, quote=True)}">{link_text}</a>'
                )
            else:
                pieces.append(link_text)
    return "".join(pieces).strip()


def paragraph_class(paragraph: ET.Element) -> str:
    props = paragraph.find("w:pPr", NS)
    if props is None:
        return ""

    style = props.find("w:pStyle", NS)
    if style is not None:
        value = style.attrib.get(qn("w", "val"), "").lower()
        if "title" in value:
            return "title"
        if "subtitle" in value:
            return "subtitle"
        if "heading" in value:
            return "section-heading"

    justification = props.find("w:jc", NS)
    if justification is not None and justification.attrib.get(qn("w", "val")) == "center":
        return "center"

    return ""


def is_list_item(paragraph: ET.Element) -> bool:
    props = paragraph.find("w:pPr", NS)
    return props is not None and props.find("w:numPr", NS) is not None


def table_to_html(table: ET.Element, rels: dict[str, str]) -> str:
    rows: list[str] = []
    for row in table.findall("w:tr", NS):
        cells: list[str] = []
        for cell in row.findall("w:tc", NS):
            content = []
            for paragraph in cell.findall("w:p", NS):
                text = paragraph_text(paragraph, rels)
                if text:
                    content.append(text)
            cells.append(f"<td>{'<br>'.join(content)}</td>")
        if cells:
            rows.append(f"<tr>{''.join(cells)}</tr>")
    return f"<table>{''.join(rows)}</table>" if rows else ""


def append_paragraph(
    chunks: list[str],
    paragraph: ET.Element,
    rels: dict[str, str],
    in_list: bool,
    seen: set[str],
) -> bool:
    text = paragraph_text(paragraph, rels)
    if not text:
        return in_list

    key = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", text)).strip().lower()
    key = key.replace("&nbsp;", " ").strip()
    if not key or key == "\u263a":
        return in_list
    if len(key) > 3 and key in seen:
        return in_list
    if len(key) > 3:
        seen.add(key)

    if is_list_item(paragraph):
        if not in_list:
            chunks.append("<ul>")
            in_list = True
        chunks.append(f"<li>{text}</li>")
        return in_list

    if in_list:
        chunks.append("</ul>")
        in_list = False

    css_class = paragraph_class(paragraph)
    if key == "swapnil jagannath dhotre":
        css_class = "title"
    elif key.startswith("junior mern stack") or "swapnildhotre9767@gmail.com" in key:
        css_class = "center"
    elif key in {
        "professional summary",
        "technical skills",
        "experience",
        "training",
        "certification",
        "projects",
        "education",
        "soft skills",
        "language",
        "hobbies",
    }:
        css_class = "section-heading"
    class_attr = f' class="{css_class}"' if css_class else ""
    chunks.append(f"<p{class_attr}>{text}</p>")
    return in_list


def nested_textbox_paragraphs(paragraph: ET.Element) -> list[ET.Element]:
    nested: list[ET.Element] = []
    for textbox in paragraph.findall(".//w:txbxContent", NS):
        nested.extend(textbox.findall(".//w:p", NS))
    return nested


def body_to_html(root: ET.Element, rels: dict[str, str]) -> str:
    body = root.find("w:body", NS)
    if body is None:
        return ""

    chunks: list[str] = []
    in_list = False
    seen: set[str] = set()

    for child in body:
        if child.tag == qn("w", "p"):
            nested = nested_textbox_paragraphs(child)
            if nested:
                for paragraph in nested:
                    in_list = append_paragraph(chunks, paragraph, rels, in_list, seen)
            else:
                in_list = append_paragraph(chunks, child, rels, in_list, seen)

        elif child.tag == qn("w", "tbl"):
            if in_list:
                chunks.append("</ul>")
                in_list = False
            table_html = table_to_html(child, rels)
            if table_html:
                chunks.append(table_html)

    if in_list:
        chunks.append("</ul>")

    return "\n".join(chunks)


def convert(source: Path, destination: Path) -> None:
    with zipfile.ZipFile(source) as docx:
        document = load_xml(docx, "word/document.xml")
        if document is None:
            raise RuntimeError("word/document.xml was not found in the DOCX file.")
        rels = relationship_targets(docx)
        content = body_to_html(document, rels)

    destination.write_text(
        f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Swapnil Dhotre Resume</title>
  <style>
    :root {{
      color: #1f2933;
      background: #eef2f5;
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.48;
    }}
    body {{
      margin: 0;
      padding: 32px 16px;
    }}
    main {{
      max-width: 860px;
      margin: 0 auto;
      background: #ffffff;
      padding: 42px 54px;
      border: 1px solid #d7dde3;
      box-shadow: 0 18px 45px rgba(24, 39, 54, 0.12);
    }}
    p {{
      margin: 0 0 9px;
      font-size: 14px;
    }}
    .title {{
      margin-bottom: 4px;
      color: #102a43;
      font-size: 28px;
      font-weight: 700;
      text-align: center;
    }}
    .subtitle,
    .center {{
      text-align: center;
    }}
    .section-heading {{
      margin-top: 18px;
      margin-bottom: 7px;
      padding-bottom: 4px;
      border-bottom: 1px solid #cbd5df;
      color: #102a43;
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
    }}
    ul {{
      margin: 0 0 10px 20px;
      padding: 0;
    }}
    li {{
      margin-bottom: 5px;
      font-size: 14px;
    }}
    table {{
      width: 100%;
      margin: 10px 0 14px;
      border-collapse: collapse;
      font-size: 14px;
    }}
    td {{
      padding: 7px 8px;
      border: 1px solid #cbd5df;
      vertical-align: top;
    }}
    a {{
      color: #0b65c2;
      text-decoration: none;
    }}
    a:hover {{
      text-decoration: underline;
    }}
    @media print {{
      :root {{
        background: #ffffff;
      }}
      body {{
        padding: 0;
      }}
      main {{
        border: 0;
        box-shadow: none;
        padding: 0;
      }}
    }}
    @media (max-width: 640px) {{
      body {{
        padding: 0;
      }}
      main {{
        padding: 28px 22px;
        border: 0;
      }}
      .title {{
        font-size: 24px;
      }}
    }}
  </style>
</head>
<body>
  <main>
{content}
  </main>
</body>
</html>
""",
        encoding="utf-8",
    )


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: convert_docx_to_html.py SOURCE.docx DESTINATION.html")
    convert(Path(sys.argv[1]), Path(sys.argv[2]))
