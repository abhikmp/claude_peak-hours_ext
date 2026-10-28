"""Export the brand mascot and the separate circular usage indicators."""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
image = Image.open(root / 'assets/branding/claudebuddy-crab.png').convert('RGBA')
for size in [16, 48, 128]:
    image.resize((size, size), Image.Resampling.LANCZOS).save(root / f'icons/logo_{size}.png')

# Match the original toolbar circle: radius 42% of the canvas, 8% inset.
# Render at higher resolution for smooth edges at native toolbar sizes.
for name, color in {'green': (34, 197, 94), 'orange': (249, 115, 22), 'red': (239, 68, 68)}.items():
    for size in [16, 32, 48, 128]:
        scale = 8
        dimension = size * scale
        variant = Image.new('RGBA', (dimension, dimension))
        inset = round(dimension * 0.08)
        ImageDraw.Draw(variant).ellipse(
            (inset, inset, dimension - inset - 1, dimension - inset - 1), fill=(*color, 255))
        variant.resize((size, size), Image.Resampling.LANCZOS).save(root / f'icons/usage-{name}-{size}.png')
