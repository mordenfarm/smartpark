from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # 1. Login
        page.goto("http://localhost:3000/#/login")
        page.screenshot(path="jules-scratch/verification/login_page_debug.png")
        page.get_by_label("Email").fill("testuser@example.com")
        page.get_by_label("Password").fill("password123")
        page.get_by_role("button", name="Login").click()
        expect(page).to_have_url("http://localhost:3000/#/")

        # 2. Profile Page
        page.goto("http://localhost:3000/#/profile")
        expect(page.get_by_role("heading", name="Profile")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/profile_page.png")

        # 3. Settings Page
        page.goto("http://localhost:3000/#/settings")
        expect(page.get_by_role("heading", name="Settings")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/settings_page.png")

        # 4. Notifications Page
        page.goto("http://localhost:3000/#/notifications")
        expect(page.get_by_role("heading", name="Notifications")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/notifications_page.png")

        # 5. Header Dropdown
        page.goto("http://localhost:3000/#/")
        page.locator(".avatar").click()
        expect(page.get_by_role("link", name="Settings")).to_be_visible()
        page.screenshot(path="jules-scratch/verification/header_dropdown.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)