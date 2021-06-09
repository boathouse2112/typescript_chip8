import { CPU } from "./cpu";
import { decode } from "./decode";

class DisplayMock {
  screenCleared = false;

  clearScreen() {
    this.screenCleared = true;
  }
}

test("Read opcode", () => {
  const display = new DisplayMock();
  const cpu = new CPU(display);

  // Set the 1st opcode to be 0x89ab, split over 2 cells
  cpu.ram[cpu.PC] = 0x89;
  cpu.ram[cpu.PC + 1] = 0xab;

  // Starting PC should be 0x200
  cpu.PC = 0x200;

  // Reading opcode should return 0x00e0, and increment PC by 2
  const opcode = cpu.readOpcode();
  expect(opcode).toBe(0x89ab);
  expect(cpu.PC).toBe(0x202);
});

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

test("Execute SE_VX_BYTE errors - wrong args", () => {
  // Too few args
  var display = new DisplayMock();
  var cpu = new CPU(display);

  expect(() => cpu.execute("SE_VX_BYTE", [0])).toThrowError();

  // Too many args
  display = new DisplayMock();
  cpu = new CPU(display);

  expect(() => cpu.execute("SE_VX_BYTE", [0, 0, 0])).toThrowError();
});

test("Execute SE_VX_BYTE errors - PC would overflow", () => {
  const display = new DisplayMock();
  const cpu = new CPU(display);

  // Set V4 = 0xa
  cpu.registers[4] = 0xaa;

  // Make the last 2 bytes the ones that would be skipped
  cpu.PC = 0xffe;

  const instruction = decode(0x34aa);
  expect(() => cpu.execute(instruction.id, instruction.args)).toThrowError();
});

test("Execute SE_VX_BYTE", () => {
  const display = new DisplayMock();
  const cpu = new CPU(display);

  // Set V4 = 0xaa
  cpu.registers[4] = 0xaa;

  // PC starts at 0x200
  expect(cpu.PC).toBe(0x200);

  // Instructions 0x34aa, 0x00E0, 0x34bb, 0x00E0
  // SE_VX_BYTE(4, 0xaa)    CLS()   SE_VX_BYTE(4, 0xbb)   CLS()
  // Executing ram[pc] 3 times should jump over CLS #1,   PC == 0x204
  // fail to jump over CLS #2,                            PC == 0x206
  // and call CLS #2                                      PC == 0x208
  cpu.ram[0x200] = 0x34;
  cpu.ram[0x201] = 0xaa;

  cpu.ram[0x202] = 0x00;
  cpu.ram[0x203] = 0xe0;

  cpu.ram[0x204] = 0x34;
  cpu.ram[0x205] = 0xbb;

  cpu.ram[0x206] = 0x00;
  cpu.ram[0x207] = 0xe0;

  const skip1 = cpu.readOpcode();
  var instruction = decode(skip1);
  expect(instruction.id).toBe("SE_VX_BYTE");
  cpu.execute(instruction.id, instruction.args);
  expect(cpu.PC).toBe(0x204);

  const skip2 = cpu.readOpcode();
  instruction = decode(skip2);
  expect(instruction.id).toBe("SE_VX_BYTE");
  cpu.execute(instruction.id, instruction.args);
  expect(cpu.PC).toBe(0x206);
  expect(display.screenCleared).toBe(false);

  const cls2 = cpu.readOpcode();
  instruction = decode(cls2);
  expect(instruction.id).toBe("CLS");
  cpu.execute(instruction.id, instruction.args);
  expect(cpu.PC).toBe(0x208);
  expect(display.screenCleared).toBe(true);
});

test("Execute SNE_VX_BYTE errors - wrong args", () => {
  // Too few args
  var display = new DisplayMock();
  var cpu = new CPU(display);

  expect(() => cpu.execute("SNE_VX_BYTE", [0])).toThrowError();

  // Too many args
  display = new DisplayMock();
  cpu = new CPU(display);

  expect(() => cpu.execute("SNE_VX_BYTE", [0, 0, 0])).toThrowError();
});

test("Execute SNE_VX_BYTE errors - PC would overflow", () => {
  const display = new DisplayMock();
  const cpu = new CPU(display);

  // Set V4 = 0xa
  cpu.registers[4] = 0xaa;

  // Make the last 2 bytes the ones that would be skipped
  cpu.PC = 0xffe;

  const instruction = decode(0x44bb);
  expect(() => cpu.execute(instruction.id, instruction.args)).toThrowError();
});

