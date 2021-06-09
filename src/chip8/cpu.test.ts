import { CPU } from "./cpu";
import { decode } from "./decode";

class DisplayMock {
  screenCleared = false;

  clearScreen() {
    this.screenCleared = true;
  }
}

test("Execute CLS errors -- wrong args", () => {
  // Too many args
  const display = new DisplayMock();
  const cpu = new CPU(display);

  expect(() => cpu.execute("CLS", [0])).toThrow();
});

test("Execute CLS", () => {
  const display = new DisplayMock();
  const cpu = new CPU(display);

  const instruction = decode(0x00e0);
  cpu.execute(instruction.id, instruction.args);

  expect(display.screenCleared).toBe(true);
});

test("Execute RET errors - wrong args", () => {
  // Too many args
  const display = new DisplayMock();
  const cpu = new CPU(display);

  expect(() => cpu.execute("RET", [0])).toThrow();
});

test("Execute RET errors - empty stack", () => {
  // Empty stack
  const display = new DisplayMock();
  const cpu = new CPU(display);

  expect(() => cpu.execute("RET", [])).toThrow();
});

test("Execute RET", () => {
  const display = new DisplayMock();
  const cpu = new CPU(display);

  // Add one return address to the stack, and point SP to it
  cpu.stack[0] = 0xfff;
  cpu.SP = 0;

  const instruction = decode(0x00ee);
  cpu.execute(instruction.id, instruction.args);

  // PC should point to return address
  // Stack should be empty and SP should be 0
  expect(cpu.PC).toBe(0xfff);
  expect(cpu.stack[0]).toBe(0);
  expect(cpu.SP).toBe(-1);
});

test("Execute JMP_ADDR errors - wrong args", () => {
  // Too few args
  var display = new DisplayMock();
  var cpu = new CPU(display);

  expect(() => cpu.execute("JMP_ADDR", [])).toThrow();

  // Too many args
  display = new DisplayMock();
  cpu = new CPU(display);

  expect(() => cpu.execute("JMP_ADDR", [0, 0])).toThrow();
});

test("Execute JMP_ADDR", () => {
  const display = new DisplayMock();
  const cpu = new CPU(display);

  const instruction = decode(0x19ab);
  cpu.execute(instruction.id, instruction.args);

  expect(cpu.PC).toBe(0x9ab);
});

test("Execute CALL_ADDR errors - wrong args", () => {
  // Too few args
  var display = new DisplayMock();
  var cpu = new CPU(display);

  expect(() => cpu.execute("CALL_ADDR", [])).toThrow();

  // Too many args
  display = new DisplayMock();
  cpu = new CPU(display);

  expect(() => cpu.execute("CALL_ADDR", [0, 0])).toThrow();
});

test("Execute CALL_ADDR errors - full stack", () => {
  var display = new DisplayMock();
  var cpu = new CPU(display);

  // Stack already has 16 values
  cpu.SP = 15;

  expect(() => cpu.execute("CALL_ADDR", [0])).toThrowError();
});

test("Execute CALL_ADDR", () => {
  const display = new DisplayMock();
  const cpu = new CPU(display);

  // Starting PC should be 0x200
  expect(cpu.PC).toBe(0x200);

  var instruction = decode(0x2a00);
  cpu.execute(instruction.id, instruction.args);

  // PC should point to argument 0xa00
  // Stack should have original PC at [0], and SP should be 0
  expect(cpu.PC).toBe(0xa00);
  expect(cpu.stack[0]).toBe(0x200);
  expect(cpu.SP).toBe(0);

  // Make sure the stack is correct after a second execution
  instruction = decode(0x2b00);
  cpu.execute(instruction.id, instruction.args);

  expect(cpu.PC).toBe(0xb00);
  expect(cpu.stack[0]).toBe(0x200);
  expect(cpu.stack[1]).toBe(0xa00);
  expect(cpu.SP).toBe(1);
});
