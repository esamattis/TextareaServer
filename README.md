TextareaServer is a backend of [TextareaConnect][].

# NOTE

Due to updates in both Chrome and Node.js TextareaConnect/Server is currently broken. 
Also I'm currently bit busy with my other projects so this will have to wait for now. 
Pull requests are very welcome thou!

# Installing

TextareaServer runs on [Node.js][] v0.4 (or higher) and is installable using
[npm][].

In Ubuntu you can get all the building dependecies for Node.js and its
extensions using apt-get (npm will automatically install and compile all the
extensions).

    sudo apt-get install build-essential libssl-dev

More detailed Node.js & npm install instructions can be found from the [Node.js
wiki](https://github.com/ry/node/wiki/Installation)

Then just install TextareaServer using npm:

    npm install textareaserver

And start it by entering commmand:

    textareaserver --editor-cmd gedit

Please report possible issues to [TextareaConnect tracker][].

[Node.js]: http://nodejs.org/
[npm]: http://npmjs.org/
[TextareaConnect]: https://github.com/epeli/TextareaConnect
[TextareaConnect tracker]: https://github.com/epeli/TextareaConnect/issues
