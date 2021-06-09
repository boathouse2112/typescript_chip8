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
      // And the lowest shifted digit should be f
      expect(parameter.mask % 2 ** parameter.shift).toBe(0);
      expect((parameter.mask >> parameter.shift) % 2 ** 4).toBe(0xf);
    });
  });
});
