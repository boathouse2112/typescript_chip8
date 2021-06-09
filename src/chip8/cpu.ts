import { assert } from "console";
import { HEX_DIGIT_SHIFT, OPCODE_MAX_VALUE } from "./contstants";
import { decode } from "./decode";
import { Display } from "./display";
import { InstructionID } from "./instruction";

function validateArgsLength(
  id: InstructionID,
  expectedArgsLength: number,
  argsLength: number
) {
  if (argsLength !== expectedArgsLength) {
    throw new Error(
      `${id} expects ${expectedArgsLength} argument(s), but the CPU received ${argsLength}.`
    );
  }
}

export class CPU {
  // RAM is a 4096-length uint8 array
  ram: Uint8Array;
  // PC is a uint16 instruction pointer. Starts at 0x200
  PC: number;

  // Registers are 16 uint8 registers, V0 through VF
  registers: Uint8Array;
  // I is a uint16 register to access a specific point in memory
  I: number;

  // Stack is a stack of 16 uint16 values, tracking subroutine return locations
  stack: Uint16Array;
  // SP is a uint8 stack pointer, tracking the current stack location
  // stack[SP] accesses the current return address on the stack
  // SP == -1 means there's no addresses on the stack
  SP: number;

  // DT and ST are uint8 registers that decrease to 0 at a rate of 60HZ
  // While ST > 0, chip8 plays a beep
  DT: number;
  ST: number;

  // A display interface for calling screen commands
  display: Display;

  constructor(display: Display) {
    this.ram = new Uint8Array(4096);
    this.PC = 0x200;

    this.registers = new Uint8Array(16);
    this.I = 0;

    this.stack = new Uint16Array(16);
    this.SP = -1;

    this.DT = 0;
    this.ST = 0;

    this.display = display;
  }

  // Increment PC by n, throws an error if PC would be greater than 0xfff
  private incPC(n: number): void {
    const newPC = this.PC + n;

    if (newPC > 0xfff) {
      throw new Error(
        `The new PC value 0x${this.PC.toString(16)}` +
          ` is greater than the maximum ${0xfff}.`
      );
    }
    this.PC = newPC;
  }

  // Reads the 2-byte opcode at PC,
  // Increments PC by 2
  readOpcode(): number {
    var byte1 = this.ram[this.PC];
    const byte2 = this.ram[this.PC + 1];

    // byte1 gets shifted 2 hex digits left, then added to byte2
    byte1 = byte1 << (2 * HEX_DIGIT_SHIFT);
    const opcode = byte1 + byte2;

    assert(opcode >= 0);
    assert(opcode <= OPCODE_MAX_VALUE);

    this.incPC(2);
    return opcode;
  }

  // Executes the instruction with the given ID, with the given arguments
  execute(id: InstructionID, args: number[]): void {
    switch (id) {
      // Clear the display
      case "CLS":
        validateArgsLength("CLS", 0, args.length);
        this.display.clearScreen();
        return;

      // Return from the current subroutine
      // Set the PC to whatever's on top of the stack,
      // then decrement the stack counter
      case "RET":
        validateArgsLength("RET", 0, args.length);
        if (this.SP === -1) {
          throw new Error("Program calls RET with an empty stack.");
        }

        this.PC = this.stack[this.SP];
        this.stack[this.SP] = 0;
        this.SP -= 1;
        return;

      // Jump to the given address
      case "JMP_ADDR":
        validateArgsLength("JMP_ADDR", 1, args.length);

        this.PC = args[0];
        return;

      // Call the subroutine at the given address
      // Increment SP, put PC on the stack, and set PC to the given address
      case "CALL_ADDR":
        validateArgsLength("CALL_ADDR", 1, args.length);

        // Fail if stack is full
        if (this.SP === this.stack.length - 1) {
          throw new Error("Program calls CALL_ADDR with a full stack.");
        }

        this.SP += 1;
        this.stack[this.SP] = this.PC;
        this.PC = args[0];
        return;

      // Increment PC by 2 if Vx == byte
      case "SE_VX_BYTE":
        validateArgsLength("SE_VX_BYTE", 2, args.length);

        var x = args[0];
        var byte = args[1];

        if (this.registers[x] === byte) {
          this.incPC(2);
        }
        return;

      // Increment PC by 2 if Vx != byte
      case "SNE_VX_BYTE":
        validateArgsLength("SNE_VX_BYTE", 2, args.length);

        x = args[0];
        byte = args[1];

        if (this.registers[x] !== byte) {
          this.incPC(2);
        }
        return;

      // Increment PC by 2 if Vx == Vy
      case "SE_VX_VY":
        validateArgsLength("SE_VX_VY", 2, args.length);

        x = args[0];
        var y = args[1];

        if (this.registers[x] === this.registers[y]) {
          this.incPC(2);
        }
        return;

      // Load byte into Vx
      case "LD_VX_BYTE":
        validateArgsLength("LD_VX_BYTE", 2, args.length);

        x = args[0];
        byte = args[1];

        this.registers[x] = byte;
        return;
    }
  }

  // Reads and executes the next instruction
  next() {
    const opcode = this.readOpcode();
    const instruction = decode(opcode);
    this.execute(instruction.id, instruction.args);
  }
}
