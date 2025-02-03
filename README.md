# Admin Panel

A full-fledged admin panel web application built with React and Vite for managing media files (images and videos) for the Status 365 Android app. This application allows administrators to upload files directly to AWS S3 cloud storage and retrieve them through a secure API.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [License](#license)

## Overview

The **Status 365 Admin Panel** is designed to provide administrators with an intuitive and modern interface to upload images and videos. Files are stored in AWS S3 and can be accessed by the Status 365 Android app via API endpoints. The application features a responsive design using Tailwind CSS, categorizes media files (images and videos), and includes client-side validations and status messages.

## Features

- **File Upload:** Upload images and videos via a clean, responsive UI.
- **Categorization:** Files are categorized into images and videos for easy management.
- **Cloud Storage Integration:** Direct upload to AWS S3 with public read access (adjustable for your needs).
- **API Access:** Provides endpoints to upload files and list all uploaded files.
- **Responsive Design:** Built with React, Vite, and Tailwind CSS for a modern and responsive user experience.
- **Scrollability:** The uploaded files section is scrollable for easy navigation through large media libraries.


## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- AWS Account (for S3)
- npm (comes with Node.js) or yarn

## Installation

### Backend Setup

1. **Navigate to the `backend` folder:**

   ```bash
   cd admin-panel/backend

2. **Install dependencies:**

    ```bash
    npm install

3. **Configure Environment Variables:**

    Create a ```bash.env``` file in the backend folder with the following content (replace placeholders with your actual AWS credentials and bucket details):
    ```bash
    AWS_ACCESS_KEY_ID=your_aws_access_key_id
    AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
    AWS_REGION=your_aws_region
    AWS_BUCKET_NAME=your_bucket_name
    PORT=5000
    ```

4. **Backend Overview:**

    The backend uses Express with multer-s3 to handle file uploads directly to AWS S3.
    It exposes two main endpoints:
        [POST /api/upload](#api-endpoints): For uploading a file.
        [GET /api/files](#api-endpoints): For listing all uploaded files.

### Frontend Setup

1. **Navigate to the frontend folder:**

    ```bash
    cd admin-panel/frontend

2. **Install dependencies:**

    ```bash
    npm install

3. **Configuration:**

    The project uses Vite as the build tool with React and Tailwind CSS.
    PostCSS configuration has been set up using the [postcss.config.cjs] file.
    The [vite.config.js] file includes proxy settings to forward API requests to the backend.

## Running the Application

### Starting the Backend

**From the backend directory, run:**
```bash
npm run dev
```
**or for production:**
```bash
npm start
```
**The backend server will start on the port specified in the .env file (default is 5000).**

### Starting the Frontend

**From the frontend directory, run:**
```bash
npm run dev
```
**The Vite development server will start and typically be accessible at http://localhost:3000.**

## API Endpoints

1. **POST /api/upload**

    Description: Uploads a file to AWS S3.
    Headers: Content-Type: multipart/form-data
    Response:

    ```bash
    {
        "message": "File uploaded successfully",
        "file": {
            "filename": "timestamp-filename.ext",
            "url": "https://your_bucket_name.s3.your_aws_region.amazonaws.com/timestamp-filename.ext"
        }
    }
    ```

2. **GET /api/files**

    Description: Lists all files in the S3 bucket.
    Response:

    ```bash
    {
        "files": [
            {
            "filename": "timestamp-filename.ext",
            "url": "https://your_bucket_name.s3.your_aws_region.amazonaws.com/timestamp-filename.ext"
            },
            ...
        ]
    }
    ```

## Security Considerations

Public Access: Files are uploaded with public-read ACL. For production, consider using pre-signed URLs or more secure access controls.
Authentication & Authorization: Add middleware to protect the upload and listing endpoints if necessary.
Environment Variables: Never commit your .env file to version control. Use environment variables for sensitive data.

## Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check issues page if you want to contribute.

## License

This project is licensed under the MIT License.

---

This README provides a comprehensive overview of the project and guides users through setup and deployment. Feel free to adjust sections or add further documentation based on any additional features or changes in your project.
