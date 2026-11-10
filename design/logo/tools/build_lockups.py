#!/usr/bin/env python3
"""Build outlined Geist wordmarks and logo lockups for Du Brut au Net.

Requires fonttools[woff] and uharfbuzz. The generated SVGs contain paths only.
"""

from __future__ import annotations

import argparse
import html
import math
import re
import tempfile
from pathlib import Path
from xml.etree import ElementTree

import uharfbuzz as hb
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

BRAND_GREEN = "#16A34A"
DARK_GREEN = "#22C55E"
INK = "#0F172A"
WHITE = "#FFFFFF"
WORDMARK = "Du Brut au Net"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--font", type=Path, required=True)
    parser.add_argument("--symbol", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    parser.add_argument("--weight", type=float, default=650)
    return parser.parse_args()


def load_font(font_path: Path, weight: float) -> tuple[TTFont, bytes]:
    font = TTFont(font_path)
    if "fvar" in font:
        font = instantiateVariableFont(font, {"wght": weight})
    font.flavor = None
    with tempfile.NamedTemporaryFile(suffix=".ttf") as temporary_font:
        font.save(temporary_font.name)
        font_bytes = Path(temporary_font.name).read_bytes()
    return font, font_bytes


def shape_text(font_bytes: bytes, text: str) -> list[tuple[int, int, int, int]]:
    face = hb.Face(font_bytes)
    shaped_font = hb.Font(face)
    shaped_font.scale = (face.upem, face.upem)
    buffer = hb.Buffer()
    buffer.add_str(text)
    buffer.guess_segment_properties()
    hb.shape(shaped_font, buffer, {"kern": True})
    return [
        (info.codepoint, position.x_advance, position.x_offset, position.y_offset)
        for info, position in zip(buffer.glyph_infos, buffer.glyph_positions)
    ]


def outline_text(
    font: TTFont,
    shaped: list[tuple[int, int, int, int]],
    font_size: float,
    x: float,
    baseline: float,
) -> tuple[list[str], tuple[float, float, float, float]]:
    scale = font_size / font["head"].unitsPerEm
    glyph_set = font.getGlyphSet()
    glyph_order = font.getGlyphOrder()
    paths: list[str] = []
    bounds_pen = BoundsPen(glyph_set)
    cursor = 0

    for glyph_id, advance, x_offset, y_offset in shaped:
        glyph = glyph_set[glyph_order[glyph_id]]
        transform = (
            scale,
            0,
            0,
            -scale,
            x + (cursor + x_offset) * scale,
            baseline - y_offset * scale,
        )
        svg_pen = SVGPathPen(glyph_set)
        glyph.draw(TransformPen(svg_pen, transform))
        path_data = svg_pen.getCommands()
        if path_data:
            paths.append(path_data)
        glyph.draw(TransformPen(bounds_pen, transform))
        cursor += advance

    if bounds_pen.bounds is None:
        raise ValueError("The wordmark produced no visible glyphs")
    return paths, bounds_pen.bounds


def read_symbol_path(symbol_path: Path) -> tuple[str, str]:
    root = ElementTree.parse(symbol_path).getroot()
    path = root.find("{http://www.w3.org/2000/svg}path")
    if path is None or not path.get("d"):
        raise ValueError(f"No symbol path found in {symbol_path}")
    return path.get("d", ""), path.get("fill-rule", "nonzero")


def path_markup(paths: list[str], fill: str) -> str:
    def round_coordinate(match: re.Match[str]) -> str:
        rounded = round(float(match.group()), 2)
        return f"{rounded:g}"

    coordinate_pattern = re.compile(r"-?\d+\.\d+")
    normalised_paths = [
        coordinate_pattern.sub(round_coordinate, data) for data in paths
    ]
    return "\n".join(
        f'    <path fill="{fill}" d="{data}"/>' for data in normalised_paths
    )


def write_svg(path: Path, view_box: str, title: str, body: str) -> None:
    path.write_text(
        "\n".join(
            [
                f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view_box}" role="img" aria-labelledby="title">',
                f"  <title id=\"title\">{html.escape(title)}</title>",
                body,
                "</svg>",
                "",
            ]
        ),
        encoding="utf-8",
    )


