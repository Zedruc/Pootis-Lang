const Colors = require('./colors');
const { exit } = require('process');

class Memory {
    constructor(size) {
        if (!size) {
            console.log(`${Colors.Red}[POOTIS][MEMORY][ERROR] FATAL ERROR: Failed to initialize program memory${Colors.Reset}`);
            exit();
        }
        this.size = size;
        this.C_MEM_CL = 0;
        this.M = [];
        this.M.length = size;
        this.M = this.M.fill(0);
    }

    M_MR() {
        this.C_MEM_CL++;
        if (this.C_MEM_CL > this.size) {
            console.log(`${Colors.Red}[POOTIS][MEMORY][ERROR] FATAL ERROR: Memory index ${this.C_MEM_CL} out of range 0-${this.size}${Colors.Reset}`);
            exit();
        }
    }

    M_ML() {
        this.C_MEM_CL--;
        if (this.C_MEM_CL < 0) {
            console.log(`${Colors.Red}[POOTIS][MEMORY][ERROR] FATAL ERROR: Memory index ${this.C_MEM_CL} out of range 0-${this.size}${Colors.Reset}`);
            exit();
        }
    }

    M_SET_MEM_CL_VAL(val) {
        if (!(typeof val === 'number')) {
            console.log(`${Colors.Red}[POOTIS][MEMORY][ERROR] FATAL ERROR: Cannot set memory cell to any type other than 'number'${Colors.Reset}`);
            exit();
        }
        this.M[this.C_MEM_CL] = val;
    }

    M_INCREMENT() {
        this.M[this.C_MEM_CL]++;
    }

    M_DECREMENT() {
        this.M[this.C_MEM_CL]--;
    }

    M_CVAL() {
        return this.M[this.C_MEM_CL];
    }

    M_PRINT() {
        console.log(`\n${Colors.Cyan}[POOTIS][DEBUG] Current Program Memory:${Colors.Reset}`);
        console.log(this.M);
    }

    M_GET_CVAL(Index) {
        if (Index > this.size || Index < 0) {
            console.log(`${Colors.Red}[POOTIS][MEMORY][ERROR] FATAL ERROR: Cell index ${Index} out of range 0 to ${this.size}${Colors.Reset}`);
            exit();
        }
        return this.M[Index];
    }
}

module.exports = Memory;