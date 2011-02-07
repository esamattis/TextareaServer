

socket = new io.Socket "localhost", port: 8000


chrome.contextMenus.create
    "title": "Edit in external editor!"
    "type": "normal"
    "contexts": ["all"]
    "onclick": (data, tab) ->
        debugger


socket.connect()

ports = {}


socket.on "message", (msg) ->
    obj = JSON.parse msg
    port = ports[obj.uuid]
    port.postMessage obj


chrome.extension.onConnect.addListener (port) ->
    if port.name isnt "textareapipe"
        return

    port.onMessage.addListener (msg)  ->
        
        debugger
        
        ports[msg.uuid] = port
        msg.executable = "gvim"
        
        socket.send JSON.stringify msg

        
