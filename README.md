## Start 

Just clone the repo and run `npm run dev` to start it locally. I have inlcuded my dev crendentials for convenience of checking. (In a real project, these keys should be moved to CICD pipeline env instead of sitting in a repo.)

# Completed requirements
Due to the time limit, and the urgency of the project commit. I have completed most of the features, however, there are two parts that is not completed becasue of the following reasons:

* Dynamically adding columns (half-complete)
I expect this requirement to be completed as users can add columns dynamically both in front end and supabase. But it seams supabase does not support the feature of `alter table` related statements from client side. I always got permission error of "must be the owner of the table to do this operation", something like this. So I was not able to implement this feature. For my personal view, if adding column dynamically is a requirement of a real product, I would use a different data structure to store the table data instead of relational DB. Like csv files or customized JSON structure and etc. That's for my solution for this requirement. I'm not sure if satisfies the needs. 

* Image insertion of a cell.
Due to the time contraint, I was not able to complete this feature in time, and for now, I decided to commit the project first, if there is any additional time that needs me to complete this feature as well, I'm available to continue and finish it also.

