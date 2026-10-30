from PIL import Image, ImageDraw, ImageFilter

def create_logo():
    size = 512
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Subtle ambient glow
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.rounded_rectangle([64, 64, 448, 448], radius=110, fill=(139, 92, 246, 80))
    glow = glow.filter(ImageFilter.GaussianBlur(28))
    img.paste(glow, (0, 0), glow)

    # Main squircle container
    margin = 44
    card = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    card_draw = ImageDraw.Draw(card)
    card_draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=104,
        fill=(17, 12, 29, 255),
        outline=(139, 92, 246, 230),
        width=6
    )
    img.paste(card, (0, 0), card)

    # Minimalist overlapping geometric layers representing background removal:
    # Back layer (muted purple outline / translucent)
    draw.rounded_rectangle(
        [136, 136, 320, 320],
        radius=42,
        fill=(109, 40, 217, 70),
        outline=(167, 139, 250, 140),
        width=6
    )

    # Foreground cutout layer (solid vibrant violet + crisp white inner accent)
    draw.rounded_rectangle(
        [192, 192, 376, 376],
        radius=42,
        fill=(139, 92, 246, 255),
        outline=(237, 233, 254, 255),
        width=6
    )

    # Diagonal subtraction slice
    draw.line([(140, 372), (372, 140)], fill=(245, 243, 255, 255), width=10)

    png_path = r"C:\Users\Dako9\.gemini\antigravity\scratch\Removo\assets\logo.png"
    img.save(png_path, "PNG")

    ico_path = r"C:\Users\Dako9\.gemini\antigravity\scratch\Removo\assets\app.ico"
    img.save(ico_path, format="ICO", sizes=[(16,16), (24,24), (32,32), (48,48), (64,64), (128,128), (256,256)])

    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="removoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A855F7" />
      <stop offset="100%" stop-color="#6D28D9" />
    </linearGradient>
    <linearGradient id="bgDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#170F26" />
      <stop offset="100%" stop-color="#0D0816" />
    </linearGradient>
  </defs>

  <!-- Squircle Base -->
  <rect x="44" y="44" width="424" height="424" rx="104" fill="url(#bgDark)" stroke="#8B5CF6" stroke-width="8" stroke-opacity="0.75" />

  <!-- Back Layer (Removed Background Representation) -->
  <rect x="132" y="132" width="188" height="188" rx="42" fill="#6D28D9" fill-opacity="0.25" stroke="#A78BFA" stroke-width="8" stroke-dasharray="18 12" />

  <!-- Foreground Layer (Extracted Subject Representation) -->
  <rect x="192" y="192" width="188" height="188" rx="42" fill="url(#removoGrad)" stroke="#F5F3FF" stroke-width="8" />

  <!-- Precision Cut Line -->
  <line x1="136" y1="376" x2="376" y2="136" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" />
</svg>'''
    svg_path = r"C:\Users\Dako9\.gemini\antigravity\scratch\Removo\assets\logo.svg"
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print("Removo assets generated successfully.")

if __name__ == "__main__":
    create_logo()
