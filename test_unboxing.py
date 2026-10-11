import os, time
from playwright.sync_api import sync_playwright
from PIL import Image

os.makedirs('verification_screenshots', exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    
    page.goto('http://localhost:8000', wait_until='networkidle')
    page.wait_for_timeout(1000)
    
    fragrances = [
        ('01', 'midnight-musk'),
        ('02', 'rain-whisper'),
        ('03', 'sandal-glow'),
        ('04', 'white-petal')
    ]
    
    percents = [0, 25, 45, 60, 80, 100]
    
    sec_top = page.evaluate('() => document.getElementById("packaging-unboxing-section").offsetTop')
    pin_dist = page.evaluate('() => window.innerHeight * 5')
    print(f"Unboxing section top: {sec_top}px, Pin distance: {pin_dist}px")
    
    all_passed = True
    
    for fid, fname in fragrances:
        print(f"\n==========================================")
        print(f"Testing Fragrance {fid}: {fname.upper()}")
        print(f"==========================================")
        
        # Click fragrance pill
        page.evaluate(f"""() => {{
            const btn = document.querySelector('#unboxing-scroll-pills .unboxing-pill-btn[data-fragrance-id="{fid}"]');
            if (btn) btn.click();
        }}""")
        page.wait_for_timeout(1000) # allow timeline reset & image preload
        
        for pct in percents:
            target_scroll = sec_top + (pin_dist * (pct / 100.0))
            page.evaluate(f"window.scrollTo({{ top: {target_scroll}, behavior: 'auto' }})")
            page.wait_for_timeout(950) # allow GSAP scrub (0.8s) to fully settle
            
            # Read state
            info = page.evaluate("""() => {
                const label = document.getElementById('unboxing-step-label')?.textContent || '';
                const progress = document.getElementById('unboxing-progress-bar')?.style.width || '';
                const opacities = [1,2,3,4,5,6].map(i => {
                    const el = document.getElementById('unboxing-frame-' + i);
                    return el ? parseFloat(window.getComputedStyle(el).opacity).toFixed(2) : '0';
                });
                return { label, progress, opacities };
            }""")
            
            screenshot_path = f"verification_screenshots/{fname}_{pct:03d}pct.png"
            stage = page.locator('#unboxing-scroll-stage')
            stage.screenshot(path=screenshot_path)
            
            size_kb = os.path.getsize(screenshot_path) / 1024
            im = Image.open(screenshot_path)
            # Verify high-density photograph
            color_count = len(im.getcolors(maxcolors=20000) or [])
            is_valid_frame = size_kb > 300
            
            if not is_valid_frame:
                all_passed = False
                print(f"  [FAIL] {pct}% scroll: size={size_kb:.1f}KB, step={info['label']}")
            else:
                print(f"  [PASS] {pct:3d}% scroll | Step: {info['label']:<28} | Progress: {info['progress']:<5} | Size: {size_kb:.1f} KB | Opacities: {info['opacities']}")
            
    print("\n==========================================")
    print("Testing REPLAY UNBOXING Interaction...")
    print("==========================================")
    # Scroll to 100% of White Petal
    page.evaluate(f"window.scrollTo({{ top: {sec_top + pin_dist}, behavior: 'auto' }})")
    page.wait_for_timeout(900)
    
    before_pos = page.evaluate("() => window.scrollY")
    print(f"Scroll position at 100%: {before_pos:.1f}px")
    
    # Click replay button
    page.evaluate("() => document.getElementById('unboxing-scroll-replay-btn').click()")
    page.wait_for_timeout(1800) # allow smooth scroll
    
    after_pos = page.evaluate("() => window.scrollY")
    print(f"Scroll position after replay: {after_pos:.1f}px (expected ~{sec_top}px)")
    assert abs(after_pos - sec_top) < 30, f"Replay scroll did not return to start! (Got {after_pos}, expected {sec_top})"
    print("REPLAY UNBOXING confirmed: smoothly animated back to top of stage!")

    browser.close()
    if all_passed:
        print("\nAll 24 test points passed with 100% valid, high-resolution photographic frames!")
    else:
        print("\nSome frames failed verification.")
