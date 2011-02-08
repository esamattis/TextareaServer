

SETTINGS =
    hostname: "localhost"
    port: 8000
    editor_cmd: "gedit {file}"



socket = null
ports = {}


loadSocketIO = ->
    clearTimeout loadSocketIO.timer
    console.log "trying to get io"
    if not window.io
        jQuery.getScript "http://#{ SETTINGS.hostname }:#{ SETTINGS.port }/socket.io/socket.io.js", ->
            createSocket()
            clearTimeout loadSocketIO.timer

        # TODO: Real error handling with real ajax calls
        loadSocketIO.timer = setTimeout loadSocketIO, 500
    else
        console.log "we aleready have io"


createSocket = ->

    if createSocket.ran
        return

    socket = new io.Socket SETTINGS.hostname, port: SETTINGS.port
    initBridge()

    socket.on "disconnect", reConnect
    socket.on "connect", ->
        console.log "stopping connection poller"
        clearTimeout reConnect.timer

    socket.connect()

    createSocket.ran = true



reConnect = ->
    
    console.log "polling for connection status: #{ socket.connected }"

    if not socket.connected
        socket.connect()
    
    clearTimeout reConnect.timer
    # Retry
    reConnect.timer = setTimeout reConnect, 2000



initBridge = ->

    socket.on "message", (msg) ->
        obj = JSON.parse msg
        console.log "getting from editor"
        console.log obj
        port = ports[obj.uuid]
        port.postMessage obj


    chrome.extension.onConnect.addListener (port) ->
        if port.name isnt "textareapipe"
            return


        port.onMessage.addListener (msg)  ->


            ports[msg.uuid] = port
            msg.executable = SETTINGS.editor_cmd
            msg.type = msg.type or "txt"

            socket.send JSON.stringify msg


loadSocketIO()

