<h1>Spying Eye</h1
<hr>
<h3>Video Demo: https://youtu.be/148PcEWbm8U</h3>
<h3>Check out the application: <a href="https://spying-eye-cs50x.onrender.com">https://spying-eye-cs50x.onrender.com/</a></h3>
<hr>
<h3>Description:</h3>

This is my final project for CS50x 2023. The name of the application is Spying Eye and is a web application which means that the application works on every device that has a web browser. The aim is to use a device's camera for detection and save the detection to a history of detections. This is a good implementation for security reasons and also helps people with disabilities.

I have had an interest in machine learning but I never tried to implement it anywhere. After watching the ML seminar, I knew that I wanted to create one. The app started as a Flask application where the client sends the camera stream to the server, the server analyzes it and then sends the video stream back to the client with bounding boxes. This type of implementation was very hard because I had to use WebRTC which its usage was quite complicated. After searching around, I found that aiortc is a good Python library to handle server-side WebRTC. I tried setting it up but I had a lot of trouble making it work. I found an example that used the aiohttp server library and not Flask. So, I converted the whole Flask application to aiohttp application.

Now everything is up and running and everything runs great! Well, not really, the problem here is that the whole process is extremely slow for real-time video. I tried using asyncio to run the analysis asynchronically which made it a bit faster but it was still very slow. 

I had to find another solution. I started looking around the web if there is a similar implementation anywhere. I stumbled upon a client-side implementation that used Tensorflow-js for client-side real-time detection. Then, I found out about ml5js and p5js which can be used together to create an object detector.

So, I started building the app from the beginning. I wiped clean my virtual environment and installed Flask only to build the application in Flask. 

## How It Works

### Client Side Implementation - Web Pages

On the client side, I created 6 Web-pages:

1. register.html

The register.html page is where the user can create their own account. The user has to input a username and password twice. If one of the two password fields is wrong, then the server denies account creation and the register.html page reloads with a message that says that both password fields must be the same.

2. login.html

This is a page where the user can insert their credentials to log in. The only way to see the index, history, and detection pages is to have logged in. If the user tries to enter a page that needs authorization, then the server redirects them to the login.html page and asks them to log in.

3. Index.html

Here, the user will be able to start detection, log out, or see their detection history. 

4. detection.html

This is where the main action happens. This page includes ml5js, p5js scripts, and the scripts.js file as well. The user can see the camera's feed with bounding boxes if there are any detections.

5. history.html

The user can see the history of detections with Label, Confidence, Date, and Time. They can also wipe clean the detection history if they wish.

6. layout.html

This is where the base of every webpage is. I used jinja to make web page building faster.

### Client Side Implementation - scripts.js

This script only exists on the detection.html page. I used the p5js and ml5js object detector example with my very own model as a template to build upon. I also built a function where the client sends a JSON via the POST method to the server with the detection data. 

### Server Side Implementation - app.py

This is the Flask application that runs on the server. It handles registration, authorization, and session with flask-login, it opens and closes the database for insertions, deletions, and updates. 

It redirects to the login page when the user tries to enter a page unauthorized telling them to log in or to tell them that the user does not exist if the username is not found in the database.

When the scripts.js sends a JSON, then the server gets the data with request.get_json() and adds the data to the database.

### Deployment

For deployment, I decided to use docker to make things easier with dependencies. To build the docker file, [I used a guide from freecodecamp.](https://www.freecodecamp.org/news/how-to-dockerize-a-flask-app/)

Then, I had to find a place to host my web application. After looking around for a lot of hours, this exhausting adventure lead me to a Reddit page where there was a comment by a user who suggested giving render.com a try. I visited render and lo and behold! My web application is live and thanks to docker the dependencies are managed very smoothly. The free tier of render is quite limiting but is enough for my web which I do not expect to get much attention.


## This is it!

Now the application is up and running and works quite nicely. 
