# bfm
BioFlowMap: An interactive overview of bioinformatics data

## Summary
BioFlowMap is an interactive flowchart detailing the various data formats commonly used in bioinformatics and what paths are available to convert between them. This tool is mainly meant to be used to teach new bioinformatics students the relations between various data formats and to facilitate building new workflows for analysis projects.

## Planned features
In order to limit the scope of this project, these features are listed:

* An at-least-ok renderer that doesn't take up a core of your CPU
* Flowchart with basic data types and their conversion (FQ, FA, SAM, BAM, etc. Common data types)
* Descriptions of processes between data types
* Descriptions and links to programs that you can use for these processes
* Custom views to plan workflows
* MAYBE: Interacting with flowchart to list details such as duration on steps or dependencies for methods
* PROBABLY NOT: Emulation of workflow to predict and optimize performance

## Deploying

1. Make sure you installed the dependencies using ```npm i```
2. Type ```webpack``` and upload the /dist folder onto a webserver somewhere
