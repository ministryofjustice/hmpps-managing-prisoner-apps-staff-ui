# Application Maintenance Page

## Overview
This directory contains the manifest files needed to deploy a standard maintenance page into your namespace.

This directory also contains the maintenance page HTML file, along with a DockerFile to compile an image.

The HTML provided by default is a basic MoJ-branded page. This can be customised for your own needs.

## Deploying the page

Fork and rename this repo into your own account/team.

Update the html with your content.

Update your associated application ECR module to include your newly forked maintenance page repo in the `github_repositories` list https://github.com/ministryofjustice/cloud-platform-terraform-ecr-credentials/blob/main/examples/ecr.tf#L15.

Configure the Github actions to build the maintenance page image to your ECR.

You can then deploy the service and deployment as part of your application.

## Redirecting traffic 

Having deployed the maintenance page is not enough - traffic must be redirected to it.

This can be achieved by changing the `serviceName` field in your current ingress to point to `maintenance-page-svc`.  
This can either be done by redeploying the ingress or doing an in-place edit of the ingress.

## Cleaning up 

Once the maintenance page is not needed anymore:

- Change the `serviceName` in your ingress back to the original value (pointing to your app)
- Make sure the your app can be reached via the URL, as expected.
- Remove your container from ECR
- Remove your fork of this repository.