const axios = require('axios')
const express = require('express');

const CURRENCIES = require('./currencies.model');

const app = express();
const PORT = 8080;

app.get('/', (req, res) => res.send("Currency service"));

app.get('/currencies/:baseCurrency', async(req, res) => {
    const baseCurrency = req.params.baseCurrency;
    const requests = CURRENCIES.filter( currency => currency !== baseCurrency)
                                .map( currency => axios(`http://api.nbp.pl/api/exchangerates/rates/c/${currency}?format=json`));
    try {
        const response = await Promise.all(requests);
        const data = response.map(({data}) => data);
        res.json(data);
    } catch (err) {
        console.error(err);
        res.send(err);
    }
})

app.listen(PORT, () => console.log(`Currency service listening on port http://localhost:${PORT}`));