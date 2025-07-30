---

# Initialize the GH Repo and make first commit

1. Now you need to create a new private GH repository (we will make it public later). You can use the "gh" cli command to create the repository - I am already authenticated. 

- Repository name: ai-sip-workshop
- Repository Description: "A sample prpgram used in the course of a workshop on AI-enhanced software development practices."
- Repository Visibility: private
- License: Use the MIT license (use the actual MIT license text - do not modify it).

2. Initialize the git repo in the current directory and add the remote origin to the newly created repository.
3. Add all files to the git repo and commit them with the message "Initial commit".
4. Create a new branch called initial-commit and switch to it.
5. Push the initial-commit branch to the remote repository.
6. Create a new pull request from the initial-commit branch to the main branch.
7. Add a detailed description to the pull request explaining the purpose of the workshop and how to run it.
8. Go ahead and merge the pull request into the main branch.

---

# Building a claude.md file for this repository

1. Please build a claude.md file for this repository. The file should include the following sections:
- Overview of the repository and its purpose
- How to run the application
- Using the "gh" CLI to manage issues and pull requests
- best practices: read https://www.anthropic.com/engineering/claude-code-best-practices and incorporate the best practices into the claude.md file as you edit.
- Memory storage - Include instructions for claude that it should regularly update the overall goals, to do list, current status and important context in a memory storage file called .github/Memory.md. Each time it updates the memory, it should rewrite the file with the date and time of the update, consolidation of the current memories, and a summary of the current status, todo list, and important context. It should also prune the memory file to keep it concise and relevant. The memory file should then be referenced by pathname as required context in the claude.md file.
- Prompt reflection on task completion - Include instructions for claude to reflect on the completion of each task and update the memory file with the reflection. The reflection should include what was learned, what could be improved, and any other relevant insights. In particular if the user was frustrated, gave feedback, or had other issues indicated in the chat, the reflection should include recommended improvements to the Claude.md file to address those issues. 
2. The file should be written in markdown format and should be easy to read and understand.
3. The file should be placed in the root directory of the repository.
4. Once the file is created, create a new branch called `feature-claude-md` and switch to it.
5. Add the claude.md file to the git repo and commit it with the message "Add claude.md file with repository overview and best practices".
6. Push the feature-claude-md branch to the remote repository.
7. Create a new pull request from the feature-claude-md branch to the main branch.
8. Add a detailed description to the pull request explaining the purpose of the claude.md file and how it will help in the workshop.
9. Ensure the pull request passes the CI/CD pipeline
10. Once the pull request is approved, merge it into the main branch.

---

# Tests for the Application

## Feature: Add Tests for the Application
The goal is to add tests for the application to ensure that it works as expected. We will use Playwright for end-to-end testing.
1. Create a new issue in the repository titled "Add Tests for the Application". Update the Issue with the details of the feature.
2. Create a new branch called `feature-<issue-number>add-tests` and switch to it.
3. Think carefully about how to implement this feature. You will need to:
   - Ensure tests for each major feature of the application
   - Use Playwright to simulate user interactions and verify the application behaves as expected
   - Ensure test fixtures for setting up the application state before tests run
   - Ensure tests can be run in a CI/CD pipeline
   Once you have thought carefully and made a plan for the implementation, update the issue with your plan.
4. Implement the feature according to your plan.
5. Test the feature to ensure that it works as expected. Use the Playwright MCP service to test the changes.
6. Update the issue with the details of the implementation and how to test it.
7. Create a pull request from the feature branch to the main branch. Update the PR with the details of the implementation and how to test it.
8. Ensure the tests pass in the CI/CD pipeline. You can use the "gh workflow run list" command to check the status of the workflow runs.
9. Once the tests pass, merge the pull request into the main branch.

---

# Intentionally introduce a bug in the code that causes an exception 

## Feature: Introduce a Bug for Workshop

The goal is to introduce a simple bug that will cause an exception when the user interacts with the visualization. This will later be used to invoke an improvement loop. 

The Bug: Tooltip Error on Nodes Without File Extensions
What happens: When hovering over a node representing a file without an extension (like README, LICENSE, or Dockerfile), the tooltip code throws an error because it tries to call .split('.') on the filename and access an array index that doesn't exist.

hypothestical example - 
How to introduce it: In the index.html file, modify the handleMouseOver function:
javascriptfunction handleMouseOver(event, d) {
  // Highlight connected nodes
  link.classed("highlighted", l => l.source === d || l.target === d);
  
  // Get file extension for the tooltip
  const extension = d.name.split('/').pop().split('.')[1].toUpperCase();
  
  // Show tooltip
  tooltip.style("opacity", 1)
    .html(`<strong>${d.name}</strong><br>Group: ${d.group}<br>Type: ${extension} file`)
    .style("left", (event.pageX + 10) + "px")
    .style("top", (event.pageY - 10) + "px");
}

Why it's a good workshop bug:

