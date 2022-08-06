# repostchecker
a minimal extension for Google Chrome to check whether any Reddit (image) post is a repost with ease, uses the undocumented repostsleuth API * 

###### \* doesn't work for a very tiny number of exceptional urls, this is a repostsleuth limitation

<img width="555" alt="image" src="https://user-images.githubusercontent.com/68165727/183236002-c85151ba-fcb3-4fa3-8769-550e659891a2.png">


#### note: 
it _could_ show a net::ERR_INCOMPLETE_CHUNKED_ENCODING error but it's harmless 

additionally, remember repostsleuth can't always detect reposts  (e.g when certain changes have been made to the image) 

searching for the image on Google via uploading or searching for a transcription of the image usually yields results too

by default repostchecker uses these parameters:

<img width="310" alt="image" src="https://user-images.githubusercontent.com/68165727/145656649-d8136791-5cdc-47dc-a265-56838f296349.png">

these can be changed in the contentScript.js file

## installation
* download [build-archive.zip](/build-archive) and extract the **build** folder present inside the archive

* visit chrome://extensions/ via the addressbar

       <img width="335" alt="image" src="https://user-images.githubusercontent.com/68165727/145637973-0709fe69-fc9e-461c-b2ec-4a008fed0596.png">

* enable Developer Mode via the topbar

        
          <img width="813" alt="image" src="https://user-images.githubusercontent.com/68165727/145638374-2199cf63-4c5a-4ed4-b6a7-33d702475a08.png">
* select "Load unpacked"

        <img width="315" alt="image" src="https://user-images.githubusercontent.com/68165727/145638581-0c395211-feca-4c9b-8bc1-ebeef6ca29eb.png">
* select the build folder you extracted in step 1
* plugin should be installed

 

## building
if you want to make changes and build: navigate to the repostchecker-main directory, install dependencies, and build.
 
``` 
cd repostchecker
npm install
npm run watch
```
load/refresh the extension after making changes
