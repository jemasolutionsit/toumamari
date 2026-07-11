import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/antoi/.gemini/antigravity-ide/brain/d11fc74d-f3cd-47fd-afa0-72062becede8';

async function runAudit() {
  console.log('Launching browser...');
  
  // Detect pre-installed system browsers on Windows as a robust alternative
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  
  let executablePath = undefined;
  if (fs.existsSync(edgePath)) {
    console.log('Using pre-installed Microsoft Edge at:', edgePath);
    executablePath = edgePath;
  } else if (fs.existsSync(chromePath)) {
    console.log('Using pre-installed Google Chrome at:', chromePath);
    executablePath = chromePath;
  } else {
    console.log('Using default downloaded Chromium');
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    console.log('Opening http://localhost:3000/ ...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });

    // Find the gallery teaser section
    console.log('Looking for gallery teaser section...');
    const teaserSelector = '#galeria';
    await page.waitForSelector(teaserSelector);

    // Scroll to the gallery teaser section
    await page.evaluate((selector) => {
      const el = document.querySelector(selector);
      if (el) el.scrollIntoView({ block: 'center' });
    }, teaserSelector);

    // Wait a brief moment for scroll and animations
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Analyze the teaser image grid computed styles
    const teaserAnalysis = await page.evaluate(() => {
      const section = document.querySelector('#galeria');
      if (!section) return { error: 'Section #galeria not found' };

      const grid = section.querySelector('.grid');
      if (!grid) return { error: 'Teaser grid not found' };

      const gridStyle = window.getComputedStyle(grid);
      const images = Array.from(grid.querySelectorAll('img'));
      const imgContainers = Array.from(grid.children);

      const imagesDetails = [];
      for (let i = 0; i < Math.min(images.length, imgContainers.length); i++) {
        const img = images[i];
        const container = imgContainers[i];
        if (img && container) {
          const style = window.getComputedStyle(img);
          imagesDetails.push({
            index: i,
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            width: img.offsetWidth,
            height: img.offsetHeight,
            objectFit: style.objectFit,
            containerClasses: container.className,
            containerWidth: container.offsetWidth,
            containerHeight: container.offsetHeight,
            margin: style.margin,
            padding: style.padding,
          });
        }
      }

      return {
        display: gridStyle.display,
        gridTemplateColumns: gridStyle.gridTemplateColumns,
        gap: gridStyle.gap,
        rowGap: gridStyle.rowGap,
        columnGap: gridStyle.columnGap,
        padding: gridStyle.padding,
        margin: gridStyle.margin,
        images: imagesDetails
      };
    });

    console.log('\n--- TEASER GALLERY AUDIT ---');
    console.log(JSON.stringify(teaserAnalysis, null, 2));

    // Capture screenshot of the teaser section
    const teaserPath = path.join(ARTIFACT_DIR, 'teaser_gallery.png');
    console.log(`Taking screenshot of teaser gallery to: ${teaserPath}`);
    const teaserEl = await page.$(teaserSelector);
    if (teaserEl) {
      await teaserEl.screenshot({ path: teaserPath });
    } else {
      await page.screenshot({ path: teaserPath, fullPage: false });
    }

    // Go to full gallery page
    console.log('\nNavigating to http://localhost:3000/galeria ...');
    await page.goto('http://localhost:3000/galeria', { waitUntil: 'networkidle2' });

    // Wait for the gallery grid
    console.log('Looking for main gallery grid...');
    const galleryGridSelector = 'main .grid';
    await page.waitForSelector(galleryGridSelector);

    // Scroll slightly to view elements
    await page.evaluate((selector) => {
      const el = document.querySelector(selector);
      if (el) el.scrollIntoView({ block: 'center' });
    }, galleryGridSelector);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Analyze the full gallery grid computed styles
    const fullGalleryAnalysis = await page.evaluate(() => {
      const grid = document.querySelector('main .grid');
      if (!grid) return { error: 'Full gallery grid not found' };

      const gridStyle = window.getComputedStyle(grid);
      const images = Array.from(grid.querySelectorAll('img'));
      const imgContainers = Array.from(grid.children);

      const imagesDetails = [];
      for (let i = 0; i < Math.min(images.length, imgContainers.length); i++) {
        const img = images[i];
        const container = imgContainers[i];
        if (img && container) {
          const style = window.getComputedStyle(img);
          imagesDetails.push({
            index: i,
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            width: img.offsetWidth,
            height: img.offsetHeight,
            objectFit: style.objectFit,
            containerClasses: container.className,
            containerWidth: container.offsetWidth,
            containerHeight: container.offsetHeight,
            margin: style.margin,
            padding: style.padding,
          });
        }
      }

      return {
        display: gridStyle.display,
        gridTemplateColumns: gridStyle.gridTemplateColumns,
        gap: gridStyle.gap,
        rowGap: gridStyle.rowGap,
        columnGap: gridStyle.columnGap,
        padding: gridStyle.padding,
        margin: gridStyle.margin,
        imagesCount: imagesDetails.length,
        firstFewImages: imagesDetails.slice(0, 4)
      };
    });

    console.log('\n--- FULL GALLERY AUDIT ---');
    console.log(JSON.stringify(fullGalleryAnalysis, null, 2));

    // Capture screenshot of the full gallery grid
    const fullGalleryPath = path.join(ARTIFACT_DIR, 'full_gallery.png');
    console.log(`Taking screenshot of full gallery to: ${fullGalleryPath}`);
    await page.screenshot({ path: fullGalleryPath, fullPage: true });

    // Save logs of findings to a JSON file
    const logData = {
      timestamp: new Date().toISOString(),
      teaser: teaserAnalysis,
      fullGallery: fullGalleryAnalysis
    };
    fs.writeFileSync(
      path.join(ARTIFACT_DIR, 'audit_results.json'),
      JSON.stringify(logData, null, 2),
      'utf-8'
    );
    console.log('\nAudit data successfully written to audit_results.json.');

  } catch (error) {
    console.error('Error during audit:', error);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

runAudit();
