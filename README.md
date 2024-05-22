# Get Started 

Just clone the repo and run `npm run dev` to start it locally. I have included my dev credentials for the convenience of checking. (In a real project, these keys should be moved to CICD pipeline env instead of sitting in a repo.)

# Incompleted requirements
Due to the time limit, and the urgency of the project commit. I have completed most of the features, however, two parts is not completed because of the following reasons:

### Dynamically adding columns (half-complete) 
I expect this requirement to be completed as users can add columns dynamically both in the front end and supabase. But it seems supabase does not support the feature of `alter table` related statements from the client side. I always got permission error of `must be the owner of the table to do this operation`, or something like that. So I was not able to implement this feature. In my personal view, if adding a column dynamically is a requirement of a real product, I would use a different data structure to store the table data instead of relational DB like CSV files or customized JSON structure, etc. That's my solution for this requirement. I'm not sure if it satisfies the needs. 

### Image insertion of a cell
Due to the time constraint, I was not able to complete this feature in time, and for now, I decided to commit to the project first, if there is any additional time that needs me to complete this feature as well, I'm available to continue and finish it also.

