/**
 * WHO Child Growth Standards (Simplified)
 *
 * NOTE: This file contains a SIMPLIFIED subset of the WHO Child Growth Standards
 * for demonstration purposes. Use linear interpolation for values between points.
 *
 * For production usage, please populate this file with the full dataset from:
 * https://www.who.int/tools/child-growth-standards/standards
 *
 * Data Structure:
 * - age: Month (0-60)
 * - l: Box-Cox power
 * - m: Median
 * - s: Coefficient of variation
 */
export const WHO_STANDARDS = {
    // Weight-for-age (0-60 months)
    wfa: {
        boys: [
            { age: 0, l: 0.1818, m: 3.3464, s: 0.1274 },
            { age: 6, l: 0.0886, m: 7.9423, s: 0.1105 },
            { age: 12, l: 0.0163, m: 9.6455, s: 0.1119 },
            { age: 24, l: -0.0697, m: 12.151, s: 0.1109 },
            { age: 36, l: -0.1118, m: 14.3399, s: 0.1126 },
            { age: 48, l: -0.1384, m: 16.3323, s: 0.1161 },
            { age: 60, l: -0.1577, m: 18.2913, s: 0.1205 }
        ],
        girls: [
            { age: 0, l: 0.1764, m: 3.2323, s: 0.1287 },
            { age: 6, l: 0.0440, m: 7.2970, s: 0.1147 },
            { age: 12, l: -0.0163, m: 8.9515, s: 0.1124 },
            { age: 24, l: -0.0818, m: 11.482, s: 0.1084 },
            { age: 36, l: -0.1166, m: 13.9300, s: 0.1085 },
            { age: 48, l: -0.1394, m: 16.1158, s: 0.1123 },
            { age: 60, l: -0.1549, m: 18.1504, s: 0.1174 }
        ]
    },
    // Length/Height-for-age (0-60 months)
    lhfa: {
        boys: [
            { age: 0, l: 1, m: 49.88, s: 0.0380 },
            { age: 6, l: 1, m: 67.62, s: 0.0324 },
            { age: 12, l: 1, m: 75.75, s: 0.0325 },
            { age: 24, l: 1, m: 87.83, s: 0.0357 }, // Standing height starts effectively at 2yo
            { age: 36, l: 1, m: 96.10, s: 0.0366 },
            { age: 48, l: 1, m: 103.3, s: 0.0375 },
            { age: 60, l: 1, m: 110.0, s: 0.0386 }
        ],
        girls: [
            { age: 0, l: 1, m: 49.15, s: 0.0379 },
            { age: 6, l: 1, m: 65.73, s: 0.0336 },
            { age: 12, l: 1, m: 74.02, s: 0.0338 },
            { age: 24, l: 1, m: 86.40, s: 0.0364 },
            { age: 36, l: 1, m: 95.10, s: 0.0373 },
            { age: 48, l: 1, m: 102.7, s: 0.0383 },
            { age: 60, l: 1, m: 109.46, s: 0.0394 }
        ]
    },
    // Weight-for-length/height
    // Note: Simplified. Usually separated into WFL (0-2yo, <87cm) and WFH (2-5yo, >87cm)
    // Here merging simplified points by length/height (cm)
    wfl: {
        boys: [
            { length: 45, l: 0.3664, m: 2.443, s: 0.0917 },
            { length: 55, l: 0.2038, m: 4.542, s: 0.0827 },
            { length: 65, l: 0.0604, m: 7.464, s: 0.0766 },
            { length: 75, l: -0.0934, m: 9.871, s: 0.0762 },
            { length: 85, l: -0.1171, m: 12.19, s: 0.0772 },
            { length: 95, l: -0.1171, m: 14.49, s: 0.0792 }, // Approximate merge point
            { length: 105, l: -0.1171, m: 17.18, s: 0.0822 },
            { length: 115, l: -0.1171, m: 20.37, s: 0.0863 }
        ],
        girls: [
            { length: 45, l: 0.4285, m: 2.428, s: 0.0911 },
            { length: 55, l: 0.2010, m: 4.298, s: 0.0853 },
            { length: 65, l: 0.0364, m: 6.992, s: 0.0798 },
            { length: 75, l: -0.1090, m: 9.358, s: 0.0783 },
            { length: 85, l: -0.1345, m: 11.69, s: 0.0789 },
            { length: 95, l: -0.1345, m: 14.13, s: 0.0818 },
            { length: 105, l: -0.1345, m: 17.01, s: 0.0866 },
            { length: 115, l: -0.1345, m: 20.48, s: 0.0929 }
        ]
    },
    // Head Circumference-for-age (0-60 months)
    hcfa: {
        boys: [
            { age: 0, l: 1, m: 34.5, s: 0.04 }, // Simplified
            { age: 6, l: 1, m: 43.3, s: 0.03 },
            { age: 12, l: 1, m: 46.1, s: 0.03 },
            { age: 24, l: 1, m: 48.3, s: 0.03 },
            { age: 36, l: 1, m: 49.5, s: 0.03 },
            { age: 48, l: 1, m: 50.5, s: 0.03 },
            { age: 60, l: 1, m: 51.3, s: 0.03 }
        ],
        girls: [
            { age: 0, l: 1, m: 33.9, s: 0.04 },
            { age: 6, l: 1, m: 42.2, s: 0.03 },
            { age: 12, l: 1, m: 45.0, s: 0.03 },
            { age: 24, l: 1, m: 47.2, s: 0.03 },
            { age: 36, l: 1, m: 48.5, s: 0.03 },
            { age: 48, l: 1, m: 49.5, s: 0.03 },
            { age: 60, l: 1, m: 50.3, s: 0.03 }
        ]
    }
};
