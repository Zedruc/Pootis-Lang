const path = require('path');
const fs = require('fs');
const { argv, exit } = require('process');
const Colors = require('../colors');
const { execSync, exec, spawn } = require('child_process');

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
    sourceFileName = path.basename(pathToSourceFile).replace(" ", "_").split('.')[0];
} catch (error) {
    if (error.code === 'ENOENT') {
        console.error(`${Colors.Red}[POOTIS][ERROR] No such file or directory "${pathToSourceFile}"${Colors.Reset}`);
        exit();
    }
}

// Generate .java file
var JavaMain = ``;

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
    if (instruction === '>') JavaMain += "memory.M_MR();\n";
    if (instruction === '<') JavaMain += "memory.M_ML();\n";
    if (instruction === '+') JavaMain += "memory.M_INCREMENT();\n"
    if (instruction === '-') JavaMain += "memory.M_DECREMENT();\n";
    if (instruction === 'l') JavaMain += "System.out.println('\n');\n";
    if (instruction === 'm') JavaMain += "memory.M_PRINT();\n";
    if (instruction === 'r') JavaMain += "System.out.println(memory.M_CVAL());\n";
    if (instruction === 'c') JavaMain += "System.out.print(util.P_ASCII(memory.M_CVAL()));\n"
    if (instruction === '0') JavaMain += "System.exit(0);\n";

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
                // P_LOOP(LOOP_PARTS[0], LOOP_PARTS[1]);
                var JavaLoopInner = ``;
                for (let k = 0; k < LOOP_PARTS.length; k++) {
                    const _instruction = LOOP_PARTS[k];
                    if (_instruction === '>') JavaLoopInner += "memory.M_MR();\n";
                    if (_instruction === '<') JavaLoopInner += "memory.M_ML();\n";
                    if (_instruction === '+') JavaLoopInner += "memory.M_INCREMENT();\n"
                    if (_instruction === '-') JavaLoopInner += "memory.M_DECREMENT();\n";
                    if (_instruction === 'l') JavaLoopInner += "System.out.println('\n');\n";
                    if (_instruction === 'm') JavaLoopInner += "memory.M_PRINT();\n";
                    if (_instruction === 'r') JavaLoopInner += "System.out.println(memory.M_CVAL());\n";
                    if (_instruction === 'c') JavaLoopInner += "System.out.print(util.P_ASCII(memory.M_CVAL()));\n"
                    if (_instruction === '0') JavaLoopInner += "System.exit(0);\n";
                }
                var JavaLoop = `for(int i = 0; i < ${LOOP_PARTS[1]}; i++) {
                    ${JavaLoopInner}
                }`
                JavaMain += `${JavaLoop}\n`;
                JavaLoopInner = '';
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
                JavaMain += `memory.M_SET_MEM_CL_VAL(${sum});\n`;
                i = second;
                break;
            }
        }
    }

    if (instruction === 'C') {
        var first = i + 4;
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
                var str = `\"Cell Index: ${CL_INDEX}\nCell Value: ${MEMORY.M_GET_CVAL(CL_INDEX)}\"`;
                JavaMain += `System.out.println(${str})\n`;
                i = second;
                break;
            }
        }
    }
}

