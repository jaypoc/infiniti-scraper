const puppeteer = require('puppeteer');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('cars.json');
const db = low(adapter);

db.defaults({ cars: [] }).write();

let carURL = 'http://www.bommaritoinfiniti.com/VehicleSearchResults?search=preowned&make=INFINITI&model=Q50&year=2018%2C2017';

(async () => {
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    try
      {    
        await page.setViewport({ width: 1920, height: 926 });
        await page.goto(carURL);
      }
    catch (exception)
     {
       console.log("Unable to connect.")
       
     }
    

    let carData = await page.evaluate(() => {
        let cars = [];
        let carsElements = document.querySelectorAll('[itemtype="http://schema.org/Car"]');
                
        carsElements.forEach((carelement) => {
            let carJson = {};
            try 
              {
                carJson.created       = new Date().toJSON();
                carJson.updated       = new Date().toJSON();
                carJson.year          = carelement.querySelector('[itemprop="vehicleModelDate"]').innerText;  
                carJson.config        = carelement.querySelector('[itemprop="vehicleConfiguration"]').innerText;  
                carJson.vin           = carelement.querySelector('[itemprop="vehicleIdentificationNumber"]').innerText;
                carJson.mileage     = carelement.querySelector('[template="vehicleIdentitySpecs-miles"]').querySelector('.value').innerText;
                carJson.exterior    = "Unknown"
                carJson.interior    = carelement.querySelector('[template="vehicleIdentitySpecs-interior"]').querySelector('.value').innerText;
                carJson.location    = carelement.querySelector('[template="vehicleIdentitySpecs-location"]').querySelector('.value').innerText;
                carJson.stocknumber = carelement.querySelector('[template="vehicleIdentitySpecs-stockNumber"]').querySelector('.value').innerText;
                carJson.imageurl     = carelement.querySelector('[itemprop="image"]').src;
                carJson.price_min    = parseInt(carelement.querySelector('[itemprop="price"]').innerText.replace(/[^0-9.]/g,'')); 
                carJson.price        = parseInt(carelement.querySelector('[itemprop="price"]').innerText.replace(/[^0-9.]/g,'')); 
                carJson.price_max    = parseInt(carelement.querySelector('[itemprop="price"]').innerText.replace(/[^0-9.]/g,''));
              } 
            catch (exception) 
              {

              }
            cars.push(carJson);
        });
    
        return cars;
    });
    

    carData.forEach( function(car)
      {
          let oldcar = db.get('cars').filter({vin: car.vin}).value()[0]
          if ( db.get('cars').find({vin: car.vin}).value() )
            {
                db.get('cars').find({vin: car.vin})
                  .assign({price_min: Math.min(car.price, oldcar.price_min)}) 
                  .assign({price_max: Math.max(car.price, oldcar.price_max)}) 
                  .assign({price: car.price}) 
                  .assign({updated: new Date()}) 
                  .write()
            } 
          else 
            {
                db.get('cars').push(car).write()            
            }
      }
    );
    
    await process.exit();
})()
