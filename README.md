# mmo-fes-external-fe

## Contents

Frontend for the Fish Export Service (FES), using Remix (React-based web framework). This project supercedes https://dev.azure.com/defragovuk/DEFRA-MMO-FES/_git/mmo-fes-external-fe.

- [Explore the folder structure](#explore-the-folder-structure)
- [Environment Variables](#environment-variables)
  - [Start the application](#start-the-application)
- [Development](#development)
- [Deployment](#deployment)
- [Testing approach](#testing-approach)
  - [Cypress](#Cypress)
- [Testing steps](#testing-steps)
  - [Cypress](#Cypress)
    - [Disabling JavaScript](#disabling-javascript)
    - [Important notes](#important-notes)
    - [Useful links](#useful-links)
  - [Code coverage](#code-coverage)
- [Notes on Remix](#notes-on-remix)
  - [Loading and refreshing data](#loading-and-refreshing-data)

## Explore the folder structure

```
mmo-cc-fe-v2
├── README.md
├── app
│   ├── .server/ - contains all the functions to interact with the server (orchestration and/or data-reader)
│   ├── components/ - contains all the base components of the app
│   ├── composite-components/ - they usually use a set of base components (non-atomic)
│   ├── controller/ - contains controller methods
│   ├── helpers/ - contains all the helper functions
│   ├── hooks/ - custom defined react hooks
│   ├── routes/ - contains all the routes of the app (\*)
│   ├── routes/ - contains all the routes of the app (\*)
│   ├── styles/ - contains all the styles of the app (\*\*)
│   ├── types/ - contains all the types in typescript
│   ├── entry.client.tsx
│   ├── entry.server.tsx
│   ├── root.tsx
│   └── routes
│       └── index.tsx
├── tests
│   ├── cypress/
│   │    └── integration/ - contains tests for components that have Remix server-side imports
│   │    └── fixtures/ - contains JSON files containing mock data
│   ├── msw/
│   │    └── handlers/ - contains handlers for returning mock data
│   ├── unit/ - contains tests for components that do not have any Remix server-side imports
├── package-lock.json
├── package.json
├── public
│   ├── assets/
│   │    └── fonts/
│   │    └── images/
│   ├── build/
│   ├── locales/
│   │    └── en/
│   │    └── cy/
│   └── favicon.ico
├── remix.config.js
├── remix.env.d.ts
└── tsconfig.json
```

Let's talk briefly about a few of these files:

- `app/` - This is where all your Remix app code goes
- `app/entry.client.tsx` - This is the first bit of your JavaScript that will run when the app loads in the browser. We use this file to hydrate our React components.
- `app/entry.server.tsx - This is the first bit of your JavaScript that will run when a request hits your server. Remix handles loading all the necessary data and you're responsible for sending back the response. We'll use this file to render our React app to a string/stream and send that as our response to the client.
- `app/root.tsx` - This is where we put the root component for our application. You render the <html> element here.
- `app/routes/` - This is where all your "route modules" will go. Remix uses the files in this directory to create the URL routes for your app based on the name of the files.
- `public/` - This is where your static assets go (images/fonts/etc)
- `remix.config.js` - Remix has a handful of configuration options you can set in this file.

(\*) The routes are the entry points of the app. Please use a flat structure when possible. Avoid to use index.tsx when possible
(\*\*) Most of the styles files in this folder are coming from "govuk-frontend" package and are the result of the

```
 "sass": "sass --watch ./node_modules/govuk-frontend/govuk:app/styles"
```

Avoid creating more styles if they already present in the govuk project

## Environment Variables

The environment variables are used to configure the app.

`touch .env`

Add contents of `.envSample` to `.env`

```
example:
MMO_ECC_ORCHESTRATION_SVC_URL=http://localhost:5500
MMO_ECC_REFERENCE_SVC_URL=http://localhost:9000
```

### Start the application

---

mmo-cc-orchestration-svc
git checkout develop
git pull
npm i
npm run dev:without-auth

## Development

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

## Testing approach

### Cypress

As Remix is designed to be rendered server side and as there is currently no official way of rendering components client side, for example with some sort of `<Provider />` to wrap the component under test, the workaround for now is to use an e2e framework, which is where Cypress comes in.

For files or components that contain server-side imports from Remix, testing **MUST BE** done with Cypress. This requires running the app as testing will be done in the form of an e2e test, i.e., visiting a page headlessly or via a browser and then testing one or more components on that page. Backend APIs will be mocked using [Mock Service Worker (msw)](https://mswjs.io/docs/api/rest) but the backend services can be left running while writing the tests to make it easier to get API payloads to use as mock data. See [Testing steps](#cypress-1) for the details.

Cypress can also be used for regular unit tests when the code being tested **DOES NOT** have any imports from Remix.

## Testing steps

### Cypress

#### **Overview**

- Add additional values to the `TestCaseId` enum under `app/types/tests.ts`
- Add mock data in the form of JSON files under `tests/cypress/fixtures`
- Create or update test handlers under `tests/msw/handlers`.
- Any new handlers must be imported into `tests/msw/handlers/index.ts`
- To enable API mocking, go to the `loader` or `action` method of the page to be tested and add the following **before** any API calls:

```js
/* istanbul ignore next */
setApiMock(request.url); // runs only when NODE_ENV === "test"
```

- Add tests under `/tests/cypress/integration` folder
- Ensure the app is running using `npm run :test:start`
- In a second terminal, run all tests with `npm run :test:all`
- View coverage stats under `/coverage`

#### **Individual Tests**

To run an individual test spec:

- Ensure the app is running using `npm run :test:start`
- In a second terminal, run all tests with `npm run :test:spec path/to/test.spec.ts`
  For example:
  `npm run :test:spec tests/cypress/integration/routes/catchCertificateDashboard.spec.ts`

To run only one test in a file:
You can use a .only

For example:

it.only('only run this one', () => {
// similarly use it.skip(...) to skip a test
})

it('not this one', () => {
})

#### **Note**

- The command `npm run :test:start` creates a production build as msw doesn't work properly in watch mode with a development build. For every code change, terminate and run the app again with `npm run :test:start` to rebuild the code
- We are testing page components (files under `app/routes`) and so we are not targeting specific composite components; all components on the page will be tested as part of the e2e test run
- **All API calls** will have to be mocked to return mock responses. This is for all API calls across the entire journey for the test. If a test starts on one page and ends on another page, API calls in the loader of the other page will also need to be mocked (we could mock the API calls in the action method of the other page as well but ideally that should be a separate test). The tests should not hit the real API. Full e2e testing will be carried out by the QA team. As frontend developers, we should only work with mock data in our tests. Instead of using mock data for components props as we would do with [React testing library](https://testing-library.com/), with our e2e tests we are now mocking the API responses and testing if the page and its constituent components are behaving as expected

#### **Detailed instructions**

**Test cases**: Start with the loader and action methods of the page to be tested and for any page(s) the test will land on and check for all API calls. Think about the different scenarios requiring different mock responses from the API calls; then under `app/types/tests.ts` add additional values to the `TestCaseId` enum to name each scenario.

For example, the `app/routes/create-catch-certificate/$documentNumber/progress.tsx` page makes three different API calls and these are the test cases for testing the Progress page with different landing types for catch certificates:

```js
export enum TestCaseId {
  ...
  ...
  CCUploadEntryIncompleteProgress = "ccUploadEntryIncompleteProgress",
  CCUploadEntryCompleteProgress = "ccUploadEntryCompleteProgress",
  CCDirectLandingCompleteProgress = "ccDirectLandingCompleteProgress",
  CCManualEntryCompleteProgress = "ccManualEntryCompleteProgress",
  ...
  ...
}
```

The values themselves don't matter as long as they are unique and descriptive. These values will be used as query-string parameters during the test run. For example, Cypress will make a request to a page like so:

```
http://localhost:3000/create-catch-certificate/GBR-2022-CC-488FE89C1/progress?testCaseId=ccUploadEntryProgressData
```

The presence of the `testCaseId` query-string parameter will inform msw which test handler to use to mock API responses.

**Mock data**: Having checked how many API calls are being made in the journey to be tested, create mock data in the form of JSON files and store them under `tests/cypress/fixtures`. The folders within are based on the service URLs listed in `app/helpers/urls.ts`. For each API, add as many varied responses as necessary.

**Handlers**: In order to mock all of the API calls in the page to be tested, a new test handler needs to be added. As an example, here is an excerpt from `tests/msw/handlers/progressPageHandler.ts`:

```js
...
import uploadEntryLandingsType from "@/fixtures/landingsTypeApi/uploadEntry.json";
...
...
const progressPageHandler: ITestHandler = {
  [TestCaseId.CCUploadEntryIncompleteProgress]: () => [
    rest.get(LANDINGS_TYPE_URL, (req, res, ctx) => res(ctx.json(uploadEntryLandingsType))),
    rest.get(getProgressUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(progressIncomplete))),
    rest.get(getTransportDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(truckTransportDetails))),
  ],
  ...
  ...
};
```

Note that the keys in the test handler use `TestCaseId`, which was updated in the previous step. The mock function must return an array. As the Progress page makes three API calls, the array above contains three corresponding statements to return mock data. The package being used for API mocking is called Mock Service Worker or msw. Please see [official documentation](https://mswjs.io/docs/api/rest) for details.

As can be seen above, JSON files are imported into the hander for the page. The handler functions will be matched by `TestCaseId` and msw will return mock data from the JSON files.

After adding a new handler, update:

```diff
import type { ITestHandler } from "~/types";
import indexPageHandler from "./indexPageHandler";
+ import progressPageHandler from "./progressPageHandler";

const rootTestHandler: ITestHandler = {
  ...indexPageHandler,
+ ...progressPageHandler,
};

export default rootTestHandler;
```

**Enable API mocking**: In the page to be tested add the following inside a `loader` function as needed. Ensure this is done before any statements that make API calls. Note this should only be added to loaders and not actions, but the msw handler should be set up to cover API calls made in the action. There are plenty of examples of this in the codebase. The `tests/cypress/integration/routes/addReference.spec.ts` spec is one such example.

```js
/* istanbul ignore next */
setApiMock(request.url); // runs only when NODE_ENV === "test"
```

This statement enables API mocking and is annotated with `/* istanbul ignore next */` to prevent the line from being included in stats for code coverage.

The `setApiMock` function will look at the value of the query-string `testCaseId` from the request URL to lookup the corresponding handler function and return mock data.

Apart from the query-string `testCaseId`, we can also pass an optional query-string called `args`, which is an array of values that can be used to make decisions within the handler as to what mock data to return. As an example, please see `tests/cypress/integration/routes/index.spec.ts` and `app/routes/index.tsx`. The corresponding handler `tests/msw/handlers/indexPageHandler.ts` looks like this:

```js
...
[TestCaseId.StartJourney]: (journey: Journey) => {
    if (journey === "catchCertificate") {
      return [
        rest.post(SAVE_AND_VALIDATE_URL, (req, res, ctx) => res(ctx.json(ccJourney))),
        rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
        rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.status(204))),
      ];
    }

    if (journey === "storageNotes") {
      ...
...
```

So the value of `journeySelection` passed in the `args` query-string helps the handler function decide on different mock responses.

**Tests**: Add tests under `/tests/cypress/integration`. Please see `tests/cypress/integration/routes/ccProgress.spec.ts` as an example. The main thing to ensure is that the tests add `?testCaseId=` to the request URL in order to get mock data from `loader` functions. For `action` functions, use the method described above as Remix strips out query-string parameters when posting a form.

```js
...
const testParams: ITestParams = {
  testCaseId: TestCaseId.CCUploadEntryCompleteProgress,
};

cy.visit(progressUrl, { qs: { ...testParams } });
...
...
```

**Running tests**: Before running tests, ensure the app has been started with `npm run :test:start`. If not, the app will make real API calls. Also, stats for code coverage will not be generated.

After starting the app with `npm run :test:start`, Cypress tests can be run.

- For command-line output: `npm run :test:all`
- Alternately, for the Cypress GUI: `npm run cy:open` but this will not generate code coverage and is more ideally suited for use during development and writing of tests
- Stats for [code coverage](code-coverage) are generated if the app was started with `npm run :test:start` followed by `npm run :test:all`
- Code coverage can be viewed under `/coverage`

Note that if we forget to mock API calls, msw will give us a warning in the server console. For example,

```
[MSW] Warning: captured a request without a matching request handler:

  • GET http://localhost:5500/v1/notification

If you still wish to intercept this unhandled request, please create a request handler for it.
```

In this case, the API call will be forwarded on to the backend and the test may or may not pass. However, as already mentioned, **all API calls must be mocked** so whenever the above warning is seen, ensure that the handler function is updated to intercept the API call and return mock data.

#### **Disabling JavaScript**

As Remix is primarily built around progressive enhancement with JavaScript, it is good practice to write tests that test a page with JavaScript disabled. Here is a sample test:

```
it("should render conditional input when JavaScript is disabled", () => {
  const testParams: ITestParams = {
    testCaseId: TestCaseId.WhoseWatersNull,
    disableScripts: true,
  };

  cy.visit(WhoseWaterUrl, { qs: { ...testParams } });

  cy.findByRole("textbox").should("exist");
});
```

All that is required is to pass an additional query-string parameter called `disableScripts` and set it to `true`. While this does not disable JavaScript in the browser, it prevents the client-side script bundles from loading and ensures the app is completely server-side rendered. This is equivalent to disabling JavaScript.

#### Important notes

- In MSW handlers, always prefer `res` over `res.once` as the `testCaseId` is lost from the URL when tests involve form submissions or navigation to other pages; although `res.once` will work in most cases, it is easier to just stick to `res` to ensure the API mocks persist for the duration of the test
- Where tests perform navigation, ensure API calls in the `loader` of the destination page are also mocked
- When developing locally, a good way to ensure MSW mocks have been set up properly is by shutting down the orchestration service and then running tests. Watch for occurrences of `[MSW] Error` in the server console and add any missing mocks.
- MSW ignores query-string parameters in API URLs. Whenever there is an API URL containing query-string parameters, create an alternate URL specifically for MSW. For example, instead of using `searchVesselName` from `app/helpers/urls.ts`, use `mockSearchVesselName` instead (also defined in the same file). Note that the query-string part of the URL has been removed.
- Similarly, where the dynamic part of the API URL does not matter, use a mock URL containing placeholder. For example, in the MSW handlers use `mockGetAllDocumentsUrl` instead of `getAllDocumentsUrl`. It has placeholders `:year` and `:month` and this URL can be used in MSW handlers in situations where the values for year and month are not important to the test.

#### Useful links

- [Cypress](https://docs.cypress.io/guides/core-concepts/introduction-to-cypress)
- [Cypress API](https://docs.cypress.io/api/table-of-contents)
- [Mock Service Worker](https://mswjs.io/docs/api/rest)

### Running all tests

- Ensure the app has been started with `npm run :test:start`
- To run all tests and to generate stats for [code coverage](code-coverage): `npm run :test:all`
- View stats for code coverage in the `coverage` folder

### Code coverage

Generating stats for code coverage relies on the code being instrumented. The `:test:start` npm script has a `pre` script that generates instrumented code and puts it in the `instrumented` folder. Remix then uses the `instrumented` folder to build the app.

The stats for code coverage are stored in the `coverage` folder.

The `:test:all` npm script will run all tests and will generate aggregated stats for code coverage.

### Continuous Integration (CI)

Run the following:

```shell
npm run :test:start
npm run :test:ci
```

# Things to Consider

- This repository should use GitFlow as a branching strategy.
- <img
    src="docs/images/GitFlow-branching-strategy.png"
    alt="Branching Strategy"
    title="GitFlow"
    style="display: inline-block; margin: 0 auto; max-width: 350px">
- If you won't call your branch as per agreed branching `standards`, the Azure pipeline won't start or may fail to deploy an image.

## Notes on Remix

### Loading and refreshing data

In Remix, data is typically loaded by the `loader` function that executes server side. Here's more from Sergio Xalambrí, a popular contributor on Remix forums, on how the `loader` function works:

> Because the fetch happens outside Remix loaders, you need to fetch server side to provide data to your context for the SSR and then fetch again (or somehow share the data) client side to provide the same data again. This is another reason why using a loader is better, you don’t need to care about this.
>
> ...Remix doesn’t fetch a loader or already has data for when doing a navigation, only after a form submission, the root is also not only used for / but for every route. Again it will be called in the first request of the app and then after a form submission
>
> The render happens at any time, that’s React, but the fetch doesn’t, `useLoaderData` is not running the loader just accessing the data

Please see the entry here on [stackoverflow](https://stackoverflow.com/questions/71043515/use-loader-before-matching-any-route-for-context-global-store) for more context.

If data is required to be refreshed client side, we can use the `useDataRefresh` hook from `remix-utils` like so:

```javascript
import { useDataRefresh } from "remix-utils/useDataRefresh";

let { refresh } = useDataRefresh();

// The refresh function can then be invoked anywhere, for example, in useEffect
useEffect(() => refresh(), [refresh]);
```

Normally, the only time the `loader` function gets called again after the initial render is if the page has an `action` method and a form submission occurs. For pages that do not have an `action` method or if we would like to refresh data without explicitly submitting a form we rely on this special dummy file `app/routes/dev/null.ts` and the `action` method there just returns `null`. Upon refresh, the `loader` function will be invoked again.

#### Useful links

- https://remix.run/docs/en/v1/api/conventions
- https://remix.run/docs/en/v1/api/remix
- https://remix.run/docs/en/v1/guides/data-loading
- https://remix.run/docs/en/v1/guides/data-writes
- https://remix.run/docs/en/v1/guides/routing#dynamic-segments
- https://remix.run/docs/en/v1/guides/styling
- https://github.com/sergiodxa/remix-utils
