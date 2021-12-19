/**
 * A test language with simple instructions 
 * to learn how t do things
 * 
 */
const Colors = require('./util/colors');
const ASCII = require('./util/ascii');
const Memory = require('./util/memory.js');
const fs = require('fs');
const { argv, exit } = require('process');

if (!(argv.includes('-src'))) {
    console.error(`${Colors.Red}[POOTIS] Missing argument "-src <PathToSourceFile>"${Colors.Reset}`);
    exit();
}

const pathToSourceFile = argv[argv.indexOf('-src') + 1];
if (pathToSourceFile.endsWith('.pootis') || pathToSourceFile.endsWith('.pts')) { } else {
    console.error(`${Colors.Red}[POOTIS] Provided source file must be file type .pootis or .pts${Colors.Reset}`);
    exit();
}
var source;
try {
    source = fs.readFileSync(pathToSourceFile).toString();
} catch (error) {
    if (error.code === 'ENOENT') {
        console.error(`${Colors.Red}[POOTIS] No such file or directory "${pathToSourceFile}"${Colors.Reset}`);
        exit();
    }
}

/**
 * Source code is read and executed from here on
 */

// Program memory
var MEMORY = new Memory(16);

// Main loop going over every character
for (var i = 0; i < source.length; i++) {
    var instruction = source[i];

    /* INSTRUCTIONS
    * Move one memory address to the right: >
    * Move one memory address to the left: <
    * Increment value in current cell: +
    * Decrement value in current cell: -
    * Insert line break into STDOUT: l
    * Print out the application memory: m
    * Print the raw value of the current cell: r
    * Use the value of the current cell as ASCII code to print a char: c
    * Exit program: 0 
    * 
    * SYNTAX:
    * Loops: [<Instructions>:<How often to execute the list of instructions>]
    * Sum of X numbers: Sum(a, b, c, ...)
    */
    if (instruction === '>') MEMORY.M_MR();
    if (instruction === '<') MEMORY.M_ML();
    if (instruction === '+') MEMORY.M_INCREMENT();
    if (instruction === '-') MEMORY.M_DECREMENT();
    if (instruction === 'l') process.stdout.write('\n');
    if (instruction === 'm') MEMORY.M_PRINT();
    if (instruction === 'r') console.log(MEMORY.M_CVAL());
    if (instruction === 'c') process.stdout.write(P_ASCII(MEMORY.M_CVAL()));
    if (instruction === '0') exit();

    if (instruction === '{') {
        var first = i;
        for (let j = i; j < source.length; j++) {
            i = j;
            if (source[j] === '}') {
                var second = j;
                // execute code and return
                const INBETWEEN = source.substring(first + 1, second);
                i = second;
                var LOOP_PARTS = INBETWEEN.split(':');
                P_LOOP(LOOP_PARTS[0], LOOP_PARTS[1]);
                break;
            }
        }
    }

    if (instruction === 'S') {
        var first = i + 3;
        for (let j = i; j < source.length; j++) {
            i = j;
            if (source[j] === ')') {
                var second = j;
                // execute code and return
                const INBETWEEN = source.substring(first + 1, second);
                const FUNC_ARGS = INBETWEEN.match(/\d+/g).map(Number);
                const sum = FUNC_ARGS.reduce((partial_sum, a) => partial_sum + a, 0);
                MEMORY.M_SET_MEM_CL_VAL(sum);
                i = second;
                break;
            }
        }
    }
}

/**
 * Functions
 * P_ indicates internal functions (POOTIS_)
 */
function P_LOOP(INSTRS, TIMES) {
    for (let j = 0; j < TIMES; j++) {
        for (let i = 0; i < INSTRS.length; i++) {
            var instruction = INSTRS[i];
            if (instruction === '{') {
                console.error(`${Colors.Red}[POOTIS] Can not nest loops${Colors.Reset}`);
                exit();
            }

            if (instruction === 'S') {
                console.log(P_SYNTAX_CHECK(++i, 2, 'Sum'));

                var first = i + 3;
                for (let j = i; j < source.length; j++) {
                    i = j;
                    if (source[j] === ')') {
                        var second = j;
                        // execute code and return
                        const INBETWEEN = source.substring(first + 1, second);
                        const FUNC_ARGS = INBETWEEN.match(/\d+/g).map(Number);
                        const sum = FUNC_ARGS.reduce((partial_sum, a) => partial_sum + a, 0);
                        MEMORY.M_SET_MEM_CL_VAL(sum);
                        i = second;
                        instruction = source[i + 1];
                        console.log(instruction);
                        break;
                    }
                }
            }

            if (instruction === '>') MEMORY.M_MR();
            if (instruction === '<') MEMORY.M_ML();
            if (instruction === '+') MEMORY.M_INCREMENT();
            if (instruction === '-') MEMORY.M_DECREMENT();
            if (instruction === 'l') process.stdout.write('\n');
            if (instruction === 'm') MEMORY.M_PRINT();
            if (instruction === 'r') console.log(MEMORY.M_CVAL());
            if (instruction === 'c') process.stdout.write(P_ASCII(MEMORY.M_CVAL()));
            if (instruction === '0') exit();
        }
    }
}

function P_ASCII(AsciiCode) {
    return ASCII[AsciiCode.toString()];
}

function P_SYNTAX_CHECK(StartIndex, AmountOfLettersToCheck, SearchString) {
    var _source = source.substring(StartIndex, StartIndex + AmountOfLettersToCheck + 1);
    console.log(_source);
    return _source === SearchString;
}