Easy to trigger: Just hover over any file without an extension (very common in projects)
Plausible: This is a classic "forgot to check if array element exists" bug
Non-breaking: The graph still works, you can still drag nodes, analyze paths, etc.
Visible error: Shows up in console as Cannot read property 'toUpperCase' of undefined
Good learning opportunity: Teaches defensive programming and null checking

## Workflow to follow:
1. Create a new issue in the repository titled "Introduce a Bug for Workshop". Update the Issue with the details of the bug to be introduced. Think carefully and make a detailed plan for how to introduce the bug. make a todo list of the steps to follow. 
2. Create a new branch called `bug-<issue-number>introduce-bug` and switch to it.
3. Implement the changes to introduce the bug. Follow the steps in your todo list. 
4. Test the changes to ensure the bug is present and can be triggered. Use the playwright MCP service to test the changes.
5. Update the issue with the details of the bug and how to trigger it.
6. Create a pull request from the bug branch to the main branch. Update the pull request description with the details of the bug and how to trigger it.

---

# Add a feature to capture all stacktraces and start a new issue branch for each stacktrace

## Feature: Capture Stacktraces during Observations

Our goal is to ensure that any time there is an error in the code that causes an exception, we capture the current state, the stacktrace of the exception, and any relevant context. The code must then use the `gh issue create` command to create a new issue in the repository with this information. Then the code must assign that issue to Copilot.
This code should be in a separate module from the main program - it is meant to be a wrapper around the existing code to enhance it with error handling and issue creation.
To implement this feature, follow these steps:
1. Create a new issue in the repository titled "Capture Stacktraces during Observations". Update the Issue with the details of the feature.
2. Create a new branch called `feature-<issue-number>capture-stacktraces` and switch to it.
3. Think carefully about how to implement this feature: the code you create will need to:
   - Wrap the main program logic to catch all exceptions. Ensure that the exceptions can eventually be surfaced to an error or other handler as needed.
   - Capture the stacktrace and relevant context in the catch block.
   - Capture the current state of the application, including any relevant variables or data structures.
   - The code will need to use the `gh issue create` command to create a new issue with the captured information, including instructions to Copilot that it should build a failing test for the issue and then Copilot should fix the issue in a new PR.
   - The code will then need to assign the issue to Copilot.
   Once you have thought carefully and made a plan for the implementation, update the issue with your plan. Include a todo list of the steps to follow.
4. Implement the feature according to your plan, following the steps in your todo list.
5. Test the feature to ensure that it captures stacktraces correctly and creates issues as expected. Use the playwright MCP service to test the changes.
6. Update the issue with the details of the implementation and how to test it.  
7. Create a pull request from the feature branch to the main branch. Update the PR with the details of the implementation and how to test it.
8. Ensure the feature works correctly in the CI/CD pipeline. You can use the "gh workflow run list" command to check the status of the workflow runs.
9. Do not merge the pull request yet. 

---

# Add a feature - keypress to capture screenshot and allow user to annotate it. Create new issue based on the screenshot and annotations.

## Feature: Capture Screenshot and Annotate
The goal is to add a feature that allows users to press a key to capture a screenshot of the current visualization, annotate it, and create a new issue in the repository with the screenshot and annotations. This will help in reporting bugs or suggesting enhancements visually.  When running the application, the user should be able to press the "s" key to capture a screenshot and annotate it. When the screenshot is captured, show it in a modal dialog and allow the user to add annotations. Use a text box for the user to enter their annotations. Then update the screenshot with red overlay text with the annotations. The code should then create a new issue in the repository with the screenshot and annotations, and assign it to Copilot.
1. Create a new issue in the repository titled "Capture Screenshot and Annotate". Update the Issue with the details of the feature.
2. Create a new branch based on the previous stacktrace branch called `feature-<issue-number>capture-screenshot` and switch to it.
3. Think carefully about how to implement this feature. The code you create will need to:
   - Capture a screenshot of the current visualization when the user presses a specific key (e.g, "s").
   - Display the screenshot in a modal dialog.
   - Allow the user to add annotations to the screenshot using a text box.
   - Overlay the annotations on the screenshot in red text.
   - The code will need to use the `gh issue create` command to create a new issue with the screenshot and annotations, including instructions to Copilot that it should review the screenshot and annotations, and then implement improvements or fixes.
   - The code will then need to assign the issue to Copilot.
4. Once you have thought carefully and made a plan for the implementation, update the issue with your plan. Include a todo list of the steps to follow.
5. Implement the feature according to your plan, following the steps in your todo list.
6. Test the feature to ensure that it captures screenshots and annotations correctly, and creates issues as expected. Use the playwright MCP service to test the changes.
7. Update the issue with the details of the implementation and how to test it.
8. Create a pull request from the feature branch to the main branch. Update the PR with the details of the implementation and how to test it.
9. Ensure the feature works correctly in the CI/CD pipeline. You can use the "gh workflow run list" command to check the status of the workflow runs.
10. Do not merge the pull request yet.

