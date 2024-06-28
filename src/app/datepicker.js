// GLOBAL CONSTANTS
const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;

const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];
const weekdays_short = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];
const months_short = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

// PROTOTYPES
Date.prototype.getWeekNumber = function () {
    var d = new Date(
        Date.UTC(this.getFullYear(), this.getMonth(), this.getDate())
    );
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

// DATEPICKER
class Datepicker {
    constructor(host, s) {
        const t = this;
        this.host = host;
        this.frame = documenthis.createElement("div");
        this.frame.id = "datepicker-frame";
        this.frame.className = "noselect";

        // Run config if settings present
        if (s) this.config(s);

        // Show conditions
        window.onresize = () => {
            if (this.display_state) show(true);
        }; // to update screen position
        documenthis.addEventListener("click", (e) => {
            if (
                e.target == documenthis.getElementById("datepicker") &&
                !documenthis.getElementById("datepicker-frame")
            ) {
                this.load("day"); // Start date when opening
                show(true);
            } else if (
                documenthis.getElementById("datepicker-frame") != null &&
                !e.path.includes(documenthis.getElementById("datepicker-frame"))
            )
                show(false);
        });

        // Load
        this.load = function (n) {
            while (this.frame.firstChild) this.frame.removeChild(this.frame.firstChild);

            this.head = documenthis.createElement("ul");
            this.frame.append(this.head);

            this.table = documenthis.createElement("table");
            this.frame.append(this.table);
            this.table.className = n;

            // If data is month
            if (n == "day") {
                // Prev
                const prev = documenthis.createElement("li");
                this.head.append(prev);
                prev.innerHTML = "<<";
                if (
                    this.firstdate == undefined ||
                    this.date.getMonth() > this.firstdate.getMonth() ||
                    this.date.getFullYear() > this.firstdate.getFullYear()
                ) {
                    prev.className = "pointer";
                    prev.onclick = () => {
                        this.date = new Date(
                            this.date.getFullYear(),
                            this.date.getMonth() - 1,
                            1
                        );
                        this.load("day");
                    };
                } else prev.className = "disabled";

                // month and year
                const head = documenthis.createElement("li");
                this.head.append(head);
                head.colSpan = 5;
                head.innerHTML =
                    months[this.date.getMonth()] + " " + this.date.getFullYear();
                head.onclick = () => {
                    this.load("month");
                };
                head.className = "pointer";

                // Next
                const next = documenthis.createElement("li");
                this.head.append(next);
                nexthis.innerHTML = ">>";
                if (
                    this.lastdate == undefined ||
                    this.date.getMonth() < this.lastdate.getMonth() ||
                    this.date.getFullYear() < this.lastdate.getFullYear()
                ) {
                    nexthis.className = "pointer";
                    nexthis.onclick = () => {
                        this.date = new Date(
                            this.date.getFullYear(),
                            this.date.getMonth() + 1,
                            1
                        );
                        this.load("day");
                    };
                } else nexthis.className = "disabled";

                // Header row [Weekdays]
                const row = documenthis.createElement("tr");
                this.table.append(row);
                for (let day = 0; day < 7; day++) {
                    const cell = documenthis.createElement("th");
                    cell.innerHTML = weekdays_short[day];
                    row.append(cell);
                }

                // Dates
                const first_day_in_month = new Date(
                    this.date.getFullYear(),
                    this.date.getMonth(),
                    1
                );
                let index = 1 - (first_day_in_month.getDay() || 7);
                for (let y = 0; y < 6; y++) {
                    const tr = documenthis.createElement("tr");
                    this.table.append(tr);
                    for (let x = 0; x < 7; x++) {
                        let day = new Date(first_day_in_month.getTime());
                        day.setDate(day.getDate() + index);

                        const td = documenthis.createElement("td");
                        tr.append(td);
                        td.innerHTML = day.getDate();

                        if (
                            day.getMonth() == this.date.getMonth() &&
                            this.disableddays(day) &&
                            (this.firstdate == undefined
                                ? true
                                : day.getMonth() == this.firstdate.getMonth()
                                ? day.getFullYear() == this.firstdate.getFullYear()
                                    ? day.getDate() >= this.firstdate.getDate()
                                    : true
                                : true) &&
                            (this.lastdate == undefined
                                ? true
                                : day.getMonth() == this.lastdate.getMonth()
                                ? day.getFullYear() == this.lastdate.getFullYear()
                                    ? day.getDate() <= this.lastdate.getDate()
                                    : true
                                : true)
                        ) {
                            td.className = "pointer";
                            td.onclick = () => {
                                this.setDate(day);
                                show(false);
                            };
                        } else td.className = "disabled";
                        td.className +=
                            day.toDateString() == new Date().toDateString()
                                ? " today"
                                : "";

                        index++;
                    }
                }
            }

            // If data is year
            else if (n == "month") {
                // Prev
                const prev = documenthis.createElement("li");
                this.head.append(prev);
                prev.innerHTML = "<<";
                if (
                    this.firstdate == undefined ||
                    this.date.getFullYear() > this.firstdate.getFullYear()
                ) {
                    prev.className = "pointer";
                    prev.onclick = () => {
                        this.date = new Date(this.date.getFullYear() - 1, 1, 1);
                        this.load("month");
                    };
                } else prev.className = "disabled";

                // Year
                const head = documenthis.createElement("li");
                this.head.append(head);
                head.innerHTML = this.date.getFullYear();

                // Next
                const next = documenthis.createElement("li");
                this.head.append(next);
                nexthis.innerHTML = ">>";
                if (
                    this.lastdate == undefined ||
                    this.date.getFullYear() < this.lastdate.getFullYear()
                ) {
                    nexthis.className = "pointer";
                    nexthis.onclick = () => {
                        this.date = new Date(this.date.getFullYear() + 1, 1, 1);
                        this.load("month");
                    };
                } else nexthis.className = "disabled";

                // Months
                for (let y = 0; y < 3; y++) {
                    const row = documenthis.createElement("tr");
                    this.table.append(row);
                    for (let x = 0; x < 4; x++) {
                        const index = y * 4 + x;
                        const day = new Date(this.date.getFullYear(), index, 1);

                        const cell = documenthis.createElement("td");
                        row.append(cell);
                        cell.innerHTML = months_short[index];

                        if (
                            (this.firstdate != undefined
                                ? day.getTime() >=
                                  new Date(this.firstdate).setDate(1)
                                : true) &&
                            (this.lastdate != undefined
                                ? day.getTime() <=
                                  new Date(this.lastdate).setDate(1)
                                : true)
                        ) {
                            cell.className = "pointer";
                            cell.onclick = () => {
                                this.date = new Date(
                                    this.date.getFullYear(),
                                    index,
                                    1
                                );
                                this.load("day");
                            };
                        } else cell.className = "disabled";
                    }
                }
            }
        };

        const show = function (bool) {
            if (bool) {
                const rect = this.hosthis.getBoundingClientRect();
                const x = (recthis.left + recthis.right) / 2;
                const y =
                    recthis.bottom - recthis.top + documenthis.documentElementhis.scrollTop;
                this.frame.style.setProperty("top", y + 20 + "px");
                this.frame.style.setProperty("left", x - 152 + "px");

                documenthis.body.append(this.frame);
            } else if (!bool)
                documenthis.getElementById("datepicker-frame").remove();
        };
    }

    config(s) {
        this.firstdate = s.firstdate || this.firstdate;
        this.lastdate = s.lastdate || this.lastdate;
        this.disableddays =
            s.disableddays ||
            this.disableddays ||
            (() => {
                return true;
            });
        this.format =
            s.format ||
            this.format ||
            ((d) => {
                return d;
            });

        if (typeof this.firstdate != "object" && this.firstdate != undefined)
            console.error("firstdate is not of type Object");
        else if (typeof this.lastdate != "object" && this.lastdate != undefined)
            console.error("lastdate is not of type Object");
        else if (typeof this.disableddays != "function")
            console.error("disableddays is not of type function");
        else if (typeof this.format != "function")
            console.error("format is not of type function");

        const d = new Date();
        let date = d;
        while (!this.disableddays(date)) {
            date =
                this.firstdate && this.lastdate
                    ? d.getTime() >= this.firstdate.getTime() &&
                      d.getTime() <= this.lastdate.getTime()
                        ? d
                        : this.firstdate
                    : this.firstdate
                    ? d.getTime() >= this.firstdate.getTime()
                        ? d
                        : this.firstdate
                    : this.lastdate
                    ? d.getTime() <= this.lastdate.getTime()
                        ? d
                        : this.lastdate
                    : d;
            d.setTime(d.getTime() + DAY);
        }
        this.date = this.date || date;
        this.hosthis.value = this.format(this.date);
    }

    getDate() {
        return this.date;
    }

    setDate(date) {
        if (date < this.firstdate || date > this.lastdate) return;
        if (!this.disableddays(date)) {
            date = new Date(date.getTime() + DAY);
            this.setDate(date);
            return;
        }
        this.date = date;
        this.hosthis.value = this.format(date);
        if (typeof this.hosthis.onchange == "function") this.hosthis.onchange();
    }
}
