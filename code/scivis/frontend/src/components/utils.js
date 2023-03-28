const clamp = (number, lower, upper) => {
    return Math.max(lower, Math.min(upper, number));
}

const coordRounding = (raw, pixelsPerDegree, lower, upper) => {
    return clamp(Math.round(raw * pixelsPerDegree) / pixelsPerDegree, lower, upper);
}

export { clamp, coordRounding };