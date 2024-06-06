import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { convert } from "../src";

describe("converter", () => {
  test("covert component name", async () => {
    expect(
      await convert(
        "index.vue",
        readFileSync(__dirname + "/fixture/ComponentName.vue").toString(),
      ),
    ).toMatchSnapshot();
  });

  test("covert data", async () => {
    expect(
      await convert(
        "index.vue",
        readFileSync(__dirname + "/fixture/Data.vue").toString(),
      ),
    ).toMatchSnapshot();
  });

  test("covert props", async () => {
    expect(
      await convert(
        "index.vue",
        readFileSync(__dirname + "/fixture/Props.vue").toString(),
      ),
    ).toMatchSnapshot();
  });

  test("covert props array", async () => {
    expect(
      await convert(
        "index.vue",
        readFileSync(__dirname + "/fixture/PropsArray.vue").toString(),
      ),
    ).toMatchSnapshot();
  });

  test("covert methods", async () => {
    expect(
      await convert(
        "index.vue",
        readFileSync(__dirname + "/fixture/Methods.vue").toString(),
      ),
    ).toMatchSnapshot();
  });

  test("covert methods with the function declaration", async () => {
    expect(
      await convert(
        "index.vue",
        readFileSync(__dirname + "/fixture/Methods.vue").toString(),
        {
          useFunctionDeclaration: true,
        },
      ),
    ).toMatchSnapshot();
  });

  test("covert computed", async () => {
    expect(
      await convert(
        "index.vue",
        readFileSync(__dirname + "/fixture/Computed.vue").toString(),
        {
          useFunctionDeclaration: true,
        },
      ),
    ).toMatchSnapshot();
  });

  test("covert watch", async () => {
    expect(
      await convert(
        "index.vue",
        readFileSync(__dirname + "/fixture/Watch.vue").toString(),
        {
          useFunctionDeclaration: true,
        },
      ),
    ).toMatchSnapshot();
  });

  test("covert lifecycle hooks", async () => {
    expect(
      await convert(
        "index.vue",
        readFileSync(__dirname + "/fixture/IntervalHook.vue").toString(),
        {
          useFunctionDeclaration: true,
        },
      ),
    ).toMatchSnapshot();
  });

  test("covert render function", async () => {
    expect(
      await convert(
        "index.vue",
        readFileSync(__dirname + "/fixture/Render.vue").toString(),
        {
          useFunctionDeclaration: true,
        },
      ),
    ).toMatchSnapshot();
  });

  test("covert provide", async () => {
    expect(
      await convert(
        "index.vue",
        readFileSync(__dirname + "/fixture/Provide.vue").toString(),
        {
          useFunctionDeclaration: true,
        },
      ),
    ).toMatchSnapshot();
  });

  test("covert inject", async () => {
    expect(
      await convert(
        "index.vue",
        readFileSync(__dirname + "/fixture/Inject.vue").toString(),
        {
          useFunctionDeclaration: true,
        },
      ),
    ).toMatchSnapshot();
  });

  test("covert emit", async () => {
    expect(
      await convert(
        "index.vue",
        readFileSync(__dirname + "/fixture/Emit.vue").toString(),
        {
          useFunctionDeclaration: true,
        },
      ),
    ).toMatchSnapshot();
  });

  test("covert dom ref", async () => {
    expect(
      await convert(
        "index.vue",
        readFileSync(__dirname + "/fixture/DomRef.vue").toString(),
        {
          useFunctionDeclaration: true,
        },
      ),
    ).toMatchSnapshot();
  });

  test("covert model", async () => {
    expect(
      await convert(
        "index.vue",
        readFileSync(__dirname + "/fixture/Model.vue").toString(),
        {
          useFunctionDeclaration: true,
        },
      ),
    ).toMatchSnapshot();
  });
});
