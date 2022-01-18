/**
 * Subtracts elements of set `b` from set `a`
 * 
 * @param a
 * @param b 
 * @returns `a` - `b`
 */
export function setDiff<T>(a: Set<T>, b: Set<T>) {
    return new Set<T>([...a].filter(e => !b.has(e)))
}