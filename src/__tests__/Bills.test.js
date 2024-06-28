/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { formatDate } from "../app/format.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", async () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                })
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);
            await waitFor(() => screen.getByTestId("icon-window"));
            const windowIcon = screen.getByTestId("icon-window");
            // to-do write expect expression
            expect(windowIcon).toBeTruthy(); // Vérifie si l'icône est présente
        });

        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({ data: bills });

            // Récupérer les dates depuis le DOM
            const dateElements = screen.getAllByText((content, element) => {
                const datePattern = /^\d{1,2} [A-Za-z]{3,}\. \d{2}$/; 
                return (
                    datePattern.test(content) &&
                    element.tagName.toLowerCase() === "td"
                );
            });

            const dates = dateElements.map((el) => el.innerHTML);
            console.log(dates);

            // Convertir les dates pour les comparer
            const dateToComparable = (dateStr) => {
                const date = new Date(dateStr);
                return date;
            };

            const antiChrono = (a, b) =>
                dateToComparable(a) < dateToComparable(b) ? 1 : -1;

            const datesSorted = [...dates]
                .sort(antiChrono)
                .map((date) => formatDate(date));

            expect(dates).toEqual(datesSorted);
        });
    });
});
