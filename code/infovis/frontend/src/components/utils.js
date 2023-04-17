const clamp = (number, lower, upper) => {
    return Math.max(lower, Math.min(upper, number));
}

// http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
const HSVtoRGB = (h, s, v) => {
    var r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

/* accepts parameters
 * r  Object = {r:x, g:y, b:z}
 * OR 
 * r, g, b
*/
const RGBtoHSV = (r, g, b) => {
    var max = Math.max(r, g, b), min = Math.min(r, g, b),
        d = max - min,
        h,
        s = (max === 0 ? 0 : d / max),
        v = max / 255;

    switch (max) {
        case min: h = 0; break;
        case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
        case g: h = (b - r) + d * 2; h /= 6 * d; break;
        case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }

    return {
        h: h,
        s: s,
        v: v
    };
}

const RGBtoHex = (r, g, b) => {
    let rhex = Number(r).toString(16);
    let ghex = Number(g).toString(16);
    let bhex = Number(b).toString(16);

    if(rhex.length < 2) {
        rhex = "0" + rhex;
    }

    if(ghex.length < 2) {
        ghex = "0" + ghex;
    }

    if(bhex.length < 2) {
        bhex = "0" + bhex;
    }

    const hex = `#${rhex}${ghex}${bhex}`;
    return hex;
}

export { clamp, RGBtoHSV, RGBtoHex, HSVtoRGB };