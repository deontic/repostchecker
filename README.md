# repostchecker
an extension for Google Chrome to check whether a Reddit post is a repost with ease, uses the undocumented repostsleuth API * ** ***

######  \* only works if you are a moderator of the subreddit \** not tested on mobile \*** doesn't work for certain urls, this is a repostsleuth limitation

<img width="419" alt="image" src="https://user-images.githubusercontent.com/68165727/145656345-70135050-1905-4d88-bf4e-b9024718e509.png">

#### note: 
can very rarely give you a net::ERR_INCOMPLETE_CHUNKED_ENCODING 200 (OK) error but it generally works ok, remember repostsleuth can't always detect reposts  (e.g when certain changes have been made to the image) 

## installation
* download [build.zip](/build) and extract the build folder
* visit chrome://extensions/ via the addressbar

       <img width="335" alt="image" src="https://user-images.githubusercontent.com/68165727/145637973-0709fe69-fc9e-461c-b2ec-4a008fed0596.png">

* enable Developer Mode via the topbar

        
          <img width="813" alt="image" src="https://user-images.githubusercontent.com/68165727/145638374-2199cf63-4c5a-4ed4-b6a7-33d702475a08.png">
* select "Load unpacked"

        <img width="315" alt="image" src="https://user-images.githubusercontent.com/68165727/145638581-0c395211-feca-4c9b-8bc1-ebeef6ca29eb.png">
* select the build folder you extracted in step 1
* plugin should be installed

 

## building
if you want to make changes and build: navigate to the repostchecker directory, install dependencies, and build.
 
```
cd repostchecker
npm install
npm run watch
```
load/refresh the extension
