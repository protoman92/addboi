export namespace Calculator {
  export interface ProduceNextState {
    (state: State.STARTED): Promise<State.COMPUTE_FORMULA>;
    (state: State.COMPUTE_FORMULA): Promise<State.COMPLETED>;
    (state: State.SCAN_IMAGE): Promise<undefined>;
    (state: State.STORE_FIXED_VARIABLE): Promise<State.COMPLETED>;
  }

  export enum State {
    STARTED = "CALC_STARTED",
    COMPUTE_FORMULA = "CALC_COMPUTE_FORMULA",
    SCAN_IMAGE = "CALC_SCAN_IMAGE",
    STORE_FIXED_VARIABLE = "CALC_STORE_FIXED_VARIABLE",
    COMPLETED = "CALC_COMPLETED",
  }

  export type Context = Readonly<
    | { state: State.STARTED }
    | { state: State.COMPUTE_FORMULA; formulaToCompute?: string }
    | { state: State.SCAN_IMAGE; formulaToCompute: string }
    | { state: State.STORE_FIXED_VARIABLE }
    | { state: State.COMPLETED }
  >;
}

export default function createStateMachine() {
  return {
    calculator: (function () {
      return {
        nextState: (async (state: Calculator.State) => {
          switch (state) {
            case Calculator.State.STARTED:
              return Calculator.State.COMPUTE_FORMULA;

            case Calculator.State.COMPUTE_FORMULA:
            case Calculator.State.SCAN_IMAGE:
            case Calculator.State.STORE_FIXED_VARIABLE:
            case Calculator.State.COMPLETED:
              return Calculator.State.COMPLETED;
          }
        }) as Calculator.ProduceNextState,
      };
    })(),
  };
}
