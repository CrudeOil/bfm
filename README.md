# bfm
BioFlowMap: An interactive overview of bioinformatics data

## Summary
BioFlowMap is an interactive flowchart detailing the various data formats commonly used in bioinformatics and what paths are available to convert between them. This tool is mainly meant to be used to teach new bioinformatics students the relations between various data formats and to facilitate building new workflows for analysis projects.

## Planned features
In order to limit the scope of this project, five features are listed:

* Flowchart with basic data types and their conversion (FQ, FA, SAM, BAM, etc. Common data types)
* Collections of popular applications for processing of above data
* Interacting with flowchart to list details such as duration on steps or dependencies for methods
* Custom views to plan workflows
* Emulation of workflow to predict and optimize performance

## Deploying

1. Type ```tsc``` in this project directory to compile typescript.
2. Type ```gulp deploy``` to deploy to ./out
   * You can set the outdir in the gulpfile
3. You will probably have to type gulp deploy again because it does not inject all dependencies on the first go