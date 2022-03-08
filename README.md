# Project M1 - Pipelines

## Project Overview
Provision and run tasks inside a computing environment from a host machine by designing a pipeline. 

## YAML Build Job Specification Format
+ Our parser for YAML build job specification supports the formatting as shown below. Majorly, `jobs`, which consists of list of jobs will be run after `setup`, which consists a list of enviroment setup commands and packages to be installed before the job execution.
+ Each `jobs` must have `name` and `steps`, and `steps` can consists a list of steps that has `name` and `run` for each step within `steps` list.
+ Each entry from `setup` must be following same level of indentation as shown below, and fall within 4 major general format.
  + `{ package: mysql, version: 8.0, param: $ENV_VAR_PRMTS }` that has package name, version, additional parameters, which able to parsed from enviromental variables, available.
  + `apt-get install mysql -y` direct setup commands.
  + `java11, nodejs, wget` that use comma seperate the list of packages to be install within setup.
  + `URL=https://github.ncsu.edu/engr-csc326-staff/iTrust2-v10` GitHub Repository URL of which will be pulled and downloaded, for which the action will use corrosponding user credentials as pre-defined within `.env` file beforehand.


Example:
```
setup:
  - { package: mysql, version: 8.0, param: $ENV_VAR_PRMTS }
  - apt-get install mysql -y
  - java11, nodejs, wget
  - URL=https://github.ncsu.edu/engr-csc326-staff/iTrust2-v10

jobs:
  - name: build-itrust
    steps:
      - name: iTrust2 mvn build
        run: cd iTrust2 && mvn --batch-mode --update-snapshots clean test
```


## Deliverables

### Env. File Set Up
Purpose: Pass sensitive setup information to the pipeline via  a `.env` file. 

Set Up: 
1. Create a .env file accessible to the repo based on `.env.template`
2. Generate and update with a personal [access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) 

3. Information automatially stored:
- VM Connection Information

Potential Error:
 "You should have a .env containing project specific environment variables"

Solution: Create .env file



### Screencast
[Project M1 - Screencast]()

TODO
- create screencast
- update README with screencast link (ensure it is accessible)

### Reports
[Checkpoint-M1 Report](https://github.ncsu.edu/CSC-DevOps-S22/DEVOPS-23/blob/main/CHECKPOINT-M1.md)

Milestone Report: TODO


### Available Commands
```
npm install
```

```
node index.js init
```

```
node build itrust-build build.yml
```

## Project Evaluation
|Project Task | Points |
|----|----|
|Automatically provision and configure a build server |20%|
|Create a build job specification |20%|
|Automatically configure a build environment for given build job specification |30%|
|Checkpoint and milestone report |20%|
|Screencast |10%|

## Team Members
- Jessica Vargas (jrvargas)
- Kewen Peng (kpeng)
- WeiRui Wang (wnwang)
