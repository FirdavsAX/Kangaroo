import JSBI from 'jsbi';

export const ModPow = (base: JSBI, exp: JSBI, mod: JSBI): JSBI => {
    if (JSBI.equal(mod, JSBI.BigInt(1))) return JSBI.BigInt(0);
    let result = JSBI.BigInt(1);
    base = JSBI.remainder(base, mod);
    while (JSBI.greaterThan(exp, JSBI.BigInt(0))) {
        if (JSBI.equal(JSBI.remainder(exp, JSBI.BigInt(2)), JSBI.BigInt(1))) {
            result = JSBI.remainder(JSBI.multiply(result, base), mod);
        }
        exp = JSBI.signedRightShift(exp, JSBI.BigInt(1));
        base = JSBI.remainder(JSBI.multiply(base, base), mod);
    }
    return result;
};

export const absolute = (x : JSBI) :JSBI =>{
    if(JSBI.lessThan(x, JSBI.BigInt(0))){
        return JSBI.unaryMinus(x);
    }
    return x;
}