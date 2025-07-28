# Testing the Exception capture feature

## Exception Testing Prompt

Create a test for the exception capture feature (not merged yet - is in https://github.com/rysweet/ai-sip-workshop/pull/7). What you will need to do is to run the application, then cause the bug you introduced in https://github.com/rysweet/ai-sip-workshop/pull/5 to occur. Then, you will need to verify that the exception is captured and a new issue is created in the repository and assigned to Copilot.

1. Create a new issue in the repository titled "Test Exception Capture Feature". Update the Issue with the details of the test.
2. Create a new branch based on the previous stacktrace branch called `feature-<issue-number>test-exception-capture` and switch to it.
3. Think carefully about how to implement this test. The code you create will need to:
   - Run the application and cause the bug to occur.
   - Verify that the exception is captured and a new issue is created in the repository.
   - Ensure the issue is assigned to Copilot.
4. Once you have implemented the test, run it to ensure it passes. If not, debug the issue and fix it. 
5. Once the test passes, commit your changes with a clear message indicating that you have implemented the test for the exception capture feature.
6. Push the branch to the remote repository.
7. Create a pull request from the `feature-<issue-number>test-exception-capture` branch to the main branch.
8. Add a detailed description to the pull request explaining the purpose of the test and how it verifies the exception capture feature.
9. Ensure the pull request passes the CI/CD pipeline.
10. Do not merge the pull request yet.