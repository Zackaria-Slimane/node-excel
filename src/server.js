
const http = require('http')
const app = require('./app/app')
const server = http.createServer(app)

server.listen('8005','127.0.0.1', function(){
    console.log('server started on: 127.0.0.1:8005')
})
