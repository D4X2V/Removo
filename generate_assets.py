import math
from PIL import Image, ImageDraw, ImageFilter

def create_logo():
    size = 512
    # Create high-res RGBA image
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background rounded squircle with violet gradient
    # We can create a base layer with glowing edges
    center = size / 2

    # Draw ambient glow
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([80, 80, 432, 432], fill=(168, 85, 247, 90))
    glow_draw.ellipse([140, 140, 372, 372], fill=(192, 132, 252, 130))
    glow = glow.filter(ImageFilter.GaussianBlur(35))
    img.paste(glow, (0, 0), glow)

    # Main rounded icon base (squircle)
    margin = 44
    card = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    card_draw = ImageDraw.Draw(card)
    card_draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=100,
        fill=(19, 12, 36, 245),
        outline=(168, 85, 247, 220),
        width=5
    )
    img.paste(card, (0, 0), card)

    # Inside design: A stylized dynamic scissors / cutting aperture crystal prism
    # Blade 1 (Left to Bottom-Right)
    blade1 = [
        (160, 160),
        (352, 352),
        (320, 384),
        (130, 210),
    ]
    # Scissors / Aperture ring 1
    draw.ellipse([120, 120, 210, 210], outline=(168, 85, 247, 255), width=8)
    draw.ellipse([145, 145, 185, 185], fill=(124, 58, 237, 200))

    # Ring 2
    draw.ellipse([302, 302, 392, 392], outline=(192, 132, 252, 255), width=8)
    draw.ellipse([327, 327, 367, 367], fill=(147, 51, 234, 200))

    # Center cutting beams forming a diamond star / laser precision cut
    cx, cy = 256, 256
    points = [
        (cx, cy - 110),
        (cx + 26, cy - 26),
        (cx + 110, cy),
        (cx + 26, cy + 26),
        (cx, cy + 110),
        (cx - 26, cy + 26),
        (cx - 110, cy),
        (cx - 26, cy - 26)
    ]
    draw.polygon(points, fill=(236, 72, 153, 240))

    # Inner bright star
    inner_star = [
        (cx, cy - 80),
        (cx + 16, cy - 16),
        (cx + 80, cy),
        (cx + 16, cy + 16),
        (cx, cy + 80),
        (cx - 16, cy + 16),
        (cx - 80, cy),
        (cx - 16, cy - 16)
    ]
    draw.polygon(inner_star, fill=(255, 255, 255, 255))

    # Laser cut line across with glow
    draw.line([(90, 420), (420, 90)], fill=(216, 180, 254, 220), width=6)
    draw.line([(100, 410), (410, 100)], fill=(255, 255, 255, 255), width=2)

    # Save PNG
    png_path = r"C:\Users\Dako9\.gemini\antigravity\scratch\VioletCut-AI\assets\logo.png"
    img.save(png_path, "PNG")
    print(f"Saved {png_path}")

    # Save Multi-resolution ICO
    ico_path = r"C:\Users\Dako9\.gemini\antigravity\scratch\VioletCut-AI\assets\app.ico"
    img.save(ico_path, format="ICO", sizes=[(16,16), (24,24), (32,32), (48,48), (64,64), (128,128), (256,256)])
    print(f"Saved {ico_path}")

    # Generate crisp SVG logo as well
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C084FC" />
      <stop offset="50%" stop-color="#8B5CF6" />
      <stop offset="100%" stop-color="#6B21A8" />
    </linearGradient>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A102E" />
      <stop offset="100%" stop-color="#0E071D" />
    </linearGradient>
    <filter id="purpleGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="30" />
    </filter>
  </defs>

  <!-- Ambient Light -->
  <circle cx="256" cy="256" r="190" fill="#A855F7" opacity="0.25" filter="url(#softGlow)" />

  <!-- Base Rounded Container -->
  <rect x="48" y="48" width="416" height="416" rx="96" fill="url(#bgGrad)" stroke="#A855F7" stroke-width="4" stroke-opacity="0.6" />

  <!-- Outer Glow Ring -->
  <rect x="52" y="52" width="408" height="408" rx="92" fill="none" stroke="#C084FC" stroke-width="1.5" stroke-opacity="0.4" />

  <!-- Diagonal AI Precision Cut Beam -->
  <line x1="90" y1="422" x2="422" y2="90" stroke="#C084FC" stroke-width="8" stroke-linecap="round" opacity="0.5" filter="url(#purpleGlow)" />
  <line x1="90" y1="422" x2="422" y2="90" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />

  <!-- Aperture Circles -->
  <circle cx="160" cy="160" r="48" fill="#180C30" stroke="url(#purpleGrad)" stroke-width="8" />
  <circle cx="160" cy="160" r="22" fill="#8B5CF6" opacity="0.7" />

  <circle cx="352" cy="352" r="48" fill="#180C30" stroke="url(#purpleGrad)" stroke-width="8" />
  <circle cx="352" cy="352" r="22" fill="#A855F7" opacity="0.7" />

  <!-- Central Precision Cut Star Gem -->
  <g transform="translate(256, 256)" filter="url(#purpleGlow)">
    <path d="M 0,-95 Q 16,-20 85,-4 Q 20,16 0,85 Q -16,20 -85,4 Q -20,-16 0,-95 Z" fill="url(#purpleGrad)" />
    <path d="M 0,-70 Q 12,-14 62,-3 Q 14,12 0,62 Q -12,14 -62,3 Q -14,-12 0,-70 Z" fill="#FFFFFF" opacity="0.95" />
    <circle cx="0" cy="0" r="10" fill="#E9D5FF" />
  </g>
</svg>'''
    svg_path = r"C:\Users\Dako9\.gemini\antigravity\scratch\VioletCut-AI\assets\logo.svg"
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Saved {svg_path}")

if __name__ == "__main__":
    create_logo()
