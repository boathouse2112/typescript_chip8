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

  // Executes the instruction with the given ID, with the given arguments
  execute(id: InstructionID, args: number[]) {
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
    }
  }
}
