import { WHO_STANDARDS } from './who-standards.js';
/**
 * Calculate Age in Months
 */
export function calculateAgeInMonths(birthDate, measurementDate) {
    const diffTime = Math.abs(measurementDate.getTime() - birthDate.getTime());
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays / 30.4375; // Average days in a month
}
/**
 * Linear Interpolation for LMS parameters
 */
function interpolateLMS(target, data, key) {
    // Sort data just in case
    const sortedData = [...data].sort((a, b) => (a[key] - b[key]));
    // Find surrounding points
    const lower = sortedData.filter(d => d[key] <= target).pop();
    const upper = sortedData.find(d => d[key] >= target);
    if (!lower && !upper)
        return null;
    if (!lower)
        return upper; // Targets before range
    if (!upper)
        return lower; // Targets after range
    if (lower[key] === upper[key])
        return lower;
    // Linear interpolation
    const t = (target - lower[key]) / (upper[key] - lower[key]);
    return {
        l: lower.l + t * (upper.l - lower.l),
        m: lower.m + t * (upper.m - lower.m),
        s: lower.s + t * (upper.s - lower.s),
    };
}
/**
 * Calculate Z-Score using LMS method
 * Formula: Z = ((X/M)^L - 1) / (L * S)
 */
export function calculateZScore(value, lms) {
    if (lms.l === 0) {
        return Math.log(value / lms.m) / lms.s;
    }
    return (Math.pow(value / lms.m, lms.l) - 1) / (lms.l * lms.s);
}
/**
 * Determine Nutritional Status based on Z-Score
 * Standard deviation cut-offs (SD)
 */
export function determineStatus(zScore, type) {
    // Simple classification based on SD
    // Reference: https://www.who.int/tools/child-growth-standards/standards
    if (type === 'BB/U') {
        // Berat Badan menurut Umur (Weight-for-age)
        if (zScore < -3)
            return "Berat Badan Sangat Kurang"; // Severely underweight
        if (zScore < -2)
            return "Berat Badan Kurang"; // Underweight
        if (zScore > 2)
            return "Risiko Berat Badan Lebih";
        return "Berat Badan Normal";
    }
    if (type === 'TB/U') {
        // Tinggi Badan menurut Umur (Height-for-age)
        if (zScore < -3)
            return "Sangat Pendek (Severely Stunted)";
        if (zScore < -2)
            return "Pendek (Stunted)";
        if (zScore > 3)
            return "Tinggi";
        return "Normal";
    }
    if (type === 'BB/TB') {
        // Berat Badan menurut Tinggi Badan (Weight-for-length/height)
        if (zScore < -3)
            return "Gizi Buruk (Severely Wasted)";
        if (zScore < -2)
            return "Gizi Kurang (Wasted)";
        if (zScore > 3)
            return "Obesitas";
        if (zScore > 2)
            return "Gizi Lebih (Overweight)";
        if (zScore > 1)
            return "Berisiko Gizi Lebih";
        return "Gizi Baik (Normal)";
    }
    if (type === 'LK/U') {
        // Lingkar Kepala menurut Umur (Head Circumference-for-age)
        // Reference: WHO Standards
        if (zScore < -3)
            return "Mikrosefalus Berat";
        if (zScore < -2)
            return "Mikrosefalus";
        if (zScore > 3)
            return "Makrosefalus Berat";
        if (zScore > 2)
            return "Makrosefalus";
        return "Normal";
    }
    return "Tidak Diketahui";
}
/**
 * Main Calculation Function
 */
export function calculateNutritionalStatus(input) {
    const ageMonths = calculateAgeInMonths(input.birthDate, input.measurementDate);
    const genderKey = input.gender === 'L' ? 'boys' : 'girls';
    // 1. BB/U (Weight-for-age)
    const lmsWFA = interpolateLMS(ageMonths, WHO_STANDARDS.wfa[genderKey], 'age');
    const zScoreWFA = lmsWFA ? calculateZScore(input.weight, lmsWFA) : null;
    const statusWFA = zScoreWFA !== null ? determineStatus(zScoreWFA, 'BB/U') : null;
    // 2. TB/U (Height-for-age)
    const lmsLHFA = interpolateLMS(ageMonths, WHO_STANDARDS.lhfa[genderKey], 'age');
    const zScoreLHFA = lmsLHFA ? calculateZScore(input.height, lmsLHFA) : null;
    const statusLHFA = zScoreLHFA !== null ? determineStatus(zScoreLHFA, 'TB/U') : null;
    // 3. BB/TB (Weight-for-height)
    // Logic: Use WFL if age < 24 months (or length < 87cm), WFH if older.
    // Simplified here: Use provided height (cm) against WFL standards.
    const lmsWFL = interpolateLMS(input.height, WHO_STANDARDS.wfl[genderKey], 'length');
    const zScoreWFL = lmsWFL ? calculateZScore(input.weight, lmsWFL) : null;
    const statusWFL = zScoreWFL !== null ? determineStatus(zScoreWFL, 'BB/TB') : null;
    // 4. LK/U (Head Circumference-for-age)
    let zScoreHC = null;
    let statusHC = null;
    if (input.headCircumference) {
        const lmsHC = interpolateLMS(ageMonths, WHO_STANDARDS.hcfa[genderKey], 'age');
        zScoreHC = lmsHC ? calculateZScore(input.headCircumference, lmsHC) : null;
        statusHC = zScoreHC !== null ? determineStatus(zScoreHC, 'LK/U') : null;
    }
    return {
        ageMonths,
        wfa: { zScore: zScoreWFA, status: statusWFA },
        lhfa: { zScore: zScoreLHFA, status: statusLHFA },
        wfl: { zScore: zScoreWFL, status: statusWFL },
        hcfa: { zScore: zScoreHC, status: statusHC }, // New
    };
}
