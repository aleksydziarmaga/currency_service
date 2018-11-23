const axios = require('axios')
const express = require('express');

const CURRENCIES = require('./currencies.model');

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => res.send("Currency service"));

app.get('/currencies/:baseCurrency', async(req, res) => {
    const baseCurrency = req.params.baseCurrency;
    const requests = CURRENCIES.filter( currency => currency !== baseCurrency)
                                .map( currency => axios(`http://api.nbp.pl/api/exchangerates/rates/c/${currency}?format=json`));
    try {
        const response = await Promise.all(requests);
        const data = response.map(({ data }) => data);
        res.json(data);
    } catch (err) {
        console.error(err);
        res.send(err);
    }
});

app.get('/rsi', async(req, res) => {
    const DAYS = 24;
    try {
        const { data } = await axios('http://api.nbp.pl/api/exchangerates/rates/a/USD/2018-10-01/2018-11-06/?format=json');
        const midRates = data.rates.map( ({mid}) => mid);
        const losses = [];
        const gains = [];
        let sumGains = 0;
        let sumLosses = 0;
        for (let i = 0; i < midRates.length - 1; i++) {
            const change = midRates[i+1] - midRates[i];
            if (change > 0) {
                gains.push(change);
                sumGains += change;
            } else if (change < 0) {
                losses.push(change);
                sumLosses += change * -1;
            }
        }
        const avgGains = sumGains/midRates.length;
        const avgLosses = sumLosses/midRates.length;
        const rs = avgGains/avgLosses;
        const rsi = 100 - (100/(1+rs));
        const json = {
            rsi: rsi,
        }
        res.json(rsi);

    } catch(err) {
        console.error(err);
        res.send(err);
    }
});

app.listen(PORT, () => console.log(`Currency service listening on port http://localhost:${PORT}`));