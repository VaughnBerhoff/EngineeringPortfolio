# Engineering Portfolio Website Generator
This is a portfolio website generator for mechanical engineers that automatically creates a website for you. It assumes a very limited understanding of software development and walks you through the [setup](#setup) process. No coding necessary, just simply [edit the configuration](#how-make-changes) files and your website is done.

It is highly customizable and even supports your own **3d models**!

After viewing the website locally, when you are ready for the website to be live go [here](#how-to-deploy). There is an automatic setup as part of this that will use GitHub pages to host it for free and update when you make changes.

# Setup

## Install
You only need to install Node.js to get started. Node.js is a javascript runtime environment and is what allows the code to run outside of a browser so that you can configure the website. You can install it however you like, but if this is your first time installing a development tool like this I recommend following the [official download instructions](https://nodejs.org/en/download).

Simply run the install commands that they provide in your terminal and it will be done *(recommended)*. Or you can select your operating system and architecture at the bottom and download a prebuilt version with the left green button.

Once this is done you can validate that node is installed correctly by running `node -v` in your terminal which will output the version of node installed.

## Fork the Repository
Create your own copy of the project by forking the repository on GitHub (the fork button should be in the top right). This gives you full control to make changes and setup your website. Once you do this you will have your own copy of the project on GitHub.

The next step is to bring it down to your computer so you can make edits. This can be done with `git` which should come preinstalled on your computer. On GitHub click on the green code button and copy the `git` url for the repo, it will look something like this: `https://github.com/YOUR_USERNAME/REPO_NAME.git`.

Now uses this to bring down the code by running this command in your terminal (replaced with your url):
```bash
git clone https://github.com/YOUR_USERNAME/REPO_NAME.git
```
After this, if you are able to see a new folder `EngineeringPortfolio` (or whatever you renamed the project to) then you have successfully done it!

## Local development
Open this new folder in your favorite IDE. If you have never used one before try [VS Code](https://code.visualstudio.com/). This just serves as an easy way to edit the files. 

Open an integrated terminal (if using VS Code use `Ctrl/Cmd + Shift + P` -> type "terminal" -> select "Terminal: Create New Terminal").

Then setup the project by running `npm i`. This installs all dependencies and sets up the code to be ready to run.

To see a local version of the website run `npm run dev`. This will produce a local link to open in your browser and see a live local version of the website. Any time you make changes you will see it updated while this is running. To stop it click into the terminal and use `Ctrl + c`.

**Note: If there are ever any problems the first thing to try would be running each npm command again.**

# How Make Changes

You never need to touch the code. Just edit a config file, save it, and the code is handled behind the scenes for you. Because of this there are only two folders that you need to worry about `content` and `static`. You will edit files in `content` and drop your own files in `static`.

## `content`
This is where you make changes to the website. All parts of each page can be changed simply by writing in the `toml` for that page. Don't worry if you have never heard of `toml` before, think of it simply as a more structured text file (they will be very easy to edit). 

Go ahead and take a look at the different `toml` files in content to get an idea of them. You can start by changing the values and reordering the sections to see what happens, or checkout the full definitions below.

Here is provided all definitions of everything that can be changed on each page and explanation of its file:
- [website level changes](#sitetoml---configures-website-level-changes)
- [home profile page](#hometoml---configures-the-home-profile-page)
- [projects page](#projectstoml---configures-the-projects-page)
- [experience page](#experiencetoml---configures-the-experience-page)
- [skills page](#skillstoml---configures-the-skills-page)
- [resume page](#resumetoml---configures-the-resume-page)

### `site.toml` - configures website level changes  
Change the title in the tab bar of the website simply by changing what `title` equals:
```toml
title="Website Title" 
```
Change the icon in the tab bar by changing what `icon` equals:
```toml
icon="material-symbols:web-sharp"
```
**Where did this icon name come from? ->** for the icons across the whole website there is a large list of possible icons and their names that you can pull from. For the full list go [here](#using-an-icon).

Control the navbar by adjusting the appropriate navbar section.
```toml
[navigation.profile]
enabled=true
name="John Doe"
icon="devicon:bash"
```
All three of these act as you would expect. Set `enabled` to false if you want to turn off the page. Change the name of the page in the navbar with `name` and change the icon with `icon`.

### `home.toml` - configures the home profile page
Change your name or description with:
```toml
name="John Doe"
description="This is my portfolio."
```
Set a profile photo with:
```toml
photo="profile.png"
```
Just place the image that you want to use in the `static` folder and then set `photo` to the name of the image and it will find it.

Add as many or as little contact methods as you want by adding or removing a `[[contact]]` section that looks like this:
```toml
[[contact]]
name = "GitHub"
link = "https://github.com/"
icon = "devicon:github"
# color = "#000000"
```
For each contact you can set all of these values with the `icon` and `color` properties being **optional**. This means that you don't need to include them. `color` is set with a hex color value. You can easily find any color in hex online or convert one, but if you are looking for a color picker: [here](https://htmlcolorcodes.com/color-picker/). *(Don't forget the # in the color.)*


### `projects.toml` - configures the projects page
You can add as many project cards as you want, and each one is fully customizable with its own grid system. Add a new project like this:
```toml
[[project]]
type = "large"
total_rows = 6
total_cols = 6
# bg_color="#FFF"
# border_color="#FF0000"
# shadow_color="#FF0000"
```
The card can be `large` or `small` which changes the size. Then define how many rows and columns you want available on the grid. Additionally, set an optional background color, border color, or shadow color.

To add an item to the grid for a project just place a `[[project.grid_item]]` below the `[[project]]` it belongs to like this:
```toml
[[project.grid_item]]
rows = 1
cols = 2
type = "title"
content="Project Title"
# bg_color= "#000"
# text_color= "#fff"
```
Simply determine how many `rows` and `cols` on the grid you want the item to take up. You can add as many items as you want. The system will auto place items starting from left to right then top to bottom. Also, set an **optional** background or text color.

#### Grid Item Content
Every `grid_item` will always have a `content` section but how this acts changes based on the `type`. The different types are title, text, image, video, or model. 

`title` makes the `content` text large like a title. Example usage: 
```toml
[[project.grid_item]]
rows = 1
cols = 2
type = "title"
content = "Project Title"
```
`text` makes the `content` text act like normal size text. Example usage:
```toml
[[project.grid_item]]
rows = 2
cols = 2
type = "text"
content = "Lorem ipsum dolor..."
```
`image` looks for an image file in the `static` folder with the `content` name. *Don't forget to put the image you want to use in the `static` folder.* Example usage:
```toml
[[project.grid_item]]
rows = 1
cols = 1
type = "image"
content = "image_name.jpg"
```
`video` will use a YouTube video link in `content` to embed the video in the website. It supports all different YouTube link formats or you can even just use the video ID. Example usage:
```toml
[[project.grid_item]]
rows = 3
cols = 4
type = "video"
content = "https://www.youtube.com/watch?v=xvFZjo5PgG0"
``` 
`model` looks for a model file in the `static` folder with the `content` name. It expects it to be a `.glb` file with an optional explosive view animation on it. For info on how to convert your 3d model into a `.glb` file checkout [this section](#adding-your-3d-models). *Don't forget to put the image you want to use in the `static` folder.* Example usage:
```toml
[[project.grid_item]]
rows = 4
cols = 4
type = "model"
content = "bucket_punch.glb"
bg_color= "#000"
text_color= "#fff"
```

### `experience.toml` - configures the experience page
This is configured almost exactly the same as the projects page because it uses the same customizable [project card system](#projectstoml---configures-the-projects-page). However it also lets you make sections out of them so that you can showcase projects that were done for specific companies. Or get creative with it and show off your work experience however you like.

Simply define a work experience section with `[[experience]]`:
```toml
[[experience]]
company = "Company Name"
position = "Position Held"
timeline = "Aug. 2024 - Sep. 2025"
```
Every experience section gets a `company`, `position`, and `timeline` which you can fill in and will go in experience section divider. Then place unlimited projects as part of a work experience. 

To place a new project card as part of a work experience just add one like this:
```toml
[[experience.project]]
type = "small"
total_rows = 6
total_cols = 6
# bg_color="#FFF"
# border_color="#FF0000"
# shadow_color="#FF0000"
```
Then similar to before to add an item to the project card grid:
```toml
[[experience.project.grid_item]]
rows = 2
cols = 2
type = "text"
content = "Lorem ipsum dolor..."
```
All the controls and options are the same as before.

### `skills.toml` - configures the skills page
You can organize all your skills into different sections. Define a skills `[[section]]` like this:
```toml
[[section]]
name = "Programming Languages"
```
The `name` will appear at the top of the section above all the skills. Add as many sections as you want, but each section mush have at least one skill in it.

Add a skill to a section like this:
```toml
[[section.skill]]
name = "Rust"
icon = "devicon:rust"
# icon_size = 72
color = "#FF0000"
```
Each skill will have a `name`, an optional `icon`, and optional `icon_size` which defaults to 64 if not defined, and an optional `color`. The `color` is used for the icon and highlight color.

**Where did this icon name come from?** -> for the icons across the whole website there is a large list of possible icons and their names that you can pull from. For the full list go [here](#using-an-icon).

### `resume.toml` - configures the resume page
```toml
title="My Resume"
url="sample_resume.pdf"
```
The `url` is the name of the resume file. Use any resume pdf you want and simply drop the file in the `static` folder. The website will automatically find it and show it as long as the name is the same.

The `title` is currently only used for screen readers and not super important.

# Using an Icon
There are over 100,000 icons for you to choose from. You can use this [website](https://icones.js.org/collection/all) as a simple way to search for anything you want. 

Then once you find the icon you want just copy its name. The name will look something like this `material-symbols:work-outline` which defines where the website should pull the icon from. 

Everything is handled for you. Just copy and paste the icon names to use any icon. (If you ever have a problem after trying to add an icon you may have accidentally used a name that doesn't exist.)

*Note: if you use an icon that already has a color then setting the color won't do anything.*

# How to Deploy
The first setup is to turn on the website. Go to the settings tab in the top bar of the repository in GitHub. Go to the pages section and change the source of "Build and deployment" from `Deploy from a branch` to `GitHub Actions`. Then go to the actions tab and click the green enable workflows button.

Now the last step is to send the local changes that you have made to GitHub. As discussed earlier `git` to do this (the same thing used to get the code down in the first place). 
```bash
git add .
git commit -m "website updates"
git push
```
In an integrated terminal run the three above commands. This uses `git` to save your changes and send them to GitHub. (You can make the commit message anything it doesn't matter.)

Any time you want local changes to update on the live website that everyone can see just rerun those commands to send up the new changes. The website will auto deploy. (*If it fails to deploy that means there is something wrong with your changes, test them locally to verify functionality first.*)

**Where is the website?**  
Go back to the pages section of settings and you will see "Your site is live at https://[USERNAME].github.io/EngineeringPortfolio". Now anyone can go to the link and see your website!

**How to customize the link?**  
This is slightly more complicated of a step and requires purchasing a domain. This will not be included as part of the instructions at this time, but if you are adamant about this here are some [resources from GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) about linking one.

# Adding Your 3D Models
guide coming soon...