const { app } = require('./app.js')

app.listen(process.env.PORT);

console.log('listening on port:', process.env.PORT);
