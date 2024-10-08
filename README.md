# Email Engine v2

A Node.js-based email engine built using TypeScript, Express, and Elasticsearch.

## Prerequisites

Before starting, ensure you have the following installed:

- [Docker](https://www.docker.com/get-started)
- [Node.js (v18.x or above)](https://nodejs.org/en/download/)
- [npm](https://www.npmjs.com/get-npm)

## Setup Instructions

Follow these steps to get the application running:

### 1. Run Docker in the Background

The application requires an Elasticsearch service that runs through Docker. Use Docker Compose to run the services in the background.

1. First, ensure you are in the root directory of the project.

2. Use Docker Compose to build and run the required services (Elasticsearch, Kibana, etc.):

```bash
docker-compose up -d

npm install

npm start

```

# User Setup for Email Engine v2

Welcome to the Email Engine v2 setup guide. Follow these steps to create an account, log in, and start using the email engine.


## User Setup Instructions

### 1. Create a Local Account

To use the email engine, you first need to create a local account:

1. Open your web browser and go to the sign-up page:
   
   [http://localhost:3000/user/signup](http://localhost:3000/user/signup)

2. Fill out the sign-up form with your details, such as username, email, and password.

3. Click **Sign Up** to create your account.

### 2. Login to Your Account

After creating your account, you need to log in:

1. Navigate to the login page:

   [http://localhost:3000/user/login](http://localhost:3000/user/login)

2. Enter your email and password used during sign-up.

3. Click **Login** to access your account.

### 3. Sign In with Outlook Account

To integrate with your Outlook account and access additional email features:

1. Go to the Outlook sign-in page:

   [http://localhost:3000/auth/signin](http://localhost:3000/auth/signin)

2. Sign in with your Outlook credentials.

3. Follow any prompts to authorize the application to access your Outlook account.

### 4. Access Your Inbox

Once logged in and signed in with Outlook, you can view your email inbox:

1. Visit the inbox page:

   [http://localhost:3000/mail/inbox](http://localhost:3000/mail/inbox)

2. Manage your emails through the email engine interface.


## Pending Changes

We are continuously working to enhance the Email Engine v2. Below are some of the pending changes and improvements that are planned:

### 1. Rate Limiting for Outlook APIs

**Description**: We are implementing rate limiting to manage the number of API requests sent to Outlook. This is crucial to avoid hitting the API rate limits and to ensure smooth operation.

**Details**:
- Implement mechanisms to monitor and limit the number of requests made to the Outlook API.
- Introduce retry logic or request throttling when rate limits are approached or exceeded.
- Update documentation with guidelines for managing API usage.

### 2. Track Changes Using Microsoft Graph Delta Query

**Description**: To efficiently track changes in the user's mailbox, we will use the Microsoft Graph Delta Query API. This will allow the application to detect changes such as new messages or updates to existing messages.

**Details**:
- Integrate with the following endpoint: [Microsoft Graph Delta Query](https://graph.microsoft.com/v1.0/me/mailFolders/Inbox/messages/delta).
- Implement functionality to query for changes and update the application state accordingly.
- Ensure that changes are handled efficiently to minimize impact on performance and user experience.

### 3. Code Optimizations

**Description**: We are working on optimizing the codebase to improve performance, readability, and maintainability.



## Troubleshooting

If you encounter issues during the setup process, here are some common solutions:

- **Account Creation Issues**: Ensure all required fields are filled out correctly and the email address is valid.
- **Login Problems**: Verify that you are using the correct credentials. Use the password recovery feature if available.
- **Outlook Integration**: Ensure that you’ve authorized the application to access your Outlook account and that you’re using the correct credentials.
