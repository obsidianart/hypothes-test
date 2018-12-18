# Code test for Hypothes
If you are looking at this code test please be aware it's quite different from my usual style due to specific requirement.
This is intended to be an embeddable plugin using minimum space hence no react/angular/ember/vue etc. 

## Compatibility requested
Chrome (latest)            | 70%
Firefox (latest)           | 15%
Chrome on Android (latest) |  5%
Safari 9                   |  2%
iOS Safari 9.x             |  1.4%
Edge 12                    |  1%
Internet Explorer 11       |  1%

## Compatibility
I don't have a window machine configured at the moment so I can't test it for the time being on edge

## To run the example
- `cd example`
- run a server locally (see below)

## I don't have a local server
- 'npm install http-server -g'
- 'http-server'
- open your browser on 'http://127.0.0.1:8080/example/example-1.html'

## I got an error why installing the local server
- I'm 95% sure you misconfigured npm https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally
- I'm 1% sure it's because you don't have node installed https://nodejs.org/en/download/
- I'm 100% sure if you are reading this the above didn't solve your problem, I'm sorry, contact me so I can improve this

## How to use
It can't be simpler
Include the plugin
```
	<script src="/src/plugin.js"></script>
```
```
    FriendsTagger.init({
      list:'/example/data.json', //Any url
      selector:'#input' //Any selector
    })
```
If you have doubts check the example

## Hey, my style doesn't work
I didn't implement full style yet

## What it is not done
- A plugin should probably have a stronger inline styling
- Minify the code
- Write tests (some parts might be unit test easily, other far from easy)
- Test note: unit tests requires a slight change to the plugin to export certain elements
- Use a transpiler (just in case, more compatibility)
- Highlight the added name (not in the requirement but it would be quite nice)