def build_wordmark(
    font: TTFont,
    shaped: list[tuple[int, int, int, int]],
    out_dir: Path,
) -> tuple[list[str], float]:
    initial_paths, bounds = outline_text(font, shaped, 72, 0, 0)
    min_x, min_y, max_x, max_y = bounds
    padding = 8
    paths, shifted_bounds = outline_text(font, shaped, 72, padding - min_x, padding - min_y)
    _, _, shifted_max_x, shifted_max_y = shifted_bounds
    width = math.ceil(shifted_max_x + padding)
    height = math.ceil(shifted_max_y + padding)
    write_svg(
        out_dir / "du-brut-au-net-wordmark-color.svg",
        f"0 0 {width} {height}",
        "Mot-symbole Du Brut au Net",
        path_markup(paths, INK),
    )
    return initial_paths, max_x - min_x


def build_horizontal(
    font: TTFont,
    shaped: list[tuple[int, int, int, int]],
    symbol_path: str,
    fill_rule: str,
    out_dir: Path,
) -> None:
    word_paths, _ = outline_text(font, shaped, 72, 224, 151)
    symbol = (
        '  <g id="symbol" transform="translate(16 40) scale(.6875)">\n'
        f'    <path fill="{BRAND_GREEN}" fill-rule="{fill_rule}" d="{symbol_path}"/>\n'
        "  </g>"
    )
    body = f"{symbol}\n  <g id=\"wordmark\">\n{path_markup(word_paths, INK)}\n  </g>"
    write_svg(
        out_dir / "du-brut-au-net-logo-horizontal-color.svg",
        "0 0 760 256",
        "Logo horizontal Du Brut au Net",
        body,
    )
    dark_symbol = symbol.replace(BRAND_GREEN, DARK_GREEN)
    dark_body = f"{dark_symbol}\n  <g id=\"wordmark\">\n{path_markup(word_paths, WHITE)}\n  </g>"
    write_svg(
        out_dir / "du-brut-au-net-logo-horizontal-dark.svg",
        "0 0 760 256",
        "Logo horizontal Du Brut au Net sur fond sombre",
        dark_body,
    )


def build_stacked(
    font: TTFont,
    shaped: list[tuple[int, int, int, int]],
    symbol_path: str,
    fill_rule: str,
    out_dir: Path,
) -> None:
    _, bounds = outline_text(font, shaped, 72, 0, 0)
    word_width = bounds[2] - bounds[0]
    word_x = (900 - word_width) / 2 - bounds[0]
    word_paths, _ = outline_text(font, shaped, 72, word_x, 342)
    symbol = (
        '  <g id="symbol" transform="translate(362 32) scale(.6875)">\n'
        f'    <path fill="{BRAND_GREEN}" fill-rule="{fill_rule}" d="{symbol_path}"/>\n'
        "  </g>"
    )
    body = f"{symbol}\n  <g id=\"wordmark\">\n{path_markup(word_paths, INK)}\n  </g>"
    write_svg(
        out_dir / "du-brut-au-net-logo-stacked-color.svg",
        "0 0 900 400",
        "Logo empilé Du Brut au Net",
        body,
    )
    dark_symbol = symbol.replace(BRAND_GREEN, DARK_GREEN)
    dark_body = f"{dark_symbol}\n  <g id=\"wordmark\">\n{path_markup(word_paths, WHITE)}\n  </g>"
    write_svg(
        out_dir / "du-brut-au-net-logo-stacked-dark.svg",
        "0 0 900 400",
        "Logo empilé Du Brut au Net sur fond sombre",
        dark_body,
    )


def main() -> None:
    args = parse_args()
    args.out_dir.mkdir(parents=True, exist_ok=True)
    font, font_bytes = load_font(args.font, args.weight)
    shaped = shape_text(font_bytes, WORDMARK)
    symbol_path, fill_rule = read_symbol_path(args.symbol)
    build_wordmark(font, shaped, args.out_dir)
    build_horizontal(font, shaped, symbol_path, fill_rule, args.out_dir)
    build_stacked(font, shaped, symbol_path, fill_rule, args.out_dir)


if __name__ == "__main__":
    main()
