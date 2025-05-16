import JSBI from 'jsbi';
import * as math from 'mathjs';
import { absolute, ModPow } from './Helper';

abstract class Kangaroo{
    generator: JSBI
    primeModulus: JSBI;
    position: JSBI;
    period: JSBI;
    step: JSBI;
    stepFunction: (n : JSBI) => JSBI;

    constructor(generator: JSBI, primeModulus: JSBI, stepFunction: (n : JSBI) => JSBI) {
        this.generator = generator;
        this.primeModulus = primeModulus;
        this.position = JSBI.BigInt(0);
        this.period = JSBI.BigInt(0);
        this.step = JSBI.BigInt(0);
        this.stepFunction = stepFunction;
    }
    abstract jump(): void;

    protected computeStep(): JSBI{
        return this.stepFunction(this.position);
    }
}


class TameKangaroo extends Kangaroo{
    constructor(generator: JSBI, primeModulus: JSBI, b: JSBI, 
        stepFunction: (n:JSBI)=> JSBI) {
        super(generator, primeModulus, stepFunction);
        this.period = b;
        this.position = ModPow(this.generator, b, this.primeModulus);
    }

    jump(): void {
        this.step = this.computeStep();
        this.position = JSBI.remainder(JSBI.multiply(this.position,
            ModPow(this.generator, this.step, this.primeModulus)) ,
            this.primeModulus);
        this.period = JSBI.add(this.period, this.step);
    }
}

class WildKangaroo extends Kangaroo{
    constructor(generator: JSBI, primeModulus:JSBI, h: JSBI, stepFunction: (n:JSBI) => JSBI){
        super(generator, primeModulus, stepFunction);
        this.position = h;
        this.period = JSBI.BigInt(0);
    }

    jump() : void{
        this.step = this.computeStep();
        this.position = JSBI.remainder(JSBI.multiply(this.position,
            ModPow(this.generator, this.step, this.primeModulus)),
            this.primeModulus);
        this.period = JSBI.add(this.period, this.step);
    }
}

async function solvePollardKangaroo(
    gStr: string,
    hStr: string,
    pStr: string,
    aStr: string,
    bStr: string,
    stepFunctionStr: string
): Promise<string | null> {
    const generator = JSBI.BigInt(gStr);
    const h = JSBI.BigInt(hStr);
    const primeModulus = JSBI.BigInt(pStr);
    const a = JSBI.BigInt(aStr);
    const b = JSBI.BigInt(bStr);

    const stepFunction = (n:JSBI): JSBI => {
        try {
            // Create a simple scope with our value
            const scope = { n: JSBI.toNumber(n) };
            
            // Evaluate the expression string directly
            const result = math.evaluate(stepFunctionStr, scope);
            
            return JSBI.BigInt(result);
          } catch (error) {
            console.error("Error evaluating step function:", error);
            return JSBI.remainder(JSBI.add(n, JSBI.BigInt(1)), JSBI.BigInt(3)); // Fallback
          }
    }

    const tame = new TameKangaroo(generator, primeModulus, b, stepFunction);
    const wild = new WildKangaroo(generator, primeModulus, h, stepFunction);

    const tameMap: Record<string, JSBI> = {};
    const wildMap: Record<string, JSBI> = {};
    let aNumber = JSBI.toNumber(a);
    let bNumber = JSBI.toNumber(b);
    let diff = bNumber - aNumber;
    let sqrtDiff = math.sqrt(Math.max(0, diff));
    let numberOfSteps = Math.floor(typeof sqrtDiff === 'number' ? sqrtDiff : sqrtDiff.re);

    for (let i = 0; i <= numberOfSteps; i++) {
        console.log(`  Wild Kangaroo - Position: ${wild.position.toString()}, Period: ${wild.period.toString()}`);
        console.log(`  Tame Kangaroo - Position: ${tame.position.toString()}, Period: ${tame.period.toString()}`);

        if (tameMap[wild.position.toString()] !== undefined) {
            const tamePeriod = tameMap[wild.position.toString()];
            const result = JSBI.remainder(absolute(JSBI.subtract(tamePeriod, wild.period)), JSBI.subtract(primeModulus, JSBI.BigInt(1)));
            return result.toString();
        }

        if (wildMap[tame.position.toString()] !== undefined) {
            const wildPeriod = wildMap[tame.position.toString()];
            const result = JSBI.remainder(absolute(JSBI.subtract(wildPeriod, tame.period)), JSBI.subtract(primeModulus, JSBI.BigInt(1)));
            return result.toString();
        }

        tameMap[tame.position.toString()] = tame.period;
        wildMap[wild.position.toString()] = wild.period;

        wild.jump();
        tame.jump();
    }
  return "No solution found.";
}

export default solvePollardKangaroo;