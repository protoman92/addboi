import { Calculator } from "client/state_machine";
import { DefaultLeafDependencies } from "../../chatbot-engine/src/bootstrap/interface";
import { Branch } from "../../chatbot-engine/src/type";
export * from "../../chatbot-engine/src/type";

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
}

export interface ResolverArgs extends DefaultLeafDependencies<Context> {
  readonly stateMachine: ReturnType<
    typeof import("client/state_machine")["default"]
  >;
}

export type BranchCreator = (args: ResolverArgs) => Promise<Branch<Context>>;
