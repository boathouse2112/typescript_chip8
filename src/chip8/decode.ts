import { InstructionID, INSTRUCTION_SET } from "./instruction";

// 2-byte uint16 opcode
type Opcode = number;

// Converts the given opcode into an instruction ID and the relevant arguments
export function decode(opcode: Opcode): { id: InstructionID; args: number[] } {
  const instruction = INSTRUCTION_SET.find(
    (instruction) => (opcode & instruction.mask) === instruction.pattern
  );

  if (instruction === undefined) {
    throw new Error(`Opcode ${opcode} does not match any chip8 instruction.`);
  }

  const args = instruction.parameters.map(
    (param) => (opcode & param.mask) >> param.shift
  );

  const id = instruction.id;

  return { id, args };
}
