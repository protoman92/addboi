import { S3 } from "aws-sdk";
import { Calculator } from "client/state_machine";
import { DefaultLeafDependencies } from "../../../chatbot-engine/src/bootstrap/interface";
import { Branch } from "../../../chatbot-engine/src/type";
export * from "../../../chatbot-engine/src/type";

declare global {
  namespace NodeJS {
    interface Process {
      readonly env2: ProcessEnv;
    }
  }
}

export interface Context {
  readonly inputFlow?: Readonly<
    Calculator.Context & { inputType: "calculator" }
  >;
  /** Refers to the original user object we receive from Facebook/Telegram etc */
  readonly platformUser?: unknown;
  readonly variables?: Record<string, number>;
}

export interface LeafDependencies extends DefaultLeafDependencies<Context> {
  readonly cloudVision: ReturnType<
    typeof import("client/cloud_vision")["default"]
  >;
  readonly imageClient: ReturnType<
    typeof import("client/image_client")["default"]
  >;
  readonly s3: S3;
  readonly stateMachine: ReturnType<
    typeof import("client/state_machine")["default"]
  >;
}

export type BranchCreator = (
  args: LeafDependencies
) => Promise<Branch<Context>>;