test("Execute SNE_VX_BYTE", () => {
  const display = new DisplayMock();
  const cpu = new CPU(display);

  // Set V4 = 0xbb
  cpu.registers[4] = 0xbb;

  // PC starts at 0x200
  expect(cpu.PC).toBe(0x200);

  // Instructions 0x44aa, 0x00E0, 0x44bb, 0x00E0
  // SNE_VX_BYTE(4, 0xaa)    CLS()   SNE_VX_BYTE(4, 0xbb)   CLS()
  // Executing ram[pc] 3 times should jump over CLS #1,   PC == 0x204
  // fail to jump over CLS #2,                            PC == 0x206
  // and call CLS #2                                      PC == 0x208
  cpu.ram[0x200] = 0x44;
  cpu.ram[0x201] = 0xaa;

  cpu.ram[0x202] = 0x00;
  cpu.ram[0x203] = 0xe0;

  cpu.ram[0x204] = 0x44;
  cpu.ram[0x205] = 0xbb;

  cpu.ram[0x206] = 0x00;
  cpu.ram[0x207] = 0xe0;

  const skip1 = cpu.readOpcode();
  var instruction = decode(skip1);
  expect(instruction.id).toBe("SNE_VX_BYTE");
  cpu.execute(instruction.id, instruction.args);
  expect(cpu.PC).toBe(0x204);

  const skip2 = cpu.readOpcode();
  instruction = decode(skip2);
  expect(instruction.id).toBe("SNE_VX_BYTE");
  cpu.execute(instruction.id, instruction.args);
  expect(cpu.PC).toBe(0x206);
  expect(display.screenCleared).toBe(false);

  const cls2 = cpu.readOpcode();
  instruction = decode(cls2);
  expect(instruction.id).toBe("CLS");
  cpu.execute(instruction.id, instruction.args);
  expect(cpu.PC).toBe(0x208);
  expect(display.screenCleared).toBe(true);
});

test("Execute SE_VX_VY errors - wrong args", () => {
  // Too few args
  var display = new DisplayMock();
  var cpu = new CPU(display);

  expect(() => cpu.execute("SE_VX_VY", [0])).toThrowError();

  // Too many args
  display = new DisplayMock();
  cpu = new CPU(display);

  expect(() => cpu.execute("SE_VX_VY", [0, 0, 0])).toThrowError();
});

test("Execute SE_VX_VY errors - PC would overflow", () => {
  const display = new DisplayMock();
  const cpu = new CPU(display);

  // Set V4 = 0xa
  cpu.registers[4] = 0xaa;
  cpu.registers[5] = 0xaa;

  // Make the last 2 bytes the ones that would be skipped
  cpu.PC = 0xffe;

  const instruction = decode(0x5450);
  expect(() => cpu.execute(instruction.id, instruction.args)).toThrowError();
});

test("Execute SE_VX_VY", () => {
  const display = new DisplayMock();
  const cpu = new CPU(display);

  // Set V4 = 0xbb
  cpu.registers[4] = 0xbb;
  cpu.registers[5] = 0xbb;
  cpu.registers[6] = 0xcc;

  // PC starts at 0x200
  expect(cpu.PC).toBe(0x200);

  // Instructions 0x5450, 0x00E0, 0x5560, 0x00E0
  // SE_VX_VY(4, 5)    CLS()   SE_VX_VY(5, 6)   CLS()
  // Executing ram[pc] 3 times should jump over CLS #1,   PC == 0x204
  // fail to jump over CLS #2,                            PC == 0x206
  // and call CLS #2                                      PC == 0x208
  cpu.ram[0x200] = 0x54;
  cpu.ram[0x201] = 0x50;

  cpu.ram[0x202] = 0x00;
  cpu.ram[0x203] = 0xe0;

  cpu.ram[0x204] = 0x55;
  cpu.ram[0x205] = 0x60;

  cpu.ram[0x206] = 0x00;
  cpu.ram[0x207] = 0xe0;

  const skip1 = cpu.readOpcode();
  var instruction = decode(skip1);
  expect(instruction.id).toBe("SE_VX_VY");
  cpu.execute(instruction.id, instruction.args);
  expect(cpu.PC).toBe(0x204);

  const skip2 = cpu.readOpcode();
  instruction = decode(skip2);
  expect(instruction.id).toBe("SE_VX_VY");
  cpu.execute(instruction.id, instruction.args);
  expect(cpu.PC).toBe(0x206);
  expect(display.screenCleared).toBe(false);

  const cls2 = cpu.readOpcode();
  instruction = decode(cls2);
  expect(instruction.id).toBe("CLS");
  cpu.execute(instruction.id, instruction.args);
  expect(cpu.PC).toBe(0x208);
  expect(display.screenCleared).toBe(true);
});

test("Execute LD_VX_BYTE errors - wrong args", () => {
  // Too few args
  var display = new DisplayMock();
  var cpu = new CPU(display);

  expect(() => cpu.execute("LD_VX_BYTE", [0])).toThrowError();

  // Too many args
  display = new DisplayMock();
  cpu = new CPU(display);

  expect(() => cpu.execute("LD_VX_BYTE", [0, 0, 0])).toThrowError();
});

test("Execute LD_VX_BYTE", () => {
  const display = new DisplayMock();
  const cpu = new CPU(display);

  cpu.ram[0x200] = 0xaa;

  // LD_VX_BYTE(4, 0xaa)
  const instruction = decode(0x64aa);
  cpu.execute(instruction.id, instruction.args);

  expect(cpu.registers[4]).toBe(0xaa);
});
