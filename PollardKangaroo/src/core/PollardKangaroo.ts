import JSBI from 'jsbi';
import * as math from 'mathjs';

/**
 * KangarooResult:
 *   - tameMap:  { [positionStr]: periodBigInt }
 *   - wildMap:  { [positionStr]: periodBigInt }
 *   - result:   JSBI  (the discrete log x)
 *   - collisionPosition: JSBI  (where tame & wild met)
 */
export class KangarooResult {
  tameMap: Record<string, JSBI>;
  wildMap: Record<string, JSBI>;
  result: JSBI;
  collisionPosition: JSBI;

  constructor(
    tameMap: Record<string, JSBI>,
    wildMap: Record<string, JSBI>,
    result: JSBI,
    collisionPosition: JSBI
  ) {
    this.tameMap = tameMap;
    this.wildMap = wildMap;
    this.result = result;
    this.collisionPosition = collisionPosition;
  }
}

// ————————————————————————————————————————————————————————————————————————————————
//  Utilities: modular exponentiation, step‐function parser, etc.
// ————————————————————————————————————————————————————————————————————————————————

/**
 * modPow(base, exp, mod) → (base^exp mod mod), all JSBI
 */
function modPow(base: JSBI, exponent: JSBI, modulus: JSBI): JSBI {
  let result = JSBI.BigInt(1);
  let b = JSBI.remainder(base, modulus);
  let e = exponent;

  while (JSBI.greaterThan(e, JSBI.BigInt(0))) {
    // if (e & 1) == 1  → multiply
    if (JSBI.notEqual(JSBI.bitwiseAnd(e, JSBI.BigInt(1)), JSBI.BigInt(0))) {
      result = JSBI.remainder(JSBI.multiply(result, b), modulus);
    }
    // square base
    b = JSBI.remainder(JSBI.multiply(b, b), modulus);
    // shift exponent right by 1
    e = JSBI.signedRightShift(e, JSBI.BigInt(1));
  }

  return result;
}

/**
 * Builds a step function w(n) from a mathjs expression string.
 *   - `stepFunctionStr` is something like "1 + (n % 5)" or "2^(n % 20)"
 *   - We evaluate it by converting JSBI→Number for mathjs, then back to JSBI.
 */
function makeStepFunction(stepFunctionStr: string): (n: JSBI) => JSBI {
  return (n: JSBI): JSBI => {
    try {
      // Convert JSBI n to a plain Number for mathjs
      const scope = { n: JSBI.toNumber(n) };
      const raw = math.evaluate(stepFunctionStr, scope);
      // mathjs may return a number or a Complex; take real part if Complex
      const stepNum: number =
        typeof raw === 'number' ? raw : (raw as any).re ?? NaN;

      if (!Number.isInteger(stepNum) || stepNum < 0) {
        throw new Error(`Step must be non‐negative integer; got ${stepNum}`);
      }
      return JSBI.BigInt(Math.floor(stepNum));
    } catch (err) {
      console.warn('Error evaluating step function; defaulting to 1:', err);
      return JSBI.BigInt(1);
    }
  };
}

// ————————————————————————————————————————————————————————————————————————————————
//  solvePollardKangaroo
//    Finds x ∈ [a, b] s.t. g^x ≡ h mod p using Pollard’s Kangaroo (Lambda).
//    We build and return both tameMap & wildMap so that the React <StepsBar>
//    can iterate through them in order.
// ————————————————————————————————————————————————————————————————————————————————

/**
 * @param gStr            Generator g (decimal string)
 * @param hStr            Target h = g^x mod p (decimal string)
 * @param pStr            Prime modulus p (decimal string)
 * @param aStr            Lower bound a (decimal string)
 * @param bStr            Upper bound b (decimal string)
 * @param stepFunctionStr A MathJS expression in variable `n` ⇒ returns non‐neg integer
 *
 * @returns KangarooResult if found, otherwise null
 */
