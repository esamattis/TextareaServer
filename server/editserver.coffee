


http = require "http"
exec = require('child_process').exec
fs = require "fs"
path = require "path"

io = require "socket.io"
cli = require( "cli").enable 'daemon'
Inotify = require('inotify').Inotify

DIR = path.join process.env['HOME'], ".externaledits"

cli.parse
    port: ['p', "Port to listen", "number", 8000 ]
    host: ['l', "Host to listen", "string", "127.0.0.1"]


inotify = new Inotify()
server = http.createServer (req, res) ->
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end('<h1>Hello world</h1>')

socket = io.listen server


actions =

    delete: (client, msg) ->
        # also remove watches
        console.log "we should delete " + msg.uuid

    delete_all: (client, msg) ->

    open: (client, msg) ->
        file = path.join DIR, msg.uuid
        console.log msg
        fs.writeFile file, msg.textarea, ->
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


cli.main (args, options) ->
    console.log "main"
    server.listen options.port, options.host
