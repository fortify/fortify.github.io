---
title: "SSC on AWS"
type: article
layout: article
permalink: /onprem/ssc-on-aws
output: true
---
# Deploying SSC on AWS ElasticBeanstalk
Elastic Beanstalk will provision a tomcat server on EC2 and deploy the SSC war.  It will create and manage all required EC2 infrastructure including security groups, roles and networking.  Optionally you can also deploy an RDS DB that will have a lifecycle managed by Elastic Beanstalk, which is good for a demo or testing.  You may also provide your own DB.

This guide walks through setup to get a running SSC instance that can be configured from the SSC maintanence UI or autoconfigured.

You can follow along with this guide on the [AWS Console Web UI](https://aws.amazon.com/console/ "ui instructions") or you can run commands if you are familiar with the [AWS Command Line Interface](https://aws.amazon.com/cli/ "aws instuctions")

## Prerequirements for AWS setup
#### Key Pair
You must be able to access the provisioned EC2 instance to finish setup so you need to have an AWS [key pair](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html "key pair guide").  This allows you to [connect](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html "how to connect to ec2") to an ec2 instance over ssh.

#### DB setup for RDS MySQL
If you are not providing a DB then we can setup one on RDS.  SSC requires some configuration for MySQL that we can create with a [DB Parameter Group](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithParamGroups.html#USER_WorkingWithParamGroups.Creating "create a DB Parameter Group").  The required parameters are:
 * `log_bin_trust_function_creators = 1`
 * `max_allowed_packet = 1073741824`

Later you will apply this Parameter Group to the MySQL instance provisioned by RDS.

## SSC on Elastic Beanstalk
After provisioning the default Tomcat server AWS will read from an [.ebextensions](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/ebextensions.html "ebextensions docs") folder located in the root of a war file.  Below is a config file for the `.ebextensions` folder that will:
* Specifies the `fortify.home` directory as `/var/fortify`
* Installs a mysql connector and adds it to Tomcat
* Installs a mysql client
* Has an initialization script for RDS MySQL

You can either manually configure these items or create an `.ebextensions` folder in the war with this `ssc_eb.config` yaml.
```yaml
packages:
  yum:
    mysql: []
    mysql-connector-java: []
option_settings:
  - namespace: aws:elasticbeanstalk:command
    option_name: Timeout
    value: 500
  - namespace:  aws:elasticbeanstalk:container:tomcat:jvmoptions
    option_name:  "JVM Options"
    value:  "-Dfortify.home=/var/fortify"
commands:
  11create_fortify_home:
    command: "install -g ec2-user -o ec2-user -d /var/fortify"
  12permission_to_fortify_home:
    command: "chmod 777 /var/fortify"
  21copy_mysql_connector:
    command: "cp /usr/share/java/mysql-connector-java.jar /usr/share/tomcat8/lib"
```

Add the `.ebextensions` folder to your SSC war file:

* `jar -xvf ssc.war`
* `jar -cvf ssc.war .`

#### Create Application on AWS
From the [Elastic Beanstalk Console](https://console.aws.amazon.com/elasticbeanstalk) click "create a new application" and use the following settings:

* Choose any names
* `Tier: Web Server`
* `Platform: Preconfigured Platform > Tomcat`
* `Upload you code: ssc.war`

Select "Configure more options" and from the defaults change the following:

* `Instances > t2.large` choose at least a large for performance
* `Capacity > Single Instance`
* `Security > your key pair`

If you was a demo DB created:
* `Database >`
  * `Engine: mysql`
  * `Engine version: 5.7.19`
  * `Instance class: t2.large`
  * `Retention: Delete`
  * any username and password

Create App.  This will provision an SSC server and a MySQL DB for a demo - the DB will be deleted with the Elastic Beanstalk environment.

#### Initialize DB
If RDS was used to provision a MySQL DB you must [modify](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ModifyInstance.MySQL.html "how to modify a MySQL DB instance") it by adding the parameter group created for SSC.

From the [RDS Console](https://console.aws.amazon.com/rds) modify the DB instance from instance actions.  Under "Database options" select the SSC DB Parameter Group.  Click continue and choose to apply changes immediately. This may take a few minutes - you can see status by viewing the instance.  Once the change shows as "pending reboot", reboot the instance.

Now log into the EC2 Host as ec2-user.  The following `ssc_rds_mysql_init.sh` script reads the provisioned RDS connection information then creates a `sscdemo` DB and runs the `create_tables.sql` script.

```bash
#!/bin/bash

#Get and parse RDS variables
JSON=$(sudo /opt/elasticbeanstalk/bin/get-config environment)
RDS_HOSTNAME=$(python -c "import sys, json; print(json.load(sys.stdin)['RDS_HOSTNAME'])" <<< """$JSON""")
RDS_PORT=$(python -c "import sys, json; print(json.load(sys.stdin)['RDS_PORT'])" <<< """$JSON""")
RDS_USERNAME=$(python -c "import sys, json; print(json.load(sys.stdin)['RDS_USERNAME'])" <<< """$JSON""")
RDS_PASSWORD=$(python -c "import sys, json; print(json.load(sys.stdin)['RDS_PASSWORD'])" <<< """$JSON""")

if [[ -z "${RDS_HOSTNAME}" ]]; then
  echo "No RDS configuration found, skipping RDS setup"
  exit 0
fi

if [[ $(mysql --host $RDS_HOSTNAME --port $RDS_PORT --user $RDS_USERNAME --password=$RDS_PASSWORD -N --batch -e "show databases like 'sscdemo'") = sscdemo ]]; then
  echo "Found existing sscdemo database, skipping RDS setup"
  exit 0
fi

echo "creating SSC DB on RDS"
mysql --host $RDS_HOSTNAME --port $RDS_PORT --user $RDS_USERNAME --password=$RDS_PASSWORD -e "CREATE SCHEMA IF NOT EXISTS sscdemo DEFAULT CHARACTER SET latin1 COLLATE latin1_general_cs"

echo "creating tables on DB"
mysql --host $RDS_HOSTNAME --port $RDS_PORT --user $RDS_USERNAME --password=$RDS_PASSWORD sscdemo < """$1"""

```

It can be run with: 

`./ssc_rds_mysql_init.sh /tmp/deployment/application/ROOT/sql/mysql/create-tables.sql`

You now have a deployed SSC host and MySQL DB.

#### Configure SSC
While logged into the EC2 host get the init token with:

`cat /var/fortify/_default_/init.token`

Now you can log into your SSC instance and configure as usual.

You can enable global search to:

`/var/fortify`

The DB connection string will be:

`jdbc:mysql://HOST:3306/sscdemo?connectionCollation=latin1_general_cs&rewriteBatchedStatements=true`

#### Example Template
```yaml
EnvironmentConfigurationMetadata:
  DateCreated: '1515697710000'
  DateModified: '1515697710000'
Platform:
  PlatformArn: arn:aws:elasticbeanstalk:us-west-2::platform/Tomcat 8 with Java 8 running on 64bit Amazon Linux/2.7.4
OptionSettings:
  aws:elasticbeanstalk:environment:
    ServiceRole: aws-elasticbeanstalk-service-role
    EnvironmentType: SingleInstance
  aws:autoscaling:launchconfiguration:
    IamInstanceProfile: aws-elasticbeanstalk-ec2-role
    InstanceType: t2.large
  aws:rds:dbinstance:
    DBEngineVersion: 5.7.19
    DBPassword: password
    DBAllocatedStorage: '5'
    DBEngine: mysql
  AWSEBAutoScalingLaunchConfiguration.aws:autoscaling:launchconfiguration:
    EC2KeyName: sscDemo
EnvironmentTier:
  Type: Standard
  Name: WebServer
Extensions:
  RDS.EBConsoleSnippet:
    Order: null
    SourceLocation: https://s3.us-west-2.amazonaws.com/elasticbeanstalk-env-resources-us-west-2/eb_snippets/rds/rds.json
AWSConfigurationTemplateVersion: 1.1.0.0
```
