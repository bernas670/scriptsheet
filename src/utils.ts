export function setDiff<T>(a: Set<T>, b: Set<T>) {
    return new Set<T>([...a].filter(e => !b.has(e)))
}