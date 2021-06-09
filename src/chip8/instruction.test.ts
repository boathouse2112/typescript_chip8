import { INSTRUCTION_SET } from "./instruction";

// Instruction can be 4 hex digits max
// Each hex digit has 2^4 possible values
const INSTRUCTION_MAX_VALUE = 2 ** (2 ** 4) - 1;

test("All instruction masks are 4 bytes", () => {
  INSTRUCTION_SET.forEach((instruction) => {
    expect(instruction.mask).toBeGreaterThanOrEqual(0);
    expect(instruction.mask).toBeLessThanOrEqual(INSTRUCTION_MAX_VALUE);
    expect(instruction.pattern).toBeGreaterThanOrEqual(0);
    expect(instruction.pattern).toBeLessThanOrEqual(INSTRUCTION_MAX_VALUE);

    instruction.parameters.forEach((parameter) => {
      expect(parameter.mask).toBeGreaterThanOrEqual(0);
      expect(parameter.mask).toBeLessThanOrEqual(INSTRUCTION_MAX_VALUE);

      // All hex digits within the shift should be 0
      expect(parameter.mask % 2 ** parameter.shift).toBe(0);

      // Addresses should be 3 digits long, bytes 2, registers 1
      // All digits of the mask should be 0xf
      /* eslint-disable jest/no-conditional-expect */
      switch (parameter.type) {
        case "Address":
          expect(parameter.mask >> parameter.shift).toBe(0xfff);
          break;

        case "Byte":
          expect(parameter.mask >> parameter.shift).toBe(0xff);
          break;

        case "Register":
          expect(parameter.mask >> parameter.shift).toBe(0xf);
          break;
      }
    });
  });
});
