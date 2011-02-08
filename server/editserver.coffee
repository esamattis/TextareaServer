


http = require "http"
exec = require('child_process').exec
io = require "socket.io"
temp = require "temp"
fs = require "fs"
path = require "path"
Inotify = require('inotify').Inotify

DIR = path.join process.env['HOME'], ".externaledits"



server = http.createServer (req, res) ->
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end('<h1>Hello world</h1>')

server.listen 8000


inotify = new Inotify()

socket = io.listen server

now = ->
    (new Date().getTime())

socket.on 'connection', (client) ->
    client.on 'message', (msg) ->



        obj = JSON.parse msg
        file = path.join DIR, obj.uuid

        console.log obj

        fs.open file, "w", (err, fd) ->
            fs.write fd, obj.textarea, obj.textarea.lenght, 0, ->
                fs.close fd, ->
                    inotify.addWatch 
                        path: DIR
                        watch_for: Inotify.IN_CLOSE_WRITE
                        callback: (event) ->
                            fs.readFile file, (err, data) ->
                                obj.textarea = data.toString()
                                client.send JSON.stringify obj
                    if obj.spawn
                        editor = exec obj.executable + " " + file
            



    client.on 'disconnect', ->
        console.log "browser disconnected"
