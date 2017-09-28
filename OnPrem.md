---
title: "Fortify On Premise"
permalink: /onprem-main
layout: page
type: onprem
---

# Fortify Software Security Center & Tools (Home)
This repository is a starting point for all development activities around Fortify SSC and Tools. 

1. [Plugin Framework Overview](#framework) - SSC plugin artchitecture
2. [Bug Tracker Plugins](#bugtrackers) - Allows filing defects to different bug tracker systems.
3. [Data Parser Plugins](#dataparsers) - Allows SSC to import and manage results from systems other than Fortify.
4. [Restfull API](#restapi) | SSC has a Restfull API that allows full automation of different aspects of the server.
5. [Command Line Tools](#cli) | Java based CLI tools are available to common tasks such as uploading FPR files.

<a name="framework"></a>
### SSC Plugin Framework
The 17.2 release introcuded a redesigned plugin framework to support a growing need to sustaible integrations. The framework is designed around a few core concepts:
####Isolation
Each plugin defines and wraps it's own dependencies inside of it's bundle. The framework will take care of dependency isolation from the rest of the SSC loaded libraries.
####Granularity
The framework supports different kinds of plugins to do different operations in SSC. It is agnostic to the type of implementaiton the plugin needs to do. In the current version, Data Parsers and Bug Trackers are supported and in future versions we intend to add more.
####Reliability
The framwork is built with a robust and reliable messaging mechanism to ensure data integrity.

![High Level Plugin Framwork Diagram](images/PluginFrameWork-HighLevel.png "High Level Plugin Framwork Diagram")

#### Some Internals:
* Felix OSGi + Camel integration framework - used internally but transparent to plugin implementration. Framework converts the plugin to an OSGi bundle.
* ActiveMQ - messaging between the framework and SSC.

<a name="bugtrackers"></a>
### Bug Tracker Plugins
Bug Tracker plugins connect vulnerability management in SSC and Tools (AWB) with bug tracking systems.
The allow the following functionality:
* File a single issue. When triggered, an issue with all its details (configurable with templates), will be sent to plugin for submitting in the bugtracker system (i.e JIRA).
* File multiple issues. When triggered, an a collection of issues with selected details (configurable with templates), will be sent to plugin for submitting in the bugtracker system as a single bug(i.e JIRA).
* Bug state management (SSC only). SSC will keep track of issue state changes and post comments to previously submitted bugs. For example, when an issue is audited and set to "Exploitable" a comment will be added to the bug indicating this change. This functionality is limited to one way data flow from SSC to the plugin to the bug tracker system.

##### Fortify Supported

[Bugzilla](http://github.com) |
[ALM/QC](http://github.com) |
[TFS](http://github.com) |
[VSO](http://github.com) (SSC Only) |
[JIRA](http://github.com) 

#####Community Plugins

#####Resources:
> Bug Tracker Plugin [Tutorial](http://github.com) - TBD 

<a name="dataparsers"></a>
### Data Parser Plugins
Data Parser Plugins are used by SSC to parse 3rd party results into SSC to be managed along with Fortify scan results. They cane be audited, reported on etc as any other issue in SSC. This allows for SSC users to centrally manage vulnerability data in one central location for a codebase.

##### Managing plugins in SSC (since 17.2)
Checkout the administration plugins section in SSC to Install and start your plugin.

###### 17.1 - the plugin framework exists in the 17.1 codebase but is not managed via UI. Here is a guide on how to load your parser in SSC 17.1.

###### Resource:
> Sample Parser [Tutorial](https://github.hpe.com/young-s-park/plugins/tree/master/sample-parser)

##### Managing plugins in SSC
Checkout the administration plugins section in SSC to Install and start your plugin.

<a name="restapi"></a>
### Restfull API
SSC has a Rest API that is publicly available for customers to automate activities, pull date and so forth. SSC uses [Swagger.io](http://swagger.io/) as it's API tooling framework. Swagger has tooling to generate client code and we suggest using it for working with SSC. It has many benefits along with the ability to easly upgrade to new version of the API when released.

Please see the folowing resource that include sample applications utilizing Swagger to work with the API.

###### Resources
> [Sample report generation] (https://github.hpe.com/pedro-soares/pocReports)
> [Sample application version creation and FPR uploading] (https://github.hpe.com/pedro-soares/pocAppVerUploadFPR) 

<a name="cli"></a>
### Command Line Tools

