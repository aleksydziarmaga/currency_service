const axios = require('axios')
const express = require('express');
const CronJob = require('cron').CronJob;
const mongoose = require('mongoose');
const getTime = require('date-fns/get_time')
const Format = require('date-fns/format');

const DATABASE = 'mongodb:/admin:nimda1234@ds129914.mlab.com:29914/currency-service';

mongoose.connect(DATABASE);
mongoose.Promise = global.Promise;
mongoose.connection
    .on('connected', () => {
    console.log(`Mongoose connection open on ${DATABASE}`);
    })
    .on('error', (err) => {
    console.log(`Connection error: ${err.message}`);
    });

const schema = new mongoose.Schema({
    date: {
        type: String,
        trim: true
    },
    time: {
        type: String,
        trim: true
    },
    value: {
        type: Number
    }
});

const Rsi = mongoose.model('RSI', schema);
const Stoch = mongoose.model('STOCH', schema);
const StochF = mongoose.model('STOCHF', schema);
const Forex = mongoose.model('Forex', schema);

const CURRENCIES = require('./currencies.model');

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => res.send("Currency service"));

app.get('/FOREX', async(req, res) => {
    try {
        const data = await Forex.find()
        res.json(data);
    } catch (err) {
        console.error(err);
        res.send(err);
    }
});

app.get('/RSI', async(req, res) => {
    try {
        const data = await Rsi.find()
        res.json(data);
    } catch (err) {
        console.error(err);
        res.send(err);
    }
});

app.get('/STOCH', async(req, res) => {
    try {
        const data = await Stoch.find()
        res.json(data);
    } catch (err) {
        console.error(err);
        res.send(err);
    }
})

app.get('/STOCHF', async(req, res) => {
    try {
        const data = await StochF.find()
        res.json(data);
    } catch (err) {
        console.error(err);
        res.send(err);
    }
})

const RSIjob = new CronJob('0 0,12,24,36,48 * * * *', async() => {
	try {
        const response = await axios("https://www.alphavantage.co/query?function=RSI&symbol=PLNUSD&interval=daily&time_period=14&series_type=close&apikey=J5FKODPQMN1BVTU5");
        const data = response.data["Technical Analysis: RSI"];
        const currentRsiDate = (Object.keys(data))[0];
        const currentRsiValue = data[currentRsiDate]
        const currentDate = new Date();
        const currentTime = Format(currentDate, [format='HH:mm:ss']);
        const object = {
            date: currentRsiDate,
            time: currentTime,
            value: currentRsiValue.RSI
        };
        const rsi = new Rsi(object);
        rsi.save()
            .then(() => { console.log('Thank you for your registration!'); })
            .catch((err) => { console.log(err); });
    } catch(err) {
        console.error(err);
    };
});

const STOCHjob = new CronJob('0 5,17,29,41,53 * * * *', async() => {
	try {
        const response = await axios("https://www.alphavantage.co/query?function=STOCH&symbol=PLNUSD&interval=daily&time_period=14&series_type=close&apikey=J5FKODPQMN1BVTU5");
        const data = response.data["Technical Analysis: STOCH"];
        const currentRsiDate = (Object.keys(data))[0];
        const currentRsiValue = data[currentRsiDate]
        const currentDate = new Date();
        const currentTime = Format(currentDate, [format='HH:mm:ss']);
        const object = {
            date: currentRsiDate,
            time: currentTime,
            value: currentRsiValue.SlowD
        };
        const rsi = new Stoch(object);
        rsi.save()
            .then(() => { console.log('Thank you for your registration!'); })
            .catch((err) => { console.log(err); });
    } catch(err) {
        console.error(err);
    };
});

const STOCHFjob = new CronJob('0 10,22,34,46,58 * * * *', async() => {
	try {
        const response = await axios("https://www.alphavantage.co/query?function=STOCHF&symbol=PLNUSD&interval=daily&time_period=14&series_type=close&apikey=J5FKODPQMN1BVTU5");
        const data = response.data["Technical Analysis: STOCHF"];
        const currentRsiDate = (Object.keys(data))[0];
        const currentRsiValue = data[currentRsiDate]
        const currentDate = new Date();
        const currentTime = Format(currentDate, [format='HH:mm:ss']);
        const object = {
            date: currentRsiDate,
            time: currentTime,
            value: currentRsiValue.FastD
        };
        const rsi = new StochF(object);
        rsi.save()
            .then(() => { console.log('Thank you for your registration!'); })
            .catch((err) => { console.log(err); });
    } catch(err) {
        console.error(err);
    };
});

const CurrencyJob = new CronJob('0 3,15,27,39,51 * * * *', async() => {
	try {
        const response = await axios("https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=PLN&to_currency=USD&apikey=J5FKODPQMN1BVTU5");
        const data = response.data["Realtime Currency Exchange Rate"];
        const currentRsiDate = (Object.keys(data))[0];
        const currentRsiValue = data["5. Exchange Rate"]
        const currentDate = new Date();
        const currentTime = Format(currentDate, [format='HH:mm:ss']);
        const object = {
            date: currentRsiDate,
            time: currentTime,
            value: currentRsiValue
        };
        const rsi = new Forex(object);
        rsi.save()
            .then(() => { console.log('Thank you for your registration!'); })
            .catch((err) => { console.log(err); });
    } catch(err) {
        console.error(err);
    };
});

console.log('After job instantiation');
RSIjob.start();
STOCHjob.start();
STOCHFjob.start();
CurrencyJob.start();

app.listen(PORT, () => console.log(`Currency service listening on port http://localhost:${PORT}`));