export const dniValidator = (dni) => {
    const dniRegex = /^[0-9]{8}[A-Z]$/;
    if (!dniRegex.test(dni)) return false;

    const number = dni.slice(0, 8);
    const letter = dni.slice(8, 9);
    const validLetters = "TRWAGMYFPDXBNJZSQVHLCKET";
    const calculatedLetter = validLetters[number % 23];

    return calculatedLetter === letter;
};
