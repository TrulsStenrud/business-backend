import * as cdk from "aws-cdk-lib";
import * as constructs from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { StackProps } from "aws-cdk-lib";


interface AppStackProps extends StackProps {
  optional?: string
}

export class AppStack extends cdk.Stack {
  constructor(scope: constructs.Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", {
      natGateways: 1,
    });

    const cluster = new ecs.Cluster(this, "Cluster", {
      vpc: vpc,
    });

    const taskDefinition = new ecs.TaskDefinition(this, "TaskDefinition", {
      compatibility: ecs.Compatibility.FARGATE,
      cpu:  "256",
      memoryMiB:  "512",
      networkMode: ecs.NetworkMode.AWS_VPC,
    });
    taskDefinition.addContainer("Container", {
      image: ecs.ContainerImage.fromAsset("."),
      portMappings: [
        {
          containerPort: 8080,
        },
      ],
    });



    const securityGroup = new ec2.SecurityGroup(this, "SecurityGroup", {
      vpc: vpc,
      allowAllOutbound: true,
    });

    const fargateService = new ecs.FargateService(this, "Task", {
      cluster: cluster,
      taskDefinition: taskDefinition,
      enableExecuteCommand: true,
      platformVersion: ecs.FargatePlatformVersion.VERSION1_4,
      desiredCount: 1,
      securityGroups: [securityGroup],
    });

  }
}
