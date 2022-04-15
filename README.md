# Project M2 - Pipeline: Test & Analysis

## INDEX
- [M2 Project Overview](#m2-project-overview)
- [M2 Build Job Specification](#m2-build-job-specification)
- [M2 Mutation Coverage](#m2-mutation-coverage-approach)
- [M2 Report](#m2-report)
- [M2 Commands](#m2-commands)
- [M2 Screencast](#m2-screencast)
- [`.env` File Format](#env-file-format)

### M2 Project Overview

The goal of the analysis is to calculate the mutation coverage of a test suite. For mutation coverage with snapshot testing, our M2 implementation will be utilizing [Checkbox Marqdown Microservice](https://github.com/chrisparnin/checkbox.io-micro-preview) module to render and facilitate difference comparison.

For M2 milestone, all previous capability of M1 were retained and module was expanded based on M1. [`.env` File Format](#env-file-format) standard as describe in M1 documentation is still applicable.

### M2 Build Job Specification

In addition to maintaining the previously defined compatible build job specification for M1, the new feature capability introduced new standards for how current M2's iteration of [`build.yml`](build.yml) is defined.

Major changes are listed as follow:
* As part of the new job specification added as shown in the following snippet, for `mutation-coverage`, the existing feature of interpreting `steps` are still compatiable.
* As shown below, for `mutation-coverage`, basic structure setup is necessary to construct an environment such that are compatible with the newly implemented mutation coverage feature.
* For all job, an **optional** `mutation` can be used to configure the mutational coverage properties.
* For an `mutation`, `microservice`, `renderer`, `driver`, `iterations`, and list of `snapshots` are **mandatory**.
* `microservice` is the name of microservice module folder that is used for rendering. `steps` will runs first to setup for all necessary to facilitate the use within the VM.
* `renderer` is the name of key components that is used by the microservice module, which will be modified by `driver` to allows the testing of mutational coverage.
* `driver` is the name of the **node** module `*.js` file without postfix, as defined in `steps` that resided in `/drivers/` folder, to facilitate the mutation of the `renderer`.
* `iterations` is the number of iterations of **comparable** mutations modification in total that the mutational coverage module should be ran.
* `snapshots` is the list that consists of the target test suites to be rendered for each of the mutational coverage iteration.

```
  - name: mutation-coverage
    steps:
      - name: Check out microservice module
        run: git clone https://github.com/chrisparnin/checkbox.io-micro-preview.git
        rebuild: false
      - name: Install microservice module
        run: cd checkbox.io-micro-preview/ && npm install
      - name: Preparing mutation driver
        run: cp /bakerx/drivers/mutation ./mutation.js
        rebuild: true
      - name: Preparing mutation module
        run: cp /bakerx/package.json ./
        rebuild: true
      - name: Install mutate module
        run: npm install
    mutation:
      microservice: checkbox.io-micro-preview
      renderer: marqdown.js
      driver: mutation.js
      iterations: 1000
      snapshots:
        - http://localhost:3000/survey/long.md
        - http://localhost:3000/survey/upload.md
        - http://localhost:3000/survey/survey.md
        - http://localhost:3000/survey/variations.md
```

Keep in mind, `steps` is a globally usable and **mandatory** for each of the build job, even if the property can be empty, the `steps` property is still mandatory to be in place as defined by previous iteration of implementation [M1 Build Job Specification](#build-job-specification) for M1.

### M2 Mutation Coverage Approach
Mutation operators considered:

    Conditional boundary mutations: > => >=, < => <=
    Incremental mutations: ++j =>j++, i++ => i--
    Negate conditionals: == => !=, > => <
    Mutate control flow if => else if
    Conditional expression mutation && => ||, || => &&
    Clone return, early Find: return embeddedHtml;, copy and insert in random location of function (before declaration).
    Non-empty string: "" => "<div>Bug</div>".
    Constant Replacement: 0 => 3

### M2 Report
|Issue| Description|Resolution|
|---|---|---|
|Understanding microservice|   | 
|Understanding and orchestrating the different components of the project including markdown file, build file, and mutation |  | 
|Updating the build.yml file |  | 
|Updating the parser | | 
|Creating mutation.js | |
|Test harness| |

### M2 Commands

To run and execute newly implemented M2 module, clone the current repository and locate into the repository folder and run the following commands in sequence.
```
npm install
npm link

pipeline init
pipeline build mutation-coverage build.yml
```
Notes: all previous M1 features are still compatible. Refer to [Available Commands](#available-commands) for details of M1 features and compatible commands.

### M2 Screencast
[Project M2 - Screencast]()


# Project M1 - Pipelines

## INDEX
- [Project Overview](#project-overview)
- [Build Job Specification](#build-job-specification)
- [`.env` File Format](#env-file-format)
- [Screencast](#screencast)
- [Report](#Checkpoint-Report)
- [Commands](#available-commands)



### Project Overview
Provision and run tasks inside a computing environment from a host machine by designing a pipeline. 

### Build Job Specification
+ Our parser for YAML build job specification supports the formatting as shown below. 
+ `setup` consists a list of enviroment setup commands and packages to be installed before the job execution.
+ `jobs` consists of list of jobs will be run after `setup`.



+ Each item in `jobs` must have `name` and `steps`, and `steps` can consists a list of steps that has `name` and `run` for each step within `steps` list.
  + Within each `step` item, optional parameters `env` and `rebuild` can be used.
  + `env` indicate the enviroment variable that should be retrived from the `.env` file as predefined, within yml file, optional `env` flag is stored as list as shown in example below.
  + `rebuild` indicate the step that is going to run after the initial build run so that during rebuild, original initial enviroment setup steps can be skipped so it is more dynamic.
+ Each item from `setup` must be following same level of indentation as shown below, and fall within 3 major general format.
  + **APT**: package names under `apt`, each in an individual line.
  + **URL**: URLs that can be downloaded without credential and token requires. Otherwise, include the command under `jobs`.


Example:
```
setup:
  apt:
    - npm
    - wget
  url:
    - {someURL}
jobs:
  - name: itrust-build
    steps:
      - name: Source setup
        run: curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
      - name: Set up MariaDB
        run: sudo docker run --name mariadbtest -e MYSQL_ROOT_PASSWORD=$MYSQL_PW -p 3306:3306 -d docker.io/library/mariadb:10.4
        env:
          - MYSQL_PW
        rebuild: true
```



### `.env` File Format
Purpose: Pass sensitive setup information to the pipeline via  a `.env` file. 

Set Up: 
1. Create a .env file accessible to the repo based on [`.env.template`](https://github.ncsu.edu/CSC-DevOps-S22/DEVOPS-23/blob/main/.env.template)
2. Generate and update with a personal [access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) 

3. Include and update password for MYSQL


Potential Error:
 "You should have a .env containing project specific environment variables"

Solution: Create .env file



### Screencast
[Project M1 - Screencast](https://drive.google.com/file/d/1UPVj7Uas5lhsdQGUdF01SWkZLxz2Uhlz/view?usp=sharing)


### Checkpoint Report
[Checkpoint-M1 Report](https://github.ncsu.edu/CSC-DevOps-S22/DEVOPS-23/blob/main/CHECKPOINT-M1.md)

### Milestone Report

|Issue| Description|Resolution|
|---|---|---|
|Setting Up the Pipeline| There were multiple discussions about how different components of the pipeline would interact and communicate with each other including Host Machine, Virtual Machine, Environment Variables, Parser and the jobs required to build iTrust.  | Pipeline design consisted of creating the VM using bakerx followed by setting up environment settings which are accessible to the parser which converts the build.yml instructions and builds iTrust. 
|Set up Tools | Consideration of multiple tools available to setup java based programs including Ansible and Jenkins. Had to consider constrains and convertion of yml files to readible files by program doing the setup. | Decided to implement a simple parser that takes a yml file as input and converts it to executable scripts within the VM. 
|Create a Dynamic Build | Multiple discussions on what the build file should contain to ensure iTrust can be built properly and automatically. | Included all the build requirements per iTrust documentation while keeping most of the work on the build file instead of the parser. Post-build clean up is also considered within the build file. |



### Available Commands
```
npm install
npm link
```
```
pipeline init
pipeline build itrust-build build.yml
```



### Team Members
- Jessica Vargas (jrvargas)
- Kewen Peng (kpeng)
- WeiRui Wang (wnwang)
