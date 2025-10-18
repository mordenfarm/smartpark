from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Go to login page
    page.goto("http://localhost:3000/#/login")

    # Login
    page.get_by_label("Email").fill("admin@example.com")
    page.get_by_label("Password").fill("123")
    page.locator("form").get_by_role("button", name="Login").click()
    page.wait_for_url("http://localhost:3000/#/")

    # Screenshot of home page with avatar
    page.screenshot(path="jules-scratch/verification/home_page_with_avatar.png")

    # Click on a slot to reserve (as a logged-in user)
    # Give time for map to load
    page.wait_for_timeout(5000)
    page.locator('.leaflet-marker-icon').first.click()
    page.get_by_role("button", name="View Bays").click()
    page.wait_for_timeout(2000)
    page.locator('.leaflet-marker-icon.green-slot-icon').first.click()

    # Check that reservation modal is visible
    page.locator("text=Reserve at").wait_for()
    page.screenshot(path="jules-scratch/verification/reservation_modal_for_logged_in_user.png")

    # Logout
    page.get_by_role("button", name="Logout").click()
    page.wait_for_url("http://localhost:3000/#/login")

    # Go back to home and try to reserve again (as logged-out user)
    page.goto("http://localhost:3000/#/")
    page.wait_for_timeout(5000)
    page.locator('.leaflet-marker-icon').first.click()
    page.get_by_role("button", name="View Bays").click()
    page.wait_for_timeout(2000)
    page.locator('.leaflet-marker-icon.green-slot-icon').first.click()

    # Verify redirection to login page
    page.wait_for_url("http://localhost:3000/#/login")
    page.screenshot(path="jules-scratch/verification/redirect_to_login.png")


    browser.close()

with sync_playwright() as playwright:
    run(playwright)