import { ROUTES_PATH } from "../constants/routes.js";

export default class Logout {
    constructor({ document, onNavigate, localStorage }) {
        this.document = document;
        this.onNavigate = onNavigate;
        this.localStorage = localStorage;
        $("#layout-disconnect")
            .off("click")
            .on("click", (e) => this.handleClick(e));
    }

    handleClick = (e) => {
        this.localStorage.clear();
        this.onNavigate(ROUTES_PATH["Login"]);
        console.log("CLICK");
    };
}
