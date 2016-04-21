Fast Playlist
-------------

It is a web-app which helps you create playlist for youtube songs really quickly.
I made it out of the pure frustration of the lack of this feature on Youtube.

Features
---------

 - Search Youtube
 - Playlist saved to cache, loaded next time you open.
 - Works pretty much like a music player (Previous, Next, Repeat All, Repeat One, SHuffle, buttons)
 - Share your playlist with a generated share link

Install and Run
---------------

It requires [sass](http://sass-lang.com) to compile the scss to css. Install from [here](http://sass-lang.com/install).

To run the server, use the script `server`. It relies on python module `SimpleHTTPServer`. 

```
./server start
```

`server` starts two background jobs, one for the server and second for the scss compiler. Check logs in the `logs/server.log` and `logs/scss.log` file. To close the server

```
./server stop
```

And to check if it is running

```
./server check
```

Feature Wishlist
---------
 - Drag and Drop!
 - Reordering of playlist

License
--------

MIT
