import { render, screen } from "@testing-library/react";
import LoginWidget from "./LoginWidget";

jest.mock("next-auth/react");
jest.mock("next/router", () => require("next-router-mock")); // eslint-disable-line global-require

describe("ButtonBar: ButtonBar tests", () => {
  test("Navbar: displays mansfield button and dropdown button", () => {
    render(<LoginWidget />);

    expect(screen.getByTestId("loginButton")).toBeVisible();
  });
});
