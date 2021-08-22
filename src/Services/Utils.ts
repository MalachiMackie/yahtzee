export function arraysEqual<Type>(a?: Type[], b?: Type[], sortFunction?: (a: Type, b: Type) => number, equalsFunction?: (a: Type, b: Type) => boolean, ignoreOrder: boolean = true) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    if (ignoreOrder) {
        if (!!sortFunction) {
            a = [...a].sort(sortFunction);
            b = [...b].sort(sortFunction);    
        } else {
            a = [...a].sort();
            b = [...b].sort();
        }
    }

    if (!equalsFunction) {
        equalsFunction = (a, b) => a === b;
    }

    for (var i = 0; i < a.length; ++i) {
        if (!equalsFunction(a[i], b[i])) return false;
    }
    return true;
}