export namespace Calculator {
  export interface ProduceNextState {
    (state: State.STARTED): Promise<State.ENTER_FORMULA>;
    (state: State.ENTER_FORMULA): Promise<State.COMPLETED>;
    (state: State.STORE_FIXED_VARIABLE): Promise<State.COMPLETED>;
  }

  export enum State {
    STARTED = "CALC_STARTED",
    ENTER_FORMULA = "CALC_ENTER_FORMULA",
    STORE_FIXED_VARIABLE = "CALC_STORE_FIXED_VARIABLE",
    COMPLETED = "CALC_COMPLETED",
  }

  export type Context = Readonly<
    | { state: State.STARTED }
    | { state: State.ENTER_FORMULA }
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
              return Calculator.State.ENTER_FORMULA;

            case Calculator.State.ENTER_FORMULA:
            case Calculator.State.STORE_FIXED_VARIABLE:
            case Calculator.State.COMPLETED:
              return Calculator.State.COMPLETED;
          }
        }) as Calculator.ProduceNextState,
      };
    })(),
  };
}
