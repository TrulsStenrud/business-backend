import * as cdk from "aws-cdk-lib";
import {AppStack} from "./app-stack";

const app = new cdk.App();


new AppStack(app, "app-stack", {
  env:{
    region: "eu-west-1",
  }
})
