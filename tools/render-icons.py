"""Export the approved ClaudeBuddy mascot and its quota-color toolbar variants."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
image = Image.open(root / 'assets/branding/claudebuddy-crab.png').convert('RGBA')
for size in [16, 48, 128]:
    image.resize((size, size), Image.Resampling.LANCZOS).save(root / f'icons/logo_{size}.png')

# Recolor the coral body, retaining the dark facial features and cream glints.
# This produces packaged pixels; no remote image or runtime canvas is required.
for name, color in {'green': (34, 197, 94), 'orange': (249, 115, 22), 'red': (239, 68, 68)}.items():
    variant = image.copy()
    variant.putdata([(*color, alpha) if red > green * 1.3 and red > blue * 1.3
                     else (red, green, blue, alpha)
                     for red, green, blue, alpha in image.getdata()])
    for size in [16, 32, 48, 128]:
        variant.resize((size, size), Image.Resampling.LANCZOS).save(root / f'icons/usage-{name}-{size}.png')
