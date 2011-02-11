


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



clients = {}


inotify.addWatch
    path: DIR
    watch_for: Inotify.IN_CLOSE_WRITE
    callback: (event) ->
        console.log event
        fs.readFile (path.join DIR, event.name), (err, data) ->

            msg =
                textarea: data.toString()
                uuid: event.name

            client = clients[event.name]
            client.send JSON.stringify msg


actions =

    delete: (client, msg) ->
        # also remove from clients
        console.log "we should delete " + msg.uuid

    delete_all: (client, msg) ->

    open: (client, msg) ->

        clients[msg.uuid] = client

        file = path.join DIR, msg.uuid

        console.log "getting form browser:"
        console.log msg

        fs.writeFile file, msg.textarea, ->
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
    server.listen options.port, options.host

