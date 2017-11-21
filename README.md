Fast Playlist
-------------

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://www.gitter.im/fast-playlist)
[![TravisCI](https://travis-ci.org/udiboy1209/fast_playlist.svg?branch=master)](https://travis-ci.org/udiboy1209/fast_playlist?branch=master)

It is a web-app which helps you create playlist for youtube songs really quickly.
I made it out of the pure frustration of the lack of this feature on Youtube.

Check out the [stable version](https://udiboy1209.github.io/fast_playlist).

You can also try out the [beta version](https://udiboy1209.github.io/fast_playlist/beta).

Features
---------

 - Search Youtube
 - Playlist saved to cache, loaded next time you open.
 - Works pretty much like a music player (Previous, Next, Repeat All, Repeat One, Shuffle).
 - Easy Drag and Drop re-ordering, and add from search menu by dragging.
 - Share your playlist with a generated share link

Install and Run
---------------

It requires [sass](http://sass-lang.com) to compile the scss to css. Install from [here](http://sass-lang.com/install).

To run the server, use the script `server`.
It relies on python module `SimpleHTTPServer`,
so it will require python to be installed. 
`server` starts two background jobs, one for the server and second for the scss compiler.
Check logs in the `_logs/server.log` and `_logs/scss.log` file.

```
./server start
```

To close the server

```
./server stop
```

And to check if it is running

```
./server check
```

Feature Wishlist
---------
 - Video Suggestions: I had added it before, using youtube's suggestion list.
   The code is there is [some old commits](https://github.com/udiboy1209/fast_playlist/blob/442af81ef7be090f5fde9fe42e265b96e1587347/js/main.js#L82),
   it just needs to be added to the UI in a nice way so that it doesn't clutter the player.
 - Shuffle: The button is there, but need to implement it in a non-hacky way.
 - Multiple playlists: Currently the running playlist is stored in cache and you can only modify it.
   Something better would be to be able to switch to a new empty playlist and save the current one for later.
 - The share link which is generated right now is horrendously long, especially for large playlists.
   Integration with a URL shortener service would be great.
 - The playlist is stored as an array rn with integer access. 
   Switching to ID based dictionary object would be faster.

License
--------

MIT
