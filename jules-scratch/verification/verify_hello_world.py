from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3001/")
    page.wait_for_selector("text=Hello World")
    page.screenshot(path="jules-scratch/verification/hello_world.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)