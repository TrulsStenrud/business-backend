import {DockerImageAsset, NetworkMode} from "aws-cdk-lib/aws-ecr-assets";
import {Stack, StackProps} from "aws-cdk-lib";
import * as apprunner from "@aws-cdk/aws-apprunner-alpha";
import {Construct} from "constructs";

interface AppStackProps extends StackProps {
}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    new apprunner.Service(this, "BussinessService", {
      source: apprunner.Source.fromAsset({
        asset: new DockerImageAsset(this, "BussinessImage", {
          directory: ".",
          networkMode: NetworkMode.HOST,
        }),
      }),
    });
  }
}
