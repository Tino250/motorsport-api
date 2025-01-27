import puppeteer from "puppeteer";
import fs from "fs/promises";

import dotenv from "dotenv"
dotenv.config()
const scraperApiKey =process.env.API_KEY;


const getQuotes = async () => {
  // Start Puppeteer with ScraperAPI proxy
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      // Configure the proxy server using ScraperAPI's endpoint
      `http://scraperapi:${scraperApiKey}@proxy-server.scraperapi.com:8001`
    ],
  });

  // Open new pages and put the scrappign logic inside the for loop becasue you have multiple pages 
  //so for each page the program is going to write its data instead of skipping an url
  const page = await browser.newPage();
  let teams_link=[
    "oscar-piastri",
    "lando-norris",
    "charles-leclerc",
    "lewis-hamilton",
    "max-verstappen",
    "liam-lawson",
    "george-russell",
    "kimi-antonelli",
    "lance-stroll",
    "fernando-alonso",
    "pierre-gasly",
    "jack-doohan",
    "isack-hadjar",
    "yuki-tsunoda",
    "esteban-ocon",
    "oliver-bearman",
    "alexander-albon",
    "carlos-sainz",
    "nico-hulkenberg",
    "gabriel-bortoleto",
  ]
  let allData={}
  // Navigate to the target URL
  for(let team of teams_link){
    // Create a new page for each team
    await browser.newPage();
    await page.goto(`https://www.formula1.com/en/drivers/${team}`, {
    waitUntil: "domcontentloaded",
    })

    
    const teamData = await page.evaluate(() => {
      const quoteList = document.querySelectorAll(".grid");
      const teamsAndDrivers = {};
    
      // Iterate through each team
      Array.from(quoteList).forEach((quote) => {
        // Get the team name (assuming it's inside .f1-heading)
        const team =Array.from(quote.querySelectorAll("dt")).map((el)=>el.innerText.trim());
        
        // Get the drivers (assuming they're inside .f1-text)
        const drivers = Array.from(quote.querySelectorAll("dd"))
          .map((el) => el.innerText.trim());
    
        // Assign the team name as the key and the drivers as the value
        
        for(let i=0;i<team.length;i++){  
          teamsAndDrivers[team[i]]=drivers[i]
        }
      });
    
      return teamsAndDrivers;
    });
    
    allData[team]=teamData
    // Log the structured data
    console.log(teamData);
  }
    
 
  // Scrape data from the page
  
  // Write the data to a file
  try {
    await fs.writeFile("F1_drivers.json", JSON.stringify(allData, null, 2)); // printin JSON in a parsed manner
     console.log("Data successfully written to disk");
  } catch (error) {
    console.log("Something went wrong while writing data", error);
  }

  // Close the browser
  await browser.close();
};

// Start the scraping
getQuotes();
