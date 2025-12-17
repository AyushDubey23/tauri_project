# Voice-to-Text Desktop Application (Tauri + Next.js + Deepgram)

This project is a desktop application that converts spoken audio into text.  
The application is built using Next.js for the frontend, Deepgram Speech-to-Text API for transcription, and is packaged as a native desktop application using Tauri.

The project demonstrates microphone audio capture, speech recognition using a cloud-based API, and desktop application development using modern web technologies.

---

## Features

- Microphone audio capture using Web Audio APIs
- Speech-to-Text transcription using Deepgram
- Native desktop application using Tauri
- Lightweight and fast execution
- Start and Stop recording functionality
- Clean and minimal user interface

---

## Tech Stack

- Frontend: Next.js (App Router, TypeScript)
- Speech-to-Text API: Deepgram
- Desktop Framework: Tauri (Rust)
- Styling: Tailwind CSS
- Build Tools: Node.js, Rust, MSVC (Windows)

---

## Prerequisites

Ensure the following are installed on your system:

### Node.js
node -v
npm -v


### Rust (required for Tauri)
rustc --version



If Rust is not installed:
winget install Rustlang.Rustup



### Visual Studio Build Tools (Windows)
Install Desktop development with C++ from:
https://aka.ms/vs/17/release/vs_BuildTools.exe



Required components:
- MSVC v143
- Windows 10 or 11 SDK
- CMake tools

Restart the system after installation.

---

## Deepgram API Setup

1. Create an account at https://console.deepgram.com
2. Navigate to Settings -> API Keys
3. Create a new API key (starts with dg_)
4. Create a `.env.local` file in the project root

NEXT_PUBLIC_DEEPGRAM_API_KEY=dg_your_api_key_here


Do not expose or commit the API key in production projects.

---

## Setup Instructions

### Install dependencies
npm install


### Run in browser (development)
npm run dev



---

## Build and Run as Desktop App

### Build Next.js static export
npm run build


This generates the `out/` directory used by Tauri.

### Run desktop application
tauri dev


This opens the application in a native desktop window.

### Build final executable
tauri build


The executable will be located at:
src-tauri/target/release/


---

## Working Principle

1. User clicks Start Recording
2. Microphone audio is captured using browser APIs
3. Audio data is sent to Deepgram Speech-to-Text API
4. Deepgram returns the transcribed text
5. The transcript is displayed in the user interface
6. The web application is packaged as a desktop application using Tauri

---

## Academic Relevance

This project demonstrates:
- Real-time audio capture
- Integration of a cloud-based speech recognition API
- Desktop application development using web technologies
- Practical use of APIs and modern development tools

The implementation aligns with the objective of building a Voice-to-Text Desktop Application using Tauri and Deepgram.

---

## Author

Ayush Dubey  
GitHub: https://github.com/AyushDubey23

