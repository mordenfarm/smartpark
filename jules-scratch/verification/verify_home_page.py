from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:3000")

    # Wait for the map to be visible
    map_element = page.locator(".leaflet-container")
    expect(map_element).to_be_visible(timeout=10000)

    # Click the button to show the notification
    notification_button = page.locator("button:has-text('Show Test Notification')")
    notification_button.click()

    # Wait for the notification to be visible
    notification_element = page.locator(".reservation-notification")
    expect(notification_element).to_be_visible()

    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)