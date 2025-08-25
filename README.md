
# Language Curation Platform

A modular platform that allows users to create communities and build language resources for their respective languages. Each Language then has an api and documentation associated with it.

## Backend

### Prerequisites
- Java JDK (version 21 minimum). Mac/Linux users are recommended to install sdkman to install and manage their JDK versions.
- Apache Maven (version 3.8.8)
- MongoDB (contact admin for access to the development cluster)
- Any IDE/Editor of your choice. Our Recommendation is the IntelliJ community edition. Download the JetBrains toolbox for easy installation.

### Running the Backend

1. Open or import the project via the root `pom.xml` file.
2. Open a terminal/command prompt in the project root directory.
3. Run the following command to clean, build, and install the project:

    ```bash
    mvn clean install
    ```
4. You will need to create a .env file at the root of the project. Here, you will place your MongoDB connection string to our development cluster. Speak with the admin to whitelist your IP address. You can use the command ipconfig to get this. Alternatively, you can update the the run configurations to include environment variables.
   You want to include env variables for the following:
   - MONGODB_URI - this should be the connection string to the MongoDB cluster. Speak to the admin to get this.
   - MONGO_DB - this should be the name of the database you want to use. for local dec it is the first letter of your name and then your surname followed by db. e.g. `jdoe_db`
   - SPRING_PROFILES_ACTIVE - configures the profile to use. For development, use `dev`.
   - API_KEY - allows requests to the backend.
5. Start the backend server using the LCP main class.
6. The backend is now running at [http://localhost:8080](http://localhost:8080).

## Frontend

### Prerequisites
- Node.js and npm (version 16.20.2)
- Any IDE/Editor of your choice. Our Recommendation is Webstorm. Download the JetBrains toolbox for easy installation.

### Running the UI

1. Open a terminal/command prompt.

2. Navigate to the UI directory:

    ```bash
    cd UI/
    ```

3. Run the following command to install dependencies:

    ```bash
    npm install
    ```

4. After the installation is complete, start the frontend development server:

    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    ```
Or you can use the run command found in the package.json
5. The front end is now accessible at [http://localhost:5173](http://localhost:5173).

## Repository Rules:
- **I BEG YOU DO NOT MERGE DIRECTLY INTO MAIN OR DEVELOP**
- All feature branches are to be merged into the **develop** branch.
- PRs are subject to reviews and must pass builds before being merged. UI Changes have their own UI Build. Backend Changes have theirs.
- UI changes will cause a redeploy to Netlify UI deployment. A merge to the main branch will cause a redeploy to the prod version on Netlify
- The backend is still not connected to the UI, and once it is, it will be connected via an API key and URL (aka GCP API gateway). Speak to Admin to get access.
- You will need a connection string if you start doing stuff on the backend. Please let an admin know, and you'll be given one and restricted access to GCP.
- **PLEASE DO NOT MERGE TO THE MAIN BRANCH**. We create a PR for the main only once the develop branch deployment succeeds, and we test changes. We will then create a PR to merge changes in develop into to main to trigger a new Prod deployment
- **When doing merges from develop to main. DO NOT UPDATE THE BRANCH; THIS WILL POLLUTE THE PR.** If the build succeeds and the PR is approved. **Just merge**.

