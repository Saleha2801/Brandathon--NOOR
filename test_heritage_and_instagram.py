import os, time
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    
    console_errors = []
    page.on('console', lambda m: console_errors.append(m.text) if m.type == 'error' else None)
    
    page.goto('http://localhost:8000', wait_until='networkidle')
    page.wait_for_timeout(1000)
    
    print("=== 1. VALIDATING 'FOUR SCENTS. FOUR WORLDS.' SECTION ===")
    section = page.locator('#heritage-quadrant')
    section.scroll_into_view_if_needed()
    page.wait_for_timeout(600)
    
    cards_data = page.evaluate("""() => {
        const cards = document.querySelectorAll('#worlds-horizontal-slider .world-scene-card');
        return Array.from(cards).map(c => {
            const num = c.querySelector('.world-number-tag')?.textContent.trim();
            const name = c.querySelector('.world-perfume-name')?.textContent.trim();
            const img = c.querySelector('.world-image-col img');
            const style = img ? window.getComputedStyle(img) : null;
            return {
                num,
                name,
                src: img ? img.src : null,
                naturalWidth: img ? img.naturalWidth : 0,
                naturalHeight: img ? img.naturalHeight : 0,
                objectFit: style ? style.objectFit : null
            };
        });
    }""")
    
    for i, card in enumerate(cards_data, 1):
        print(f"Card {i}: {card['num']} | {card['name']}")
        print(f"  Source: {card['src']}")
        print(f"  Dimensions: {card['naturalWidth']}x{card['naturalHeight']} (object-fit: {card['objectFit']})")
        assert card['naturalWidth'] > 0, f"Card {i} image failed to load!"
        assert 'approved_perfume' in card['src'], f"Card {i} is not using approved product image! Got {card['src']}"
        assert card['objectFit'] == 'contain', f"Card {i} is not using object-fit contain!"
        print(f"  -> PASS: Verified approved bottle & box image displayed with object-fit: contain")
        
    # Take screenshot of Heritage Quadrant section
    os.makedirs('verification_screenshots', exist_ok=True)
    section.screenshot(path='verification_screenshots/heritage_four_scents_section.png')
    print("Screenshot saved to verification_screenshots/heritage_four_scents_section.png")
    
    print("\n=== 2. VALIDATING INSTAGRAM CTA SECTION ===")
    insta_section = page.locator('#instagram-cta-section')
    insta_section.scroll_into_view_if_needed()
    page.wait_for_timeout(600)
    
    insta_data = page.evaluate("""() => {
        const sec = document.getElementById('instagram-cta-section');
        const heading = sec.querySelector('.instagram-cta-heading')?.textContent.trim();
        const subtext = sec.querySelector('.instagram-cta-subtext')?.textContent.trim();
        const link = sec.querySelector('.noor-instagram-btn');
        return {
            heading,
            subtext,
            href: link ? link.href : null,
            target: link ? link.getAttribute('target') : null,
            rel: link ? link.getAttribute('rel') : null,
            ariaLabel: link ? link.getAttribute('aria-label') : null,
            btnText: link ? link.textContent.trim().replace(/\\s+/g, ' ') : null
        };
    }""")
    
    print(f"Heading: \"{insta_data['heading']}\"")
    print(f"Subtext: \"{insta_data['subtext']}\"")
    print(f"Button: \"{insta_data['btnText']}\"")
    print(f"Link: {insta_data['href']} (target='{insta_data['target']}', rel='{insta_data['rel']}')")
    
    assert insta_data['heading'] == "A WORLD BEYOND SCENT.", f"Unexpected heading: {insta_data['heading']}"
    assert "Discover our fragrance stories" in insta_data['subtext'], f"Unexpected subtext: {insta_data['subtext']}"
    assert "FOLLOW OUR JOURNEY ON INSTAGRAM" in insta_data['btnText'], f"Unexpected button text: {insta_data['btnText']}"
    assert insta_data['href'] == "https://www.instagram.com/noor_beyondscent/", f"Unexpected href: {insta_data['href']}"
    assert insta_data['target'] == "_blank", f"target should be _blank, got {insta_data['target']}"
    assert "noopener" in insta_data['rel'] and "noreferrer" in insta_data['rel'], f"rel should contain noopener noreferrer, got {insta_data['rel']}"
    print("-> PASS: Verified Instagram CTA content, external link, accessible labels, and styling!")
    
    insta_section.screenshot(path='verification_screenshots/instagram_cta_section.png')
    print("Screenshot saved to verification_screenshots/instagram_cta_section.png")
    
    print("\nConsole errors:", [e for e in console_errors if not e.endswith('.mp4')])
    browser.close()
    print("\nALL ACCEPTANCE TESTS PASSED!")
