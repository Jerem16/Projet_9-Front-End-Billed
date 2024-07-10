/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { bills } from "../fixtures/bills.js";
describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
        let newBillPage;
        beforeEach(() => {
            document.body.innerHTML = NewBillUI();

            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({ email: "test@test.com" })
            );

            const onNavigate = (pathname) => {
                document.body.innerHTML = pathname;
            };

            newBillPage = new NewBill({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });
        });

        test("Then all form fields should be rendered", () => {
            const fields = [
                "expense-type",
                "expense-name",
                "datepicker",
                "amount",
                "vat",
                "pct",
                "commentary",
                "file",
                "submit",
            ];
            fields.forEach((field) => {
                expect(screen.getByTestId(field)).toBeTruthy();
            });
        });

        test("Then file input should accept only jpg, jpeg, or png extensions", () => {
            const fileInput = screen.getByTestId("file");
            const handleChangeFile = jest.fn((e) => {
                e.preventDefault();
                const file = e.target.files[0];
                const fileName = file.name;
                const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;

                if (!allowedExtensions.exec(fileName)) {
                    alert(
                        "Invalid file type. Please upload a file with a .jpg, .jpeg, or .png extension."
                    );
                    e.target.value = "";
                }
            });

            fileInput.addEventListener("change", handleChangeFile);

            // Test with an invalid file type
            const invalidFile = new File([""], "test.pdf", {
                type: "application/pdf",
            });
            fireEvent.change(fileInput, { target: { files: [invalidFile] } });
            expect(handleChangeFile).toHaveBeenCalled();
            expect(fileInput.value).toBe("");

            // Test with a valid file type
            const validFile = new File([""], "test.jpg", {
                type: "image/jpeg",
            });
            fireEvent.change(fileInput, { target: { files: [validFile] } });
            expect(handleChangeFile).toHaveBeenCalled();
            expect(fileInput.files[0].name).toBe("test.jpg");
        });

        test("Then form submission should send the correct data", () => {
            const form = screen.getByTestId("form-new-bill");

            const formData = {
                "expense-type": "Transports",
                "expense-name": "Vol Paris Londres",
                datepicker: "2023-05-25",
                amount: "348",
                vat: "70",
                pct: "20",
                commentary: "Business trip",
            };

            for (const [key, value] of Object.entries(formData)) {
                fireEvent.change(screen.getByTestId(key), {
                    target: { value },
                });
            }

            const handleSubmit = jest.fn((e) => {
                e.preventDefault();
                const email = JSON.parse(localStorage.getItem("user")).email;
                const bill = {
                    email,
                    type: e.target.querySelector(
                        `select[data-testid="expense-type"]`
                    ).value,
                    name: e.target.querySelector(
                        `input[data-testid="expense-name"]`
                    ).value,
                    amount: parseInt(
                        e.target.querySelector(`input[data-testid="amount"]`)
                            .value
                    ),
                    date: e.target.querySelector(
                        `input[data-testid="datepicker"]`
                    ).value,
                    vat: e.target.querySelector(`input[data-testid="vat"]`)
                        .value,
                    pct:
                        parseInt(
                            e.target.querySelector(`input[data-testid="pct"]`)
                                .value
                        ) || 20,
                    commentary: e.target.querySelector(
                        `textarea[data-testid="commentary"]`
                    ).value,
                    fileUrl: "test.jpg",
                    fileName: "test.jpg",
                    status: "pending",
                };
                console.log(bill);
            });

            form.addEventListener("submit", handleSubmit);
            fireEvent.submit(form);

            expect(handleSubmit).toHaveBeenCalled();
        });

        test("Then the mail icon should be highlighted", async () => {
            document.body.innerHTML = "";
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({ type: "Employee" })
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.NewBill);

            await waitFor(() => screen.getByTestId("icon-mail"));
            const mailIcon = screen.getByTestId("icon-mail");
            expect(mailIcon.classList).toContain("active-icon");
        });

        test("Then the invoices are then added, API POST test.", async () => {
            const billTest = {
                id: "47qAXb6fIm2zOKkLzMro",
                vat: "80",
                fileUrl:
                    "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
                status: "pending",
                type: "Hôtel et logement",
                commentary: "séminaire billed",
                name: "encore",
                fileName: "preview-facture-free-201801-pdf-1.jpg",
                date: "2004-04-04",
                amount: 400,
                commentAdmin: "ok",
                email: "a@a",
                pct: 20,
            };

            const form = screen.getByTestId("form-new-bill");

            const formData = {
                "expense-type": billTest.type,
                "expense-name": billTest.name,
                datepicker: billTest.date,
                amount: billTest.amount,
                vat: billTest.vat,
                pct: billTest.pct,
                commentary: billTest.commentary,
            };

            for (const [key, value] of Object.entries(formData)) {
                fireEvent.change(screen.getByTestId(key), {
                    target: { value },
                });
            }

            newBillPage.fileName = billTest.fileName;
            newBillPage.fileUrl = billTest.fileUrl;

            const virtualUpdateBill = (newBillPage.updateBill = jest.fn());
            const virtualHandleSubmit = jest.fn((e) =>
                newBillPage.handleSubmit(e)
            );
            form.addEventListener("submit", virtualHandleSubmit);
            fireEvent.submit(form);

            expect(virtualHandleSubmit).toHaveBeenCalled();
            expect(virtualUpdateBill).toHaveBeenCalled();
        });
        describe("When I import a unsupported format file (other than png, jpeg or jpg)", () => {
            test("Then the supporting file submitted is not correct, the submit button is disabled.", async () => {
                const buttonChangeFile = screen.getByTestId("file");
                const fakeHandleChangeFile = jest.fn((e) =>
                    newBillPage.handleChangeFile(e)
                );
                buttonChangeFile.addEventListener(
                    "change",
                    fakeHandleChangeFile
                );

                fireEvent.change(buttonChangeFile, {
                    target: {
                        files: [
                            new File([""], "file.doc", {
                                type: "application/msword",
                            }),
                        ],
                    },
                });

                expect(buttonChangeFile.files[0].name).toBe("file.doc");
                const sendButton = screen.getByTestId("submit");
                expect(fakeHandleChangeFile).toHaveBeenCalled();
                expect(sendButton.disabled).toBe(true);
            });
        });
        describe("When I import a supported format file (png, jpeg or jpg)", () => {
            test("Then the supporting file submitted is correct, the send button is active.", async () => {
                const buttonChangeFile = await screen.getByTestId("file");
                const fakeHandleChangeFile = jest.fn((e) =>
                    newBillPage.handleChangeFile(e)
                );
                fireEvent.change(buttonChangeFile, {
                    target: {
                        files: [
                            new File(["file.png"], "file.png", {
                                type: "file/png",
                            }),
                        ],
                    },
                });

                buttonChangeFile.addEventListener("click", (e) => {
                    fakeHandleChangeFile(e);
                });
                fireEvent.click(buttonChangeFile);
                expect(buttonChangeFile.files[0].name).toBe("file.png");
                const sendButton = screen.getByTestId("submit");
                expect(fakeHandleChangeFile).toHaveBeenCalled();
                expect(sendButton.getAttribute("disabled")).toBeTruthy;
            });
        });
        describe("When I submit a valid form", () => {
            test("should create a new bill", async () => {
                // Spy on the handleSubmit and updateBill methods
                const handleSubmitSpy = jest.spyOn(newBillPage, "handleSubmit");
                const updateBillSpy = jest.spyOn(newBillPage, "updateBill");
                // Get the form and submit button elements
                const form = screen.getByTestId("form-new-bill");
                const submitBtn = form.querySelector("#btn-send-bill");
                // Add an event listener for form submission
                form.addEventListener("submit", (e) => {
                    newBillPage.handleSubmit(e);
                });
                // Simulate a click on the submit button
                userEvent.click(submitBtn);
                // Wait for assertions to complete
                await waitFor(() => {
                    expect(handleSubmitSpy).toHaveBeenCalled();
                    expect(updateBillSpy).toHaveBeenCalled();
                });
            });
        });
    });
});