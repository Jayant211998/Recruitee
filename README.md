# Recruitee

multiple users -> each user can have multiple companies -> each company can have multiple jobs -> candidates can apply to jobs

Authentication Token based on JWT

Registration form for Recruitee
Takes username, email and password and sends it to the server and gives back the response.
Checks if the email is already taken or not.
Creates user ID and default company for the user.
Adds created time and updated time to the user data.

Email Validation Pending...

Login form for Recruitee
we provide email and password and sends it to the server and gives back the response as token and user data.

Get Admin
Provides admin data by passing token in header.

Get Companies
Provides all companies owned by user by passing token in header.

Add Companies
Add company for the given user.





Apply filter in candidates.

Application

- When candidate apply for job the job entry gets created in application collection. 

 - Document contains job id, job title, company id, applied time, updated time, number of openings, candidates applied number, candidate: [{candidate id, candidate name, status}]

manage hired candidates data in apply collection. If all candidates hired then job status will be changed to closed.

Recreate promote and reject operation. 

Admin has to provide token as well as username and password token to use apply operations except for apply for job.

Company operations and apply operation to be shifted in auth under adminActions.

Add more company operations.

Set Authentication system.

Add required fields.

Send mail after changing status.

Create documentation.