# Infiniti Scraper

This was a quick script I created to monitor a local Infiniti dealer's inventory so I could watch availability and price changes on their website. 

## To Use

Run app.js to scrape the website and add vehicles to the ```cars.json``` file. To capture changes, schedule to run every 30-60 minutes, so as the dealership updates their inventory, your data file will refresh as well.

```bash
node app.js
```

Serve the index.html file (or open it locally). Reload to see the latest data. 

## Notes

* The VIN is used as the identity key for the vehicle.
* Only the price information is updated once a car is loaded..
* My dealership's website has undergone multiple changes, so the API needs to change. Fortunately, so far only the URL and the cell referenced have changed. (And actually got easier to scrape!)


