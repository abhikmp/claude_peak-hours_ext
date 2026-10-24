"""Rasterize the existing usage-driven toolbar circle at manifest sizes."""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
for size in [16, 48, 128]:
    scale = 8
    image = Image.new('RGBA', (size * scale, size * scale))
    inset = size * scale * 0.08
    ImageDraw.Draw(image).ellipse((inset, inset, size * scale - inset, size * scale - inset), fill='#22c55e')
    image.resize((size, size), Image.Resampling.LANCZOS).save(root / f'icons/logo_{size}.png')
