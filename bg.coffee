



socket = new io.Socket "localhost", port: 8000

socket.connect()

ports = {}


#socket.on "disconnect", ->
    #setTimout (-> socket.connect()), 1000
    

socket.on "message", (msg) ->
    obj = JSON.parse msg
    port = ports[obj.uuid]
    port.postMessage obj


chrome.extension.onConnect.addListener (port) ->
    if port.name isnt "textareapipe"
        return

    port.onMessage.addListener (msg)  ->
        
        ports[msg.uuid] = port
        
        socket.send JSON.stringify msg

        
