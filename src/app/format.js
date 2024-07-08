export const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const ye = new Intl.DateTimeFormat("fr", { year: "numeric" }).format(date);
    const mo = new Intl.DateTimeFormat("fr", { month: "short" }).format(date);
    const da = new Intl.DateTimeFormat("fr", { day: "2-digit" }).format(date);
    const month = mo.charAt(0).toUpperCase() + mo.slice(1);
    return `${parseInt(da)} ${month}. ${ye.toString().substr(2, 4)}`;
};

export const verifyDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
    }
    return date;
};

export const formatStatus = (status) => {
    switch (status) {
        case "pending":
            return "En attente";
        case "accepted":
            return "Accepté";
        case "refused":
            return "Refusé";
        default:
            throw new Error(`Statut inconnu: ${status}`);
    }
};
