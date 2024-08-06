import { screen, fireEvent, render } from "@testing-library/react";
import Leagues from "./Leagues";

import leagues from "../../../data/selectedsports.json";

describe("Leagues tests", () => {
  test("Leagues displays all leagues", async () => {
    render(
      <Leagues leaguesCollection={[...leagues]} setCurrentLeague={jest.fn()} />,
    );
    leagues.forEach((league) => {
      expect(screen.getByRole("button", { name: league.title })).toBeVisible();
    });
  });

  test("Clicking on a league selects the league", async () => {
    const handler = jest.fn();
    render(
      <Leagues leaguesCollection={[...leagues]} setCurrentLeague={handler} />,
    );

    const elements = await Promise.all(
      leagues.map((league) => screen.findByText(league.title)),
    );

    leagues.forEach((league, i) => {
      fireEvent.click(elements[i]);
      expect(handler).toHaveBeenCalledWith(league);
    });
  });

  test("Leagues are displayed in correct order", async () => {
    render(
      <Leagues leaguesCollection={[...leagues]} setCurrentLeague={jest.fn()} />,
    );

    const leagueTitles = leagues.map((league) => league.title);

    const items = await screen.getAllByTestId("league");
    const displayedTitles = items.map((item) => item.innerHTML);

    expect(displayedTitles).toEqual(leagueTitles);
  });

  test("Props are not mutated", () => {
    const inputLeagues = [...leagues];
    render(
      <Leagues leaguesCollection={inputLeagues} setCurrentLeague={jest.fn()} />,
    );

    expect(inputLeagues).toEqual(leagues);
  });
});
