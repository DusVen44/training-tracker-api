- Training Tracker - 
https://training-tracker.vercel.app/ - An app designed for athletes to track their training performances.

- Built with Node - 
Express - PostreSQL - JWT - Mocha - Chai

- Why - 
Most currently applications are cluttered with inefficient features. I wanted to create an application that's simple, quick, and user-friendly.

Once and user signs up and logs in, they can start tracking their performances by creating a new routine. They can choose from a vast list of exercises to populate their routine. Each exercise provides and input box for the user to log their sets, reps, weight, and anything else they want to put. Once the routine is saved, it goes to their history. The user can then look back at previous routines and know what's needed to progress.

- Installing - 
Training Tracker requires Node.js. To install the dependencies and start
the server, run "npm install" in your terminal.

- Testing - 
Run "npm test" in your terminal.


- API Overview -
-/auth
    -/login
        POST - allows users to log into the app

-/users
    GET - returns all users (only administrator has access)
    POST - allows userd to sign up/register

-/exercises
    GET - return all exercises
    POST - adds exercise to exercises table (only administrator has access)

-/history
    POST - posts a routine to the history table
    -/:user_id
        GET - returns the user's history
        DELETE - deletes item from history table


Author - Dustin Venable