var JavaProgram = `import java.util.Arrays;

class Colors {
    static String Black = "\u001b[30m";
    static String Red = "\u001b[31m";
    static String Green = "\u001b[32m";
    static String Yellow = "\u001b[33m";
    static String Blue = "\u001b[34m";
    static String Magenta = "\u001b[35m";
    static String Cyan = "\u001b[36m";
    static String White = "\u001b[37m";
    static String Reset = "\u001b[0m";
}

class Util {
    String P_ASCII(int AsciiCode) {
        return Character.toString((char) AsciiCode);
    }
}

class Memory {
    int size;
    Colors colors = new Colors();
    int C_MEM_CL = 0;
    int[] Memory = new int[${P_MEM_SIZE}];

    public Memory(int _size) {
        size = _size;
    }

    void M_MR() {
        this.C_MEM_CL++;
        if (this.C_MEM_CL > this.size) {
            System.out.println(colors.Red + "[POOTIS][MEMORY][ERROR] FATAL ERROR: Memory index" + this.C_MEM_CL
                    + "out of range 0-" + this.size + Colors.Reset);
            System.exit(0);
        }
    }

    void M_ML() {
        this.C_MEM_CL--;
        if (this.C_MEM_CL < 0) {
            System.out.println(colors.Red + "[POOTIS][MEMORY][ERROR] FATAL ERROR: Memory index" + this.C_MEM_CL
                    + "out of range 0-" + this.size + Colors.Reset);
            System.exit(0);
        }
    }

    void M_SET_MEM_CL_VAL(int val) {
        this.Memory[this.C_MEM_CL] = val;
    }

    void M_INCREMENT() {
        this.Memory[this.C_MEM_CL]++;
    }

    void M_DECREMENT() {
        this.Memory[this.C_MEM_CL]--;
    }

    int M_CVAL() {
        return this.Memory[this.C_MEM_CL];
    }

    void M_PRINT() {
        System.out.println(colors.Cyan + "[POOTIS][DEBUG] Current Program Memory:" + colors.Reset);
        System.out.println(Arrays.toString(this.Memory));
    }

    int M_GET_CVAL(int Index) {
        if (Index > this.size || Index < 0) {
            System.out.println(colors.Red + "[POOTIS][MEMORY][ERROR] FATAL ERROR: Cell index " + Index
                    + " out of range 0 to " + this.size + "" + colors.Reset);
            System.exit(0);
        }
        return this.Memory[Index];
    }
}

class ${sourceFileName} {

    public static void main(String[] args) {
        Memory memory = new Memory(${P_MEM_SIZE});
        Util util = new Util();
        ${JavaMain}
    }
}
`
console.log('yoink');
/* fs.readdir('./src/util/compile/out', (err, files) => {
    if (err) throw err;

    for (const file of files) {
        fs.unlink(path.join('./src/util/compile/out', file), err => {
            if (err) throw err;
        });
    }
}); */

console.log('writing .java');
if (!fs.existsSync(`./src/util/compile/out/${sourceFileName}`)) {
    fs.mkdirSync(`./src/util/compile/out/${sourceFileName}`);
}
fs.writeFileSync(`./src/util/compile/out/${sourceFileName}/${sourceFileName}.java`, JavaProgram);
JavaProgram = null;
JavaMain = null;

// generate .class files
// javac <file name>.java
console.log('generating .class files');
execSync(`javac ./src/util/compile/out/${sourceFileName}/${sourceFileName}.java`);

// generate .jar manifest
const manifest = `Manifest-Version: 1.0
Main-Class: ${sourceFileName}\n`;
console.log('generating manifest file');
fs.writeFileSync(`./src/util/compile/out/${sourceFileName}/${sourceFileName}.mf`, manifest);

// List all .class files
var files = fs.readdirSync(path.resolve(`./src/util/compile/out/${sourceFileName}`));
var fullPathFiles = [];
for (let i = 0; i < files.length; i++) {
    const fileName = files[i];
    if (fileName.endsWith('.java')) continue;
    if (fileName.endsWith('.mf')) continue;
    fullPathFiles.push(path.resolve(`./src/util/compile/out/${sourceFileName}/${fileName}`));
}
console.log(fullPathFiles);

// generate .jar file
// console.log('generating .jar');
execSync(`jar cvfm ${sourceFileName}.jar ${sourceFileName}.mf *.class`, { cwd: path.resolve(`./src/util/compile/out/${sourceFileName}`) });
process.exit();
// exec(`jar cf ${fullPath} ${sourceFileName}.jar *`, { cwd: path.resolve('./src/util/compile/out') }, function (err, stdout, stderr) { });