import * as cdk from "aws-cdk-lib";
import {StackProps} from "aws-cdk-lib";
import * as constructs from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elb from "aws-cdk-lib/aws-elasticloadbalancingv2"


interface AppStackProps extends StackProps {
  optional?: string
}

export class AppStack extends cdk.Stack {
  constructor(scope: constructs.Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", {

    });

    const cluster = new ecs.Cluster(this, "Cluster", {
      vpc: vpc,
    });

    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "TaskDefinition",
      {
        cpu: 256,
        memoryLimitMiB: 512,
      },
    )

    taskDefinition.addContainer("Container", {
      image: ecs.ContainerImage.fromAsset("."),
      logging: ecs.LogDrivers.awsLogs({streamPrefix: 'bussness-log-group', logRetention: 5}),
      linuxParameters: new ecs.LinuxParameters(this, "LinuxParameters", {
        initProcessEnabled: true,
      }),
      portMappings: [
        {
          containerPort: 8080,
          hostPort: 8080,
        },
      ],
    });

    const securityGroup = new ec2.SecurityGroup(this, "SecurityGroup", {
      vpc: vpc,
    });

    const service = new ecs.FargateService(this, "Task", {
      serviceName: "bussiness-backend",
      cluster: cluster,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      taskDefinition: taskDefinition,
      platformVersion: ecs.FargatePlatformVersion.VERSION1_4,
      desiredCount: 1,
      enableExecuteCommand: true,
      securityGroups: [securityGroup],
      assignPublicIp: false,
    });


    const targetGroup = new elb.ApplicationTargetGroup(this, "TargetGroup", {
      protocol: elb.ApplicationProtocol.HTTP,
      port: 8080,
      vpc: vpc,
      targetType: elb.TargetType.IP,
      targets: [service],
      deregistrationDelay:
        cdk.Duration.seconds(15),
    })

    const loadBalancer = new elb.ApplicationLoadBalancer(this, "LoadBalancer", {
      vpc: vpc,
      internetFacing: true,
      vpcSubnets: vpc.selectSubnets({
        subnetType: ec2.SubnetType.PUBLIC,
      }),
    })

    const httpListener = loadBalancer.addListener("HttpListener", {
      protocol: elb.ApplicationProtocol.HTTP,
      port: 80,
      certificates: undefined,
      defaultTargetGroups: [targetGroup],
    })

    const applicationListenerRule = new elb.ApplicationListenerRule(
      this,
      "ListenerRule",
      {
        listener: httpListener,
        priority: 1,
        conditions: [elb.ListenerCondition.pathPatterns(["/*"])],
        targetGroups: [targetGroup],
      },
    )
  }
}
