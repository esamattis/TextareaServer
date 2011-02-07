

timeStamp = (new Date().getTime())

siteId = ->
    location.href.replace(/[^a-zA-Z]/g, "") + "_" + timeStamp

$.fn.uuid = ->
    e =  $(this.get(0))
    uuid = e.data("uuid")
    if uuid
        return uuid
    else
        $.fn.uuid.counter += 1
        uuid = siteId() + "_" + $.fn.uuid.counter
        e.data("uuid", uuid)
        return uuid


$.fn.uuid.counter = 0
    

textAreas = {}

port = chrome.extension.connect  name: "textareapipe"

port.onMessage.addListener (obj) ->
    console.log "getting from bg: "  + obj.textarea
    textarea = textAreas[obj.uuid]
    textarea.val obj.textarea



$ ->
    $("textarea").dblclick ->
        textarea = $(this)
        textAreas[textarea.uuid()] = textarea

        port.postMessage  textarea: textarea.val(), uuid: textarea.uuid()
    
        
    

    
