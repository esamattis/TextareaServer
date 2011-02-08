


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


actions =

    delete: (client, msg) ->
        # also remove watches
        console.log "we should delete " + msg.uuid

    open: (client, msg) ->
        file = path.join DIR, msg.uuid
        console.log msg
        fs.open file, "w", (err, fd) ->
            fs.write fd, msg.textarea, msg.textarea.lenght, 0, ->
                fs.close fd, ->
                    inotify.addWatch 
                        path: DIR
                        watch_for: Inotify.IN_CLOSE_WRITE
                        callback: (event) ->
                            fs.readFile file, (err, data) ->
                                msg.textarea = data.toString()
                                client.send JSON.stringify msg
                    if msg.spawn
                        editor = exec msg.executable.replace(/\{file\}/, file)


socket.on 'connection', (client) ->
    client.on 'message', (msg) ->
        msg = JSON.parse msg

        action = actions[msg.action]
        if action
            action client, msg
        else
            console.log "Bad action " + msg.action
            



    client.on 'disconnect', ->
        console.log "browser disconnected"
