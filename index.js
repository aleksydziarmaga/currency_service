const express = require('express');
const app = express();

const PORT = 8080;

app.get('/', (req, res) => res.send("Currency service"));

app.listen(PORT, () => console.log(`Currency service listening on port http://localhost:${PORT}`));