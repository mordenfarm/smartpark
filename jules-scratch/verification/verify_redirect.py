from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Go to home page
    page.goto("http://localhost:3000/#/")

    # Wait for map to load
    page.wait_for_timeout(5000)

    # Take a screenshot of the initial home page (logged out)
    page.screenshot(path="jules-scratch/verification/home_page_logged_out.png")

    # Click on the last lot marker, which is less likely to be under the header
    page.locator('.leaflet-marker-icon').last.click()

    # Wait for the detail panel to be visible
    page.locator(".parking-lot-detail.open").wait_for(state="visible")

    page.get_by_role("button", name="View Bays").click()
    page.wait_for_timeout(2000)
    page.locator('.leaflet-marker-icon.green-slot-icon').first.click()

    # Verify redirection to login page
    page.wait_for_url("http://localhost:3000/#/login")
    page.screenshot(path="jules-scratch/verification/redirect_to_login_on_reserve.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)