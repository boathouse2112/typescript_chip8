import { OPCODE_MAX_VALUE } from "./contstants";
import { INSTRUCTION_SET } from "./instruction";

test("All instruction masks are 4 bytes", () => {
  INSTRUCTION_SET.forEach((instruction) => {
    expect(instruction.mask).toBeGreaterThanOrEqual(0);
    expect(instruction.mask).toBeLessThanOrEqual(OPCODE_MAX_VALUE);
    expect(instruction.pattern).toBeGreaterThanOrEqual(0);
    expect(instruction.pattern).toBeLessThanOrEqual(OPCODE_MAX_VALUE);

    instruction.parameters.forEach((parameter) => {
      expect(parameter.mask).toBeGreaterThanOrEqual(0);
      expect(parameter.mask).toBeLessThanOrEqual(OPCODE_MAX_VALUE);

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
