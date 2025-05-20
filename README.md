## Modern Weather Alert App

Web application using MapLibre and Express.js to display real-time weather alerts with an interactive map. 
Below are steps to run the application and deploy with docker

## Prerequisites

- [Node.js](https://nodejs.org/) (v22.x recommended)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

## Node.JS / NPM

### Step 1: Clone the project

Open a terminal, and in your desired directory, enter either:
HTTPS: git clone https://github.com/MatthewFilo/Modern_Weather_Alert.git
SSH: git@github.com:MatthewFilo/Modern_Weather_Alert.git
GitHub CLI: gh repo clone MatthewFilo/Modern_Weather_Alert

### Step 2: Node and NPM Versions
Ensure you have the latest version of Node.JS and NPM installed (Instructions listed below for bash terminals)
```bash
# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# in lieu of restarting the shell
\. "$HOME/.nvm/nvm.sh"

# Download and install Node.js:
nvm install 22

# Verify the Node.js version:
node -v # Should print "v22.15.1".
nvm current # Should print "v22.15.1".

# Verify npm version:
npm -v # Should print "10.9.2".
```

### Step 3: Initial Project Setup
Open a terminal and enter your cloned directory, we need to install the packages, so once you are cd'd into the directory, run
```bash
npm install
```
This will install all of the required packages necessary for this project

### Step 4: Running the Project
Once you are done making changes and would like to run the project:
    - **Development**: `npm run dev` (will utilize nodemon while running project)
    - **Production**: `npm run start` (will use node to run project)

Afterwards, you can access the app using **http://localhost:8080**

Voila! You have successfully run the project. Docker is utilized within this project with Docker Compose. Below are the steps to run a container for this application
## Docker

### Step 1: Docker Installation
Ensure you have the latest version of docker installed on your machine. The documentation below will guide you through the steps
https://docs.docker.com/engine/install/

### Step 2: Starting Docker Instance
Run this command
```bash 
docker-compose up -d 
```
docker-compose up will utilize the compose.yaml file and create an image and run that image!

### Step 3: Stopping docker instance
To stop the container, simply run
```bash
docker-compose down
```

Voila! That's how to utilize docker within this project

## License && Open Source Projects
MIT
Maplibre GL JS