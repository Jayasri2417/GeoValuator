# GeoValuator: An Integrated Geospatial System for Land Mapping and Property Analysis

GeoValuator is an advanced AI-powered platform for land valuation, risk assessment, and real estate analysis. This application incorporates predictive machine learning models, geospatial mapping, and a comprehensive risk engine to provide users with accurate and deeply contextual real estate intelligence.

# Authors

D.Jayasri (Y22ACS438)

G.Karthik(L23ACS601)

G.MadhuLatha(Y22ACS458)

K.SivaLahari(Y22ACS476)

# Implementation

https://github.com/Jayasri2417/GeoValuator

## Features

- **Predictive Pricing Engine**: Leverage artificial intelligence and machine learning components (hosted in the `ai_engine` folder) to estimate land prices based on historical trends and geospatial features.
- **Risk Assessment (Kabja Risk Engine)**: Identifies and evaluates property-related risks using robust rule-based metrics and analytical scoring.
- **Geospatial Mapping**: Integrated map canvas allowing visual exploration of properties, digital nominee assignments, and land search.
- **Smart AI Assistant**: A real-time chat interface interacting with advanced Gemini LLMs to answer queries, summarize reports, and guide users through real estate procedures.
- **Unified Dashboard**: An intuitive real estate dashboard constructed in React, providing a centralized interface to manage properties, generate reports, and oversee risk analysis.
- **Authentication & Security**: Secure user registration and login utilizing OTP features and role-based data isolation.

## Project Structure

The project has a microservices-inspired monolithic repository structure:
- **`client/`**: The modern React.js frontend providing the user interfaces (Dashboard, AI Agent Chat, Evident Generator, Map Canvas).
- **`server/`**: The Express.js backend API orchestrating database connections (MongoDB), handling authentication, communicating with external geocoding services, and bridging frontend requests to the AI engine.
- **`ai_engine/`**: The Python backend environment containing machine learning models (XGBoost/scikit-learn), the data engineering pipelines, and the core Risk Engine.

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS
- **Backend Node**: Express.js, Node.js
- **Database**: MongoDB Atlas
- **Backend AI/ML**: Python, Flask/FastAPI (for model serving), scikit-learn
- **AI/LLM Utilities**: Google Gemini API

## Getting Started

### Prerequisites

Ensure the following tools are installed to run the backend, client, and AI engines locally:
- [Node.js](https://nodejs.org/en/)
- [Python 3.10+](https://www.python.org/)
- [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas)

### Installation

1. Complete the installation of Node dependencies for both `client/` and `server/`.
   ```bash
   cd client
   npm install
   cd ../server
   npm install
   ```
2. Install Python dependencies for the AI Engine:
   ```bash
   cd ../ai_engine
   pip install -r requirements.txt
   ```

### Running the Application

You can use the provided startup scripts (e.g. `startup.ps1`) or easily spin up the standalone services locally:

- **Launch React Frontend**:
  ```bash
  cd client
  npm run dev
  ```
- **Launch Express Backend**:
  ```bash
  cd server
  npm start
  ```
- **Launch AI Engine**:
  ```bash
  cd ai_engine
  python main.py
  ```

For full setup directions or additional architecture definitions, consult the documentation within the `bin/` directory and module specific READMEs.


