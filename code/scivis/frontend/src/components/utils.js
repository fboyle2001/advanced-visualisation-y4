const clamp = (number, lower, upper) => {
    return Math.max(lower, Math.min(upper, number));
}

const coordRounding = (raw, pixelsPerDegree, lower, upper) => {
    return clamp(Math.round(raw * pixelsPerDegree) / pixelsPerDegree, lower, upper);
}

// Credit: https://stackoverflow.com/a/17323608 by StuR
const mod = (n, m) => {
    return ((n % m) + m) % m;
}

export { clamp, coordRounding, mod };