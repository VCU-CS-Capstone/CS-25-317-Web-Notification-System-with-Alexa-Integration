# Backend Test Updates

## How to Run 

- *install node (will change eventually)

- Go to *./Backend Test/supabase_test* directory 

- use command *node index.js* to start server on http://localhost:5000

- Go to *./Backend Test* and open *index.html* in browser 

You can log into the [Supabase Account](https://supabase.com/dashboard/sign-in) with the Capstone Group email and password 

## 12-03-24

- User can sign up or log in with credentials 
- User will only see events associated with their userid 
- User can add/delete events (edit button currently doesn't work)

- Events automatically listed with details about each one 
- End-time is optional 

## 12-04-24

- fixed *add event* function to include the userid that's logged in 
- fixed event display to only display end time if not null 

Notes: 

- display events in chronological order? 
- add description to event
- create *edit event* function 
- add reminder information

