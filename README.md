# Asw-Hci
EcoGo is a MEVN stack application (MongoDB, Express, Vue, Node) for the ASW course of University of Bologna.

## Prerequisites

Ensure that the following software is installed on your machine before proceeding:

* **Docker Desktop**
* **Doppler CLI** : https://github.com/DopplerHQ/cli/blob/master/INSTALL.md
* **Git bash**

## Installation

To start the application, you require a Service Token. Please request the "Public Access Token" from the project administrator.

### Step 1: Clone the Repository

Clone the project files to your local machine:

git clone https://github.com/schwein69/Asw-Hci.git   
cd to the root path (mevn-app)

### Step 2: Run the Application

Execute the following command in your terminal, replacing `YOUR_SERVICE_TOKEN` with the actual token provided by the administrator.

**Recommended usage with Git bash**

export DOPPLER_TOKEN=YOUR_SERVICE_TOKEN  
doppler run -- docker-compose up --build

**For macOS and Linux (Bash/Zsh):**

export DOPPLER_TOKEN=YOUR_SERVICE_TOKEN  
doppler run -- docker-compose up --build

**For Windows (PowerShell):**

$env:DOPPLER_TOKEN="YOUR_SERVICE_TOKEN"  
doppler run -- docker-compose up --build

### Step 3: Access the Application

Once the initialization process is complete, the services will be available at the following addresses:

* Frontend Application: http://localhost:80  
* Backend API: http://localhost:3000

## Troubleshooting

If you encounter connection errors, please verify that:
1.  Docker Desktop is running.
2.  The DOPPLER_TOKEN environment variable was set correctly before running the command.
3.  Port 3000 and Port 80 are not occupied by other applications.

## Maintainer Access

Project maintainers with direct access to the Doppler project may authenticate locally without using a Service Token:

1.  doppler login
2.  doppler setup
3.  doppler run -- docker-compose up --build
