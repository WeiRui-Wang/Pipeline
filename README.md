# Project M1 - Pipelines

## INDEX
- [Project Overview](#project-overview)
- [YAML Format](#yaml-build-job-specification-format)
- [Env Format](#env-file-format)
- [Screencast](#screencast)
- [Report](#report)
- [Commands](#available-commands)



### Project Overview
Provision and run tasks inside a computing environment from a host machine by designing a pipeline. 

### YAML Build Job Specification Format
+ Our parser for YAML build job specification supports the formatting as shown below. 
+ `setup` consists a list of enviroment setup commands and packages to be installed before the job execution.
+ `jobs` consists of list of jobs will be run after `setup`.



+ Each item in `jobs` must have `name` and `steps`, and `steps` can consists a list of steps that has `name` and `run` for each step within `steps` list.
+ Each item from `setup` must be following same level of indentation as shown below, and fall within 3 major general format.
  + **APT**: package names under `apt`, each in an individual line.
  + **URL**: URLs that can be downloaded without credential and token requires. Otherwise, include the command under `jobs`.


Example:
```
setup:
  apt:
    - npm
    - wget
    - maven
  url:
    - https://github.ncsu.edu/engr-csc326-staff/iTrust2-v10
jobs:
  - name: build-itrust
    steps:
      - name: Move out repository
        run: sudo mv iTrust2-v10/iTrust2/ ./
      - name: iTrust2 mvn build
        run: cd iTrust2 && mvn --batch-mode --update-snapshots clean test
      
```



### Env File Format
Purpose: Pass sensitive setup information to the pipeline via  a `.env` file. 

Set Up: 
1. Create a .env file accessible to the repo based on [`.env.template`](https://github.ncsu.edu/CSC-DevOps-S22/DEVOPS-23/blob/main/.env.template)
2. Generate and update with a personal [access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) 

3. Information automatially stored:
- VM Connection Information

Potential Error:
 "You should have a .env containing project specific environment variables"

Solution: Create .env file



### Screencast
[Project M1 - Screencast]()


### Report
[Checkpoint-M1 Report](https://github.ncsu.edu/CSC-DevOps-S22/DEVOPS-23/blob/main/CHECKPOINT-M1.md)

Milestone Report: TODO


### Available Commands
```
npm install
```

```
pipeline init
```

```
pipeline build itrust-build build.yml
```



### Team Members
- Jessica Vargas (jrvargas)
- Kewen Peng (kpeng)
- WeiRui Wang (wnwang)
