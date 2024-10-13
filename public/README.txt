Project Overview
Garden Craft is a web application designed to help users manage their gardens efficiently. Users can log in to upload images of their gardens and customize or redesign them using a variety of tools available on the platform. It offers weed control guidance, garden management tips, and community collaboration for garden redesigns.

Features
	Login/Register: Users can create an account or log in to access their garden management tools.
	Upload Photos: Upload pictures of the garden for model generation and design suggestions.
	Weed Control Guidance: Provides information on identifying and removing garden weeds.
	Garden Redesign: Users can customize garden layouts and collaborate with other users.
	Responsive Design: Compatible with different screen sizes for better usability.

File Structure
├── public
│   ├── assets                # Contains images, fonts, and other resources
│   ├── css
│   │   ├── main.css          # Main stylesheet for the website
│   │   ├── main2.css         # Secondary stylesheet
│   ├── garden_page.html      # Garden management page
│   ├── index.html            # Homepage with login and register options
│   ├── login.html            # Login page
│   ├── register.html         # Registration page
│   ├── locate.html           # Locate gardening services page
│   └── index3.html           # Additional page (description pending)
├── server.js                 # Main server-side JavaScript file (Node.js backend)
├── package.json              # Contains project dependencies and scripts
├── .env                      # Environment variables for sensitive information
├── README.txt                # A placeholder for the README file
├── LICENSE.txt               # Project license
└── Procfile                  # Heroku deployment process file


Installation Guide
Requirements
Node.js (version 14 or later)
npm (Node Package Manager)
Firebase (if you’re using it for backend services)
Heroku CLI (if you plan to deploy to Heroku)

Usage Instructions
Home Page:

Upon visiting the website, users will see the welcome screen with two buttons: "Login" and "Register".
These buttons link to the corresponding login (login.html) and registration (register.html) pages.
Login/Register:

New users must register via the registration page.
Returning users can log in using their credentials.
Main Garden Features:

After logging in, users can access features like uploading garden images and managing their garden using the tools provided on garden_page.html.