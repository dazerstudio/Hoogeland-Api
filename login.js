import puppeteer from "puppeteer"
import { exec } from "node:child_process"
import { promisify } from "node:util"

export default async function handler(req, res) {
  const body = req.body;

  if(body.username == null || body.password == null) {
    res.status(400).json({ error: 'Incorrecte inlog gegevens', success: false })
    return
  }
  
  const { stdout: chromiumPath } = await promisify(exec)("which chromium")

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: chromiumPath.trim()
  });

  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();

  await page.goto("https://isw.magister.net")

  try {
    await page.waitForSelector('#username', { timeout: 3000 });
  } catch (err) {
    console.log('Page timout')
    await browser.close()
    res.status(500).json({ error: 'Server Fout, Probeer het opnieuw', success: false })
    return
  }
  await page.type('#username', body.username)

  await page.click('#username_submit')

  try {
    await page.waitForSelector('#password', { timeout: 500 });
  } catch (err) {
    console.log('Username timout')
    await browser.close()
    res.status(400).json({ error: 'Incorrecte inlog gegevens', success: false })
    return
  }
  await page.type('#password', body.password)

  await page.click('#password_submit')
  try {
    await page.waitForNavigation({ timeout: 1500 })
  } catch (err) {
    console.log('Password timout')
    await browser.close()
    res.status(400).json({ error: 'Incorrecte inlog gegevens', success: false})
    return
  }
  await browser.close()

  res.status(200).json({ error: '', success: true })

  console.log('Logged someone in!')
}