const express = require('express')
const app = express()
const port = 3000

app.use('/', express.static('./') )

app.get('/cars', (req, res) => {
  res.send({name: "Jason"})
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))