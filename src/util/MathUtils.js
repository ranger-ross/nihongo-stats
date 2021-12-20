export function sortAndGetMedian(a) {
    const n = a.length;
    a = a.sort((a, b) => a - b);
    if (n % 2 != 0)
        return a[Math.floor(n / 2)];
    const bottomIndex = (n / 2) - 1;
    const topIndex = n / 2;
    return (a[bottomIndex] + a[topIndex]) / 2;
}