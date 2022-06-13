# Pipeline - Build, Test, Analysis, Deployment

A dynamic adaptable pipeline tool that powered automation across Build, Test, Analysis, and Deployment stages for Agile DevOps.

## INDEX

- [F0 Overview](#f0-overview)
- [F0 YML Specification](#f0-yml-specification)
- [F0 Flame Graph Feature](#f0-flame-graph-feature)
- [F0 Pipeline Design](#f0-pipeline-design)
- [F0 Commands](#f0-commands)
- [F0 `.env` File Format](#f0-env-file-format)
- [F0 Screencast](#f0-screencast)

### F0 Overview

F0 will utilize and further extends pipeline capabilities from [M1](#project-m1---pipelines)
and [M2](#project-m2---pipeline-test--analysis) milestone to facilitate the building, testing and the deployment of 2
two different open source projects with different technology stack of node.js
based [reveal.js](https://github.com/hakimel/reveal.js)
and python based [dice-on-demand](https://github.com/srujandeshpande/dice-on-demand), both with web interface that can
demonstrate the successful deployment. After deployment, [reveal.js interface](http://192.168.56.10:8000/)
and [dice-on-demand interface](http://192.168.56.10:5000/) will be accessible.

Additionally, [flame graph generation](#f0-flame-graph-feature) will also be added and demonstrated along within one of
the pipeline job specification. All previous capability of M1 and M2 were retained and module was expanded from M2's
iteration of implementations.

Along with the new features introduced, new feature for F0 were also added and documented
in [F0 YML Specification](#f0-yml-specification).

Further adaptation and modification was in place to ensure capability of multi-stage pipeline across deployment process,
such that pipeline now supports the building, testing, and deployment for all jobs with categorized steps.

Detailed documentations and report sections can be referred as below. The screencast for F0 can be quickly navigated
in [F0 Screencast](#f0-screencast).

### F0 YML Specification

In addition to maintaining the previously defined compatible build job specification for M1 and M2, the new feature
capability introduced new standards for how current iteration of [`F0.yml`](F0.yml) is defined.

Major changes are listed as follows:

* Similar to the `env` option defined in M1's [Build Job Specification](#build-job-specification), for all job steps,
  an **optional** dynamic config environment variable `config` can be defined. With the `config`
  dynamic variable element, the variable such as `ip` can be parsed from `bakerx.yml` and use for reference and
  deployment job steps. Different from `env` option standard, `config` only contains a single variable instead of a list
  of dynamically parsable variables.
* A boolean flag option `deploy` were also added to the yml job specification to indicate the steps that will be used
  for deployments with `deploy` stage of the pipeline module only.
* A boolean flag option `test` were also added to the yml job specification to indicate the steps that will be used for
  testing with `test` stage of the pipeline module only.
* An **optional** parsable `flamegraph` option were also added as part of the step with `test` flag option to be`true`
  to facilitate the configurations of the [flame graph feature](#f0-flame-graph-feature). When `flamegraph` is in used,
  the parameters of `hertz` in integer, `delay` in integer, and `filename` in string must be defined as example provided
  below.
    * `hertz` in integer, is the frequency in hertz that will be used for `perf` record collection.
    * `delay` in integer, is the time length in second that will be used for the timeframe delay used to collect
      the `perf` record.
    * `filename`: in string, is the file name that will be both saved and transfer to the [assets directory](/assets).

```yaml
jobs:
  - name: reveal.js
    steps:
...
- name: Testing reveal.js
  run: cd reveal.js && npm test
  test: true
  flamegraph:
    hertz: 99
    delay: 9
    filename: _flamegraph
...
```

Further details and example output of [flame graph feature](#f0-flame-graph-feature) can be found in the following
section.

### F0 Flame Graph Feature

In additional to the deployment pipeline, within F0, flame graph generation feature was also added to the pipeline
utility. For F0 iteration, the flame graph generation configurations can be defined in YAML to enable the feature as
mentioned from previous section.

Since the pipeline stage were modulated into `build`, `test`, and `deploy` step, the current frame graph generation can
support the generation when the step of job specification defined when the flag `test` set the `true`.

Additionally, the section of `flamegraph` along with **mandatory** configuration parameters is necessary for the flame
graph generation feature to work. Further details can be found in the new build job specification standard
for [F0 Jobs Specifications](#f0-yml-specification).

An output file with the current defined configurations from yml for the flame graph as shown in screenshot below can
also be view at [/assets/_flamegraph.svg](assets/_flamegraph.svg). Furthermore, [F0 Screencast](#f0-screencast) will
also include the showcase of the flame graph generation output in real time.

![image](https://media.github.ncsu.edu/user/19024/files/1452ead2-47f5-4d59-b77b-fbe8acd4e6e3)

### F0 Pipeline Design

For the deployment of the pipeline, F0 implemented a transport and link deployment strategy. The pipeline design are
shown as below.

![image](https://media.github.ncsu.edu/user/19024/files/ebd7fe5a-9ca6-45d9-ab01-9fd958b06d7a)

All components that will be using during the deployment process for the defined tasks as defined in jobs specification
are also included as related details and can be found in [F0 Commands](#f0-commands).

### F0 Commands

For defined yml, `deploy` option is neither mandatory nor supported in `build` module. `deploy` and `rebuild` flag are
mutually exclusive and for `deploy` to work properly the `deploy` should be the only presence.

Since deployment strategy that used by the `deploy` module is a transport and link deployment, before running `deploy`
module, ensure corresponding `post-receive` and `pre-commit` assets are presented in [assets](/assets) root folder under
the name of the job name folder structure such as [reveal.js](/assets/reveal.js) folder.

```
npm install
npm link
pipeline init
pipeline build dice-on-demand F0.yml
pipeline build reveal.js F0.yml
pipeline test dice-on-demand F0.yml
pipeline test reveal.js F0.yml
pipeline deploy dice-on-demand F0.yml
pipeline deploy reveal.js F0.yml
```

As an alternative, following commands are also available.

```
npm install
node index.js init
node index.js build reveal.js F0.yml
node index.js test reveal.js F0.yml
node index.js deploy reveal.js F0.yml
node index.js build dice-on-demand F0.yml
node index.js test dice-on-demand F0.yml
node index.js deploy dice-on-demand F0.yml
```

Overall, above commands are supported and can be used to run all the pipeline features as defined. With the basic setup
commands on host such as `npm install`, `npm link` and `init`, the sequence of `build`, `test`, and `deploy` can be
interchange, however it is worth-noting that `build` must be run before either `test` or `deploy` run.

Furthermore, multiple edge case check is in place to enable dynamic checking and ensure the integrity of the environment
and validity of the process logic flow as implemented in the pipeline modules.

### F0 `.env` File Format

As defined in [M2 `.env` File Format](#m2-env-file-format) and M1's [`.env` File Format](#env-file-format) section,
setup process are described as below for `.env` file. For F0, neither automatic tracking nor manually setup env
variables were added. Additionally, [`.env.template`](.env.template) are also provided from M1's template as a way to
maintain compatibility of previously available features as quoted below for quick reference and setup.

```
Setup:
1. Create a .env file accessible to the repo based on `.env.template`
2. Generate and update with a personal [access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
3. Include and update password as defined as MYSQL from `.env.template`
```

### F0 Screencast

[F0-wnwang Screencast](https://drive.google.com/file/d/1IWlQrROy2WdpjmI7MciGgiAHnu2pdoq_/view?usp=sharing)

___
_Note: documentation sections below are from previous iteration of documentations of both M1 and M2 for reference._

# Project M2 - Pipeline: Test & Analysis

## INDEX

- [M2 Project Overview](#m2-project-overview)
- [M2 Build Job Specification](#m2-build-job-specification)
- [M2 Mutation Coverage](#m2-mutation-coverage-approach)
- [M2 Report](#m2-report)
- [M2 Commands](#m2-commands)
- [M2 `.env` File Format](#m2-env-file-format)
- [M2 Screencast](#m2-screencast)

### M2 Project Overview

The goal of the analysis is to calculate the mutation coverage of a test suite. For mutation coverage with snapshot
testing, our M2 implementation will be
utilizing [Checkbox Marqdown Microservice](https://github.com/chrisparnin/checkbox.io-micro-preview) module to render
and facilitate difference comparison.

For M2 milestone, all previous capability of M1 were retained and module was expanded based on M1. Further adaptation
and modification was in place to ensure capability.

### M2 Build Job Specification

In addition to maintaining the previously defined compatible build job specification for M1, the new feature capability
introduced new standards for how current M2's iteration of [`build.yml`](build.yml) is defined.

Major changes are listed as follows:

* As part of the new job specification added as shown in the following snippet, for `mutation-coverage`, the existing
  feature of interpreting `steps` are still compatible.
* As shown below, for `mutation-coverage`, basic structure setup is necessary to construct an environment such that are
  compatible with the newly implemented mutation coverage feature.
* For all job, an **optional** `mutation` can be used to configure the mutational coverage properties.
* For an `mutation`, `microservice`, `renderer`, `driver`, `iterations`, and list of `snapshots` are **mandatory**.
* `microservice` is the name of microservice module folder that is used for rendering. `steps` will run first to set up
  for all necessary to facilitate the use within the VM.
* `renderer` is the name of key components that are used by the microservice module, which will be modified by `driver`
  to allows the testing of mutational coverage.
* `driver` is the name of the **node** module `*.js` file without postfix, as defined in `steps` that hitherto resided
  in [`/drivers/`](/drivers) folder, to facilitate the mutation of the `renderer`.
* `iterations` is the number of iterations of **comparable** mutations modification in total that the mutational
  coverage module should be run.
* `snapshots` is the list that consists of the target test suites to be rendered for each of the mutational coverage
  iteration.

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

Keep in mind, `steps` is a globally usable and **mandatory** for each of the build job, even if the property can be
empty, the `steps` property is still mandatory to be in place as defined by previous iteration of
implementation [M1 Build Job Specification](#build-job-specification) for M1.

### M2 Mutation Coverage Approach

#### Mutation Operators

Mutation operators considered in `mutation` with the indicated examples can be found in the following functions. Each
mutation is randomly picked within `mutation`:

* Function ChangeBoundary: `>` => `>=`, `<` => `<=`
* Function FlipIncremental: `j++` <==> `j--`
* Function NegateConditions:`==` <==> `!=`, `>` <==> `<`
* Function ChangeFlow: `if` <==> `else if` (Note: only `if` statement preceded with another `if` can be mutated)
* Function ChangeConExp: `&& <==> ||`
* Function EarlyReturn: Copy and insert `return` statement in random location within its function (before declaration)
* Function EmptyString:`"" => "<div>Bug</div>"`
* Function ChangeConst: Randomly choose a constant and increment by 1: `c => c+1`

#### Test Hardness

The test hardness implemented allows for

* Start with original version of markdown
* Apply a random mutation operator
* Run a microservice with mutated code
* Compare snapshots to determine any difference

#### Mutation Coverage & Snapshot differencing

Test hardness used to generate 1000 random mutations from `mutation` per markdown file being tested (long.md, survey.md,
upload.md, variations.md)

The mutation coverage is calculated by: failed cases per mutation / total number of mutations.

### M2 Report

| Issue                                                                   | Description                                                                                                                                                                                                                           | Resolution                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
|-------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Understanding microservice                                              | As part of the M2 assignment, it was important to understand what concepts of the class were applicable. It was important to understand the structure and function of system being tested which was microservice.                     | Each member tested microservice and compared it to the fuzzing workshop completed during class.                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Understanding and orchestrating the different components of the project | Collaboration within the team to understand how M1 components (parser, build, and VM) would all interact to work with mutations and microservice components.                                                                          | Determined that the local host would include the updated build.yml file that includes the mutation-coverage job and steps, a build.js that calls a mutation file, catch errors and return mutation coverage, and a mutation file that implements all the mutations being considered. Within the VM, a clone of checkbox-io (markdown) and clone of the screenshot repo with all dependencies is to occur. The original markdown file is to be mutated, screenshot captured and service ended for as many iterations as indicated in the host build.yml file. |
| Updating the build.yml file                                             | Considered what information had to be added or updated to the build.yml file from M1 to work with M2 related work                                                                                                                     | updated build.yml to include mutation-coverage job with steps to clone and install microservice, prepare and install components for the mutation driver and provide specific information for the mutation itself with the renderer, driver, iterations and markdown files to be tested.                                                                                                                                                                                                                                                                      |
| Implementing mutations                                                  | Determine what mutations had to be implemented, where to call them within the host machine and how to apply them to the files being tested                                                                                            | `mutation` was implemented to account for all the different types of mutations expected (as listed in mutation operators), a total of 1000 mutations are applied. One mutation out of all the available ones is randomly applied to the file being tested.                                                                                                                                                                                                                                                                                                   |
| Test harness                                                            | The final test required that the mutations are applied, recognized and tracked. A final mutation coverage had to be calculated at the end such as mutation coverage = (any test case fails for mutant ) / (total number of mutations) | Implementation required for all the previous components had to be completed and working properly. Various runtime errors developed which made it hard to determine what was considered a failed mutation vs issues with runtime. A try-catch approach was implemented to filter out the cases considered as failed test cases due to mutation or other issues related to runtime.                                                                                                                                                                            |
| Repo restructuring & Debugging                                          | Various issues developed while trying to incorporate all the new components to the original structure of M1. There were issues trying to automate the process of mutation, screenshot and comparison.                                 | Issue descriptions can be found in issue [#32](https://github.ncsu.edu/CSC-DevOps-S22/DEVOPS-23/issues/32), the issues were investigated and handled. To integrate the new components for M2, a drivers folder had to be added which included files MC, mutation, and parser which all handle the mutations.                                                                                                                                                                                                                                                 |

### M2 Commands

To run and execute newly implemented M2 module, clone the current repository and locate into the repository folder and
run the following commands in sequence. **Before running the following commands, be sure to
use [`.env` File Template](.env.template) to create `.env` file in the same directory of the local repository folder.**
Additionally, further details can be found in [M2 `.env` File Format](#m2-env-file-format).

To run the commands and test the module, use Windows with seted up Git Bash.

All mutation comparable rendered results are saved locally automatically in `.mutations` local folder which within the
same directory of the local repository. An example of 1000 mutations of all 4 snapshots comparable output in zip file
can be found in [_mutations.zip](assets/_mutations.zip).

```
npm install
npm link

pipeline init
pipeline build mutation-coverage build.yml
```

Other Compatible Commands

```
npm install
node index.js init
node index.js build itrust-build build.yml
node index.js build mutation-coverage build.yml
```

Notes: all previous M1 features are still compatible. Refer to [Available Commands](#available-commands) for details of
M1 features and compatible commands.

### M2 `.env` File Format

For M2, M1-based standard [`.env` File Format](#env-file-format) as describe in M1 documentation is still applicable.
Additionally, `build.js` modules has adapted new changes that are automatic for environment tracking.

### M2 Screencast

[Project M2 - Screencast](https://drive.google.com/file/d/1FiBIDXlwvrFvDPeOQz_1eub_Tru7RtU7/view?usp=sharing)

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
+ `setup` consists a list of environment setup commands and packages to be installed before the job execution.
+ `jobs` consists of list of jobs will be run after `setup`.


+ Each item in `jobs` must have `name` and `steps`, and `steps` can consists a list of steps that has `name` and `run`
  for each step within `steps` list.
    + Within each `step` item, optional parameters `env` and `rebuild` can be used.
    + `env` indicate the environment variable that should be retrived from the `.env` file as predefined, within yml
      file, optional `env` flag is stored as list as shown in example below.
    + `rebuild` indicate the step that is going to run after the initial build run so that during rebuild, original
      initial environment setup steps can be skipped so it is more dynamic.
+ Each item from `setup` must be following same level of indentation as shown below, and fall within 3 major general
  format.
    + **APT**: package names under `apt`, each in an individual line.
    + **URL**: URLs that can be downloaded without credential and token requires. Otherwise, include the command
      under `jobs`.

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

Purpose: Pass sensitive setup information to the pipeline via a `.env` file.

Set Up:

1. Create a .env file accessible to the repo based
   on [`.env.template`](https://github.ncsu.edu/CSC-DevOps-S22/DEVOPS-23/blob/main/.env.template)
2. Generate and update with a
   personal [access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

3. Include and update password for MYSQL

Potential Error:
"You should have a .env containing project specific environment variables"

Solution: Create .env file

### Screencast

[Project M1 - Screencast](https://drive.google.com/file/d/1UPVj7Uas5lhsdQGUdF01SWkZLxz2Uhlz/view?usp=sharing)

### Checkpoint Report

[Checkpoint-M1 Report](https://github.ncsu.edu/CSC-DevOps-S22/DEVOPS-23/blob/main/CHECKPOINT-M1.md)

### Milestone Report

| Issue                   | Description                                                                                                                                                                                                                                 | Resolution                                                                                                                                                                                            |
|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Setting Up the Pipeline | There were multiple discussions about how different components of the pipeline would interact and communicate with each other including Host Machine, Virtual Machine, Environment Variables, Parser and the jobs required to build iTrust. | Pipeline design consisted of creating the VM using bakerx followed by setting up environment settings which are accessible to the parser which converts the build.yml instructions and builds iTrust. | 
| Set up Tools            | Consideration of multiple tools available to setup java based programs including Ansible and Jenkins. Had to consider constrains and convertion of yml files to readible files by program doing the setup.                                  | Decided to implement a simple parser that takes a yml file as input and converts it to executable scripts within the VM.                                                                              | 
| Create a Dynamic Build  | Multiple discussions on what the build file should contain to ensure iTrust can be built properly and automatically.                                                                                                                        | Included all the build requirements per iTrust documentation while keeping most of the work on the build file instead of the parser. Post-build clean up is also considered within the build file.    |

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
