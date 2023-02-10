const puppeteer = require('puppeteer');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('cars.json');
const db = low(adapter);

db.defaults({ cars: [] }).write();

let carURLbase = 'https://www.bommaritoinfiniti.com';
let carURL = `${carURLbase}/used-cars-ellisville-mo.html?Make=Infiniti&year=2019`;

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
        let carsElements = document.querySelectorAll('.srpVehicle');
        carsElements.forEach((carelement) => {
            let carJson = {};
            try 
              {
                carJson.created     = new Date().toJSON();
                carJson.updated     = new Date().toJSON();
                carJson.make        = carelement.dataset.make
                carJson.model       = carelement.dataset.model
                carJson.vin         = carelement.dataset.vin
                carJson.year        = carelement.dataset.year
                carJson.price       = carelement.dataset.price
                carJson.msrp        = carelement.dataset.msrp
                carJson.config      = carelement.dataset.trim
                carJson.exterior    = carelement.dataset.extcolor
                carJson.interior    = carelement.dataset.intcolor
                carJson.engine      = carelement.dataset.engine
                carJson.stocknumber = carelement.dataset.stocknum
                carJson.price_min   = carelement.dataset.price
                carJson.price       = carelement.dataset.price
                carJson.price_max   = carelement.dataset.price
                carJson.imageurl    = carelement.querySelector('.vehicleImg').dataset.img;
                carJson.mileage     = carelement.querySelector('.mileageDisplay').innerText.replace(/[^0-9]/g, '');
              } 
            catch (exception) 
              {
                console.log("exception")
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
