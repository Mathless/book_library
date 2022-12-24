const express = require('express');
const path = require('path');
const app = express();

app.use(express.json()); // Обработка параметров в body
// Set views path
app.set('views', path.join(__dirname, 'views'));
// Set public path
app.use(express.static(path.join(__dirname, 'public')));
// Set pug as view engine
app.set('view engine', 'pug');
const routes = require('./router');
app.use('/', routes);
app.listen(3000, () => {
  console.log('Server started at http://localhost:3000');
});
