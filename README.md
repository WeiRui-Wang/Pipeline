# Project M2 - Pipeline: Test & Analysis

## INDEX
- [M2 Project Overview](#m2-project-overview)
- [M2 Mutation Coverage](#m2-mutation-coverage-approach)
- [M2 Report](#m2-report)
- [M2 Commands](#m2-commands)
- [M2 Screencast](#m2-screencast)
- [`.env` File Format](#env-file-format)

### M2 Project Overview

### M2 Mutation Coverage Approach

### M2 Report

### M2 Commands

### M2 Screencast


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



### Available Commands For Running
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
