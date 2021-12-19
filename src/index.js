/**
 * A test language with simple instructions 
 * to learn how t do things
 * 
 */
const Colors = require('./util/colors');
const { Timer } = require('timer-node');
const timer = new Timer();
timer.start();
const Memory = require('./util/memory.js');
const fs = require('fs');
const { argv, exit } = require('process');
const path = require('path');

if (!(argv.includes('-src'))) {
    console.error(`${Colors.Red}[POOTIS][ERROR] Missing argument "-src <PathToSourceFile>"${Colors.Reset}`);
    exit();
}

var P_MEM_SIZE = 16;
if (argv.includes('-MemSize')) {
    var CLARG_MEM_SIZE = Number(argv[argv.indexOf('-MemSize') + 1]);
    if (isNaN(CLARG_MEM_SIZE)) {
        console.warn(`${Colors.Yellow}[POOTIS][WARNING] Argument "-MemSize" was not passed an integer and was defaulted to 16${Colors.Reset}`);
    } else {
        if (CLARG_MEM_SIZE > 4294967296) {
            console.error(`${Colors.Red}[POOTIS][MEMORY][ERROR] Argument "-MemSize" must not exceed 4294967296${Colors.Reset}`);
            exit();
        }
        const _ = Math.trunc(CLARG_MEM_SIZE);
        if (CLARG_MEM_SIZE % 1 !== 0) console.warn(`${Colors.Yellow}[POOTIS][WARNING] Argument "-MemSize" was not passed an integer but a decimal number. ${CLARG_MEM_SIZE} was tranformed to ${Math.trunc(CLARG_MEM_SIZE)} and set as memory size${Colors.Reset}`);
        P_MEM_SIZE = _;
    }
}

const pathToSourceFile = argv[argv.indexOf('-src') + 1];
if (pathToSourceFile.endsWith('.pootis') || pathToSourceFile.endsWith('.pts')) { } else {
    console.error(`${Colors.Red}[POOTIS][ERROR] Provided source file must be file type .pootis or .pts${Colors.Reset}`);
    exit();
}
var source;
var sourceFileName;
try {
    source = fs.readFileSync(pathToSourceFile).toString();
    sourceFileName = path.basename(pathToSourceFile);
} catch (error) {
    if (error.code === 'ENOENT') {
        console.error(`${Colors.Red}[POOTIS][ERROR] No such file or directory "${pathToSourceFile}"${Colors.Reset}`);
        exit();
    }
}

/**
 * Source code is read and executed from here on
 */

// Program memory
var MEMORY = new Memory(P_MEM_SIZE);

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
                const _FUNC_ARGS = INBETWEEN.match(/\d+/g);
                if (_FUNC_ARGS == null) {
                    console.error(`${Colors.Red}[POOTIS][NATIVE ERROR] Function 'Sum(...)' must be passed at least 1 argument${Colors.Reset}`);
                    exit();
                }
                const FUNC_ARGS = _FUNC_ARGS.map(Number);
                const sum = FUNC_ARGS.reduce((partial_sum, a) => partial_sum + a, 0);
                MEMORY.M_SET_MEM_CL_VAL(sum);
                i = second;
                break;
            }
        }
    }

    if (instruction === 'C') {
        var first = i + 4;
        const _i = i;
        for (let j = i; j < source.length; j++) {
            i = j;
            if (source[j] === ')') {
                var second = j;
                // execute code and return
                const INBETWEEN = source.substring(first + 1, second);
                const _FUNC_ARGS = INBETWEEN.match(/\d+/g);
                if (_FUNC_ARGS == null) {
                    console.error(`${Colors.Red}[POOTIS][NATIVE ERROR] Function 'CVAL(CL_INDEX)' must be passed 1 argument${Colors.Reset}\nIn ${sourceFileName}:\n\tAt instruction ${i} [ ${source[i]} ]`);
                    exit();
                }
                const FUNC_ARGS = _FUNC_ARGS.map(Number);
                const CL_INDEX = FUNC_ARGS[0];
                console.log(`Cell Index: ${CL_INDEX}\nCell Value: ${MEMORY.M_GET_CVAL(CL_INDEX)}`);
                i = second;
                break;
            }
        }
    }
}

// End program execution timer
const P_EXEC_TIME = timer.time();
var P_EXEC_TIME_STR = '';
for (const key in P_EXEC_TIME) {
    if (P_EXEC_TIME[key] > 0) P_EXEC_TIME_STR += `${P_EXEC_TIME[key]}${key} `
}
console.log(`\n${Colors.Magenta}[POOTIS INTERPRETER] Program executed in ${P_EXEC_TIME_STR}${Colors.Reset}`);

/**
 * Functions
 * P_ indicates internal functions (POOTIS_)
 */
function P_LOOP(INSTRS, TIMES) {
    for (let j = 0; j < TIMES; j++) {
        for (let i = 0; i < INSTRS.length; i++) {
            var instruction = INSTRS[i];
            if (instruction === '{') {
                console.error(`${Colors.Red}[POOTIS][ERROR] Nested loops are not allowed${Colors.Reset}`);
                exit();
            }

            if (instruction === 'S') {
                // console.log(P_SYNTAX_CHECK(++i, 2, 'Sum'));

                var first = i + 3;
                for (let j = i; j < source.length; j++) {
                    i = j;
                    if (source[j] === ')') {
                        var second = j;
                        // execute code and return
                        const INBETWEEN = source.substring(first + 1, second);
                        const _FUNC_ARGS = INBETWEEN.match(/\d+/g);
                        if (_FUNC_ARGS == null) {
                            console.error(`${Colors.Red}[POOTIS][NATIVE ERROR] Function 'Sum(...)' must be passed at least 1 argument${Colors.Reset}`);
                            exit();
                        }
                        const FUNC_ARGS = _FUNC_ARGS.map(Number);
                        const sum = FUNC_ARGS.reduce((partial_sum, a) => partial_sum + a, 0);
                        MEMORY.M_SET_MEM_CL_VAL(sum);
                        i = second;
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
    return String.fromCharCode(AsciiCode);
}

function P_SYNTAX_CHECK(StartIndex, AmountOfLettersToCheck, SearchString) {
    var _source = source.substring(StartIndex, StartIndex + AmountOfLettersToCheck + 1);
    console.log(_source);
    return _source === SearchString;
}