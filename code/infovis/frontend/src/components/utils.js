const clamp = (number, lower, upper) => {
    return Math.max(lower, Math.min(upper, number));
}

export { clamp };