


do ->
    timeStamp = (new Date().getTime())
    siteId = ->
        location.href.replace(/[^a-zA-Z]/g, "") + "_" + timeStamp

    $.fn.edited = (callback) ->
        this.each ->
            active = false

            e = this
            $e = $(e)

            $e.focusin ->
                active = true
            $e.focusout ->
                active = false

            $(window).keyup ->
                callback(e) if active


    $.fn.sizeId = ->
        return this.height() + "" + this.width()

    $.fn.sizeId = ->
        return this.height() + "" + this.width()

    $.fn.textAreaResized = (callback) ->
        this.each ->
            that = $ this
            last = that.sizeId()
            that.mousedown ->
                last = that.sizeId()
            that.mousemove ->
                callback(that.get(0)) if last isnt that.sizeId()


    $.fn.toUpperRightCorner = (e) ->
        e = $ e
        that = this
        that.after e

        setPosition = ->
            offset = that.offset()
            l = offset.left + that.width() - e.width() - 20 
            t = offset.top
            e.css
                left: "#{l}px !important"
                top: "#{t}px !important"


        setPosition()
        $(window).resize ->
            setPosition()
        that.textAreaResized ->
            setPosition()
            






    $.fn.addButton = (callback) ->

        this.each ->
            that = $(this)

            button = $ "<span>", class: "edit-in-textareaserver"
            button.text "edit"

            button.click ->
                button.addClass "edit-active"

            timer = null
            that.hover (->
                clearTimeout timer
                button.show()),
                ->
                    clearTimeout timer
                    timer = setTimeout (->
                        button.hide()), 500

            that.toUpperRightCorner button
            callback that, button




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
    textarea = textAreas[obj.uuid]
    textarea.val obj.textarea
    textarea.trigger("keydown").trigger("keyup")



$ ->
    
    $("textarea").addButton (textarea, button) ->
        button.click ->
            textAreas[textarea.uuid()] = textarea

            sendToEditor = (spawn=false) ->
                port.postMessage
                    textarea: textarea.val()
                    uuid: textarea.uuid()
                    spawn: spawn
                    action: "open"

            sendToEditor(true)

            $("textarea").edited ->
                sendToEditor()


    $(window).unload ->

        for key, ta of textAreas
            port.postMessage
                action: "delete"
                uuid: ta.uuid()




