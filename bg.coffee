

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




showTempNotification = (msg) ->

    notification = webkitNotifications.createNotification "icon.png", 'Hello!', msg

    notification.show()
    setTimeout ->
        notification.cancel()
    , 5000

createSocket = ->

    if createSocket.ran
        return

    socket = new io.Socket SETTINGS.hostname, port: SETTINGS.port

    socket.on "message", (msg) ->
        obj = JSON.parse msg
        port = ports[obj.uuid]
        port.postMessage obj


    socket.on "connect", ->
        console.log "stopping connection poller"
        clearTimeout reConnect.timer
        showTempNotification "Connected to TextAreaServer at #{ socket.transport.socket.URL }"

    socket.on "disconnect", ->
        showTempNotification "Disconnected from TextAreaServer at #{ socket.transport.socket.URL }"
        reConnect()

    socket.connect()

    createSocket.ran = true



reConnect = ->
    
    console.log "polling for connection status: #{ socket.connected }"

    if not socket.connected
        socket.connect()
    
    clearTimeout reConnect.timer
    # Retry
    reConnect.timer = setTimeout reConnect, 2000



selectorPort = null


chrome.contextMenus.create
    title: "Edit in external editor"
    contexts: ["all"]
    onclick: ( onClickData, tab ) ->
        chrome.tabs.sendRequest tab.id, action: "edittextarea", onClickData: onClickData


chrome.extension.onConnect.addListener (port) ->
    portListeners[port.name]?(port)


portListeners =

    textareapipe: (port) ->

        port.onMessage.addListener (msg)  ->
            ports[msg.uuid] = port
            msg.executable = SETTINGS.editor_cmd
            msg.type = msg.type or "txt"

            socket.send JSON.stringify msg





loadSocketIO()

