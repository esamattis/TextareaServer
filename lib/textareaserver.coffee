
http = require "http"
exec = require('child_process').exec
fs = require "fs"
path = require "path"


io = require "socket.io"
cli = require( "cli")

DIR = path.join process.env['HOME'], ".textareaserver"


try
    stats = fs.realpathSync DIR
catch error
    fs.mkdirSync DIR,0777 

for file in fs.readdirSync DIR
    fs.unlink path.join DIR, file




cli.parse
    port: ['p', "Port to listen", "number", 32942 ]
    host: ['l', "Host to listen", "string", "127.0.0.1"]
    "editor-cmd": ['c', 'Editor to use. {file} will substituted with the file path. Use quotes.',
                        "string", "gedit {file}"]



server = http.createServer (req, res) ->
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end('<h1>Hello world</h1>')

socket = io.listen server, transports: ['websocket']



clients = {}



cleanUuid = (uuid) ->
    # Make sure that there are no funny characters
    uuid.replace(/[^a-zA-Z0-9_\-]/g, "")


actions =

    delete: (client, msg) ->

        for uuid in msg.uuids
            delete clients[uuid]
            console.log path.join DIR, uuid
            fs.unlink path.join DIR, uuid


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


exports.run = ->

    cli.main (args, options) ->
        actions.open =  (client, msg) ->

            clients[msg.uuid] = client

            file = path.join DIR, cleanUuid msg.uuid

            fs.writeFile file, msg.textarea, ->
                if msg.spawn

                    fileRegx = /\{ *file *\}/
                    editorCmd = options["editor-cmd"]

                    if !! editorCmd.match fileRegx
                        cmd = editorCmd.replace(fileRegx, file)
                    else
                        cmd = "#{editorCmd.trim()} #{file}"

                    console.log cmd

                    editor = exec cmd, (err, stdout, stderr) ->
                        fs.readFile (path.join DIR, cleanUuid (msg.uuid)), (err, data) ->
                            resmsg = 
                                textarea: data.toString()
                                uuid: cleanUuid (msg.uuid)
                            client.send JSON.stringify resmsg



        try
            server.listen options.port, options.host
            console.log "TextareaServer is running at #{options.host}:#{options.port}"
        catch error
            console.log "Could not start the server: #{ error.message }"
            process.exit 1


