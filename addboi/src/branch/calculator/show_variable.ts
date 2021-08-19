import { AmbiguousRequest, BranchCreator, Context } from "interface";
import {
  CONSTANTS,
  createLeaf,
  getCrossPlatformOutput,
  NextResult,
  Postback,
} from "utils";

const _: BranchCreator = async ({ stateMachine }) => {
  function shouldShowVariables({ input }: AmbiguousRequest<Context>) {
    let destinationPage: number | undefined;

    if (
      input.type === "command" &&
      input.command === CONSTANTS.COMMAND_SHOW_VARIABLES
    ) {
      destinationPage = 0;
    } else if (
      input.type === "postback" &&
      ({ destinationPage } = Postback.Extract.getDestinationVariablePage(
        input.payload
      )) != null &&
      destinationPage != null
    ) {
    }

    return { destinationPage };
  }

  return {
    showVariables: await createLeaf(async (observer) => ({
      next: async (request) => {
        let destinationPage: number | undefined;

        if (
          ({ destinationPage } = shouldShowVariables(request)) == null ||
          destinationPage == null
        ) {
          return NextResult.FALLTHROUGH;
        }

        const {
          currentContext: { variables = {} },
          targetID,
          targetPlatform,
        } = request;

        const variableEntries = Object.entries(variables);

        const maxPage = Math.floor(
          variableEntries.length / CONSTANTS.COUNT_SHOW_VARIABLE_PAGE_SIZE
        );

        await observer.next({
          targetID,
          targetPlatform,
          output: getCrossPlatformOutput({
            telegram: [
              {
                content: {
                  text: `
Showing at most ${CONSTANTS.COUNT_SHOW_VARIABLE_PAGE_SIZE} variables (${
                    destinationPage * CONSTANTS.COUNT_SHOW_VARIABLE_PAGE_SIZE +
                    1
                  }-${Math.min(
                    (destinationPage + 1) *
                      CONSTANTS.COUNT_SHOW_VARIABLE_PAGE_SIZE,
                    variableEntries.length
                  )}):
${variableEntries
  .slice(
    destinationPage * CONSTANTS.COUNT_SHOW_VARIABLE_PAGE_SIZE,
    (destinationPage + 1) * CONSTANTS.COUNT_SHOW_VARIABLE_PAGE_SIZE
  )
  .map(([key, value]) => {
    return `<b>${key}</b>: ${value}`;
  })
  .join("\n")}
`,
                  type: "text",
                },
                quickReplies: {
                  content: [
                    [
                      ...(destinationPage > 0
                        ? [
                            {
                              payload: Postback.Payload.goToVariablePage(
                                destinationPage - 1
                              ),
                              text: "Previous",
                              type: "postback" as const,
                            },
                          ]
                        : []),
                      ...(destinationPage < maxPage
                        ? [
                            {
                              payload: Postback.Payload.goToVariablePage(
                                destinationPage + 1
                              ),
                              text: "Next",
                              type: "postback" as const,
                            },
                          ]
                        : []),
                    ],
                  ],
                  type: "inline_markup",
                },
              },
            ],
          })(targetPlatform),
        });

        return NextResult.BREAK;
      },
    })),
  };
};

export default _;
