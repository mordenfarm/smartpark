from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3001/#/login")

    # Screenshot before interaction
    page.screenshot(path="jules-scratch/verification/login_page_before_interaction.png")

    # Login
    page.fill('[data-testid="email-input"]', "test@example.com")
    page.fill('input[id="password"]', "password")
    page.click('button[type="submit"]')
    page.wait_for_url("http://localhost:3001/#/admin")

    # Navigate back to the map to test search
    page.goto("http://localhost:3001/#/")
    page.wait_for_selector('input[placeholder="Search for a parking lot..."]')

    # Verify search functionality
    page.fill('input[placeholder="Search for a parking lot..."]', "Civic")
    page.screenshot(path="jules-scratch/verification/search.png")

    # Verify reservation functionality
    page.click('text=Civic Center Parking')
    page.click('text=View Bays')
    page.wait_for_selector('text=A1')
    page.click('text=A1')
    page.screenshot(path="jules-scratch/verification/reservation_modal.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)