export async function solvePollardKangaroo(
  gStr: string,
  hStr: string,
  pStr: string,
  aStr: string,
  bStr: string,
  stepFunctionStr: string
): Promise<KangarooResult | null> {
  // 1) Parse inputs
  const g = JSBI.BigInt(gStr);
  const h = JSBI.BigInt(hStr);
  const p = JSBI.BigInt(pStr);
  const a = JSBI.BigInt(aStr);
  const b = JSBI.BigInt(bStr);

  if (JSBI.lessThan(b, a)) {
    throw new Error('Lower bound a must be ≤ upper bound b.');
  }

  // Order minus one = p – 1
  const orderMinusOne = JSBI.subtract(p, JSBI.BigInt(1));

  // 2) Build step function w(n)
  const stepFunction = makeStepFunction(stepFunctionStr);

  // 3) Precompute N = ⌈√(b – a)⌉
  const abDiff = JSBI.subtract(b, a); // JSBI
  const diffNum = JSBI.toNumber(abDiff);
  if (diffNum < 0) {
    return null;
  }
  const N = Math.ceil(Math.sqrt(diffNum));

  // 4) Prepare maps that record (positionString → period BigInt)
  const tameMap: Record<string, JSBI> = {};
  const wildMap: Record<string, JSBI> = {};

  // ————————————————————————————————————————————————————————————————————————————————
  // 5) TAMED KANGAROO:
  //      Start at g^b.  
  //      Jump exactly N times, but record *all* intermediate (position→period) into tameMap.
  //      At step i, we do:
  //         s = w(position_i)
  //         position_{i+1} = position_i * g^s mod p
  //         period_{i+1}   = period_i + s
  //      When we finish N jumps, we have (tameFinalPos, dT).
  // ————————————————————————————————————————————————————————————————————————————————

  let tamePos = modPow(g, b, p);   // starting position = g^b mod p
  let dT = JSBI.BigInt(0);         // cumulative distance = b initially counted as 0; we’ll add each w(·)

  // Record the initial “step 0” (position = g^b, period = b) 
  // Even though Pollard’s description says “period starts at b,” 
  // we combine that b into the first period by convention:
  tameMap[tamePos.toString()] = b; // store period = b

  // Now jump N times, each time record the new (position → period)
  for (let i = 0; i < N; i++) {
    // compute step s = w(tamePos)
    const s = stepFunction(tamePos);
    // update distance
    dT = JSBI.add(dT, s);
    // update position: tamePos ← tamePos * g^s mod p
    const gToS = modPow(g, s, p);
    tamePos = JSBI.remainder(JSBI.multiply(tamePos, gToS), p);

    // period at this new position = (b + dT)
    const period_i = JSBI.add(b, dT);
    tameMap[tamePos.toString()] = period_i;
  }

  // After N jumps:
  //   final tame position = tamePos
  //   total “distance” from b = dT
  //   so the actual “exponent” at tamePos is (b + dT)
  const tameFinalPos = tamePos;
  // const totalTamePeriod = JSBI.add(b, dT); // this = b + ∑ w(·)

  // ————————————————————————————————————————————————————————————————————————————————
  // 6) WILD KANGAROO:
  //      Start at h.  Jump until position == tameFinalPos.
  //      Each jump i:
  //         s = w(wildPos)
  //         wildPos ← wildPos * g^s mod p
  //         dW ← dW + s
  //      We also record each intermediate (position → period) into wildMap.
  //      Stop as soon as wildPos == tameFinalPos.  Let dW be the sum of all w(·) 
  //      (so the “exponent” at wildPos is 0 + dW, since we started at h = g^x initially).
  // ————————————————————————————————————————————————————————————————————————————————

  let wildPos = h;
  let dW = JSBI.BigInt(0); 
  // record initial wild:  position = h, period = 0
  wildMap[wildPos.toString()] = JSBI.BigInt(0);

  const maxWildSteps = N * 5; // some reasonable cap (e.g. 5·N) to avoid infinite loops
  let stepsTaken = 0;

  while (!JSBI.equal(wildPos, tameFinalPos)) {
    if (stepsTaken > maxWildSteps) {
      // give up if no collision within a reasonable bound
      return null;
    }
    stepsTaken++;

    // compute step s = w(wildPos)
    const s = stepFunction(wildPos);
    dW = JSBI.add(dW, s);

    // update position: wildPos ← wildPos * g^s mod p
    const gToS = modPow(g, s, p);
    wildPos = JSBI.remainder(JSBI.multiply(wildPos, gToS), p);

    // record into wildMap: new period = dW
    wildMap[wildPos.toString()] = dW;
  }

  // Once we exit, wildPos == tameFinalPos.  periods are:
  //   • tame’s period at that same position = (b + dT) from tameMap
  //   • wild’s period at that position = dW   from wildMap
  
  const tamePeriodAtCollision = tameMap[tameFinalPos.toString()]!;
  const wildPeriodAtCollision = wildMap[tameFinalPos.toString()]!;

  // Solve for x:
  //    g^(b + dT)  =  h * g^(dW)
  // => g^x       =  h
  // => x ≡ (b + dT) − (0 + dW)   (mod p − 1)
  // => x = (tamePeriodAtCollision − wildPeriodAtCollision) mod (p − 1)
  let periodDiff = JSBI.subtract(tamePeriodAtCollision, wildPeriodAtCollision);
  let x = JSBI.remainder(periodDiff, orderMinusOne);
  if (JSBI.lessThan(x, JSBI.BigInt(0))) {
    x = JSBI.add(x, orderMinusOne);
  }

  return new KangarooResult(
    tameMap,
    wildMap,
    x,
    tameFinalPos
  );
}
