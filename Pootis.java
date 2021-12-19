import java.util.Arrays;

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

    float Sum(float... args) {
        float sum = 0;
        for (float arg : args) {
            sum += arg;
        }
        return sum;
    }
}

class Memory {
    int size;
    Colors colors = new Colors();
    int C_MEM_CL = 0;
    int[] Memory = new int[16];

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

class Pootis {

    public static void main(String[] args) {
        Memory memory = new Memory(16);
        Util util = new Util();
    }
}