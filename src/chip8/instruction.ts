export interface Instruction {
  // Unique instruction name
  readonly id: InstructionID;
  // Mask to check against the opcode patter
  readonly mask: number;
  // Opcode pattern
  readonly pattern: number;
  // Arguments to the instruction, variable in number
  readonly parameters: readonly InstructionParameter[];
}

interface InstructionParameter {
  readonly type: ArgumentType;
  readonly mask: number;
  readonly shift: number;
}

type ArgumentType = "Address" | "Register" | "Byte";

export type InstructionID =
  | "CLS"
  | "RET"
  | "JMP_ADDR"
  | "CALL_ADDR"
  | "SE_VX_BYTE"
  | "SNE_VX_BYTE"
  | "SE_VX_VY"
  | "LD_VX_BYTE";

// Each byte gets shifted by 4 bits
const BYTE_SHIFT = 4;

export const INSTRUCTION_SET: readonly Instruction[] = [
  {
    id: "CLS",
    mask: 0xffff,
    pattern: 0x00e0,
    parameters: [],
  },
  {
    id: "RET",
    mask: 0xffff,
    pattern: 0x00ee,
    parameters: [],
  },
  {
    id: "JMP_ADDR",
    mask: 0xf000,
    pattern: 0x1000,
    parameters: [{ type: "Address", mask: 0x0fff, shift: 0 }],
  },
  {
    id: "CALL_ADDR",
    mask: 0xf000,
    pattern: 0x2000,
    parameters: [{ type: "Address", mask: 0x0fff, shift: 0 }],
  },
  {
    id: "SE_VX_BYTE",
    mask: 0xf000,
    pattern: 0x3000,
    parameters: [
      { type: "Register", mask: 0x0f00, shift: 2 * BYTE_SHIFT },
      { type: "Byte", mask: 0x00ff, shift: 0 },
    ],
  },
  {
    id: "SNE_VX_BYTE",
    mask: 0xf000,
    pattern: 0x4000,
    parameters: [
      { type: "Register", mask: 0x0f00, shift: 2 * BYTE_SHIFT },
      { type: "Byte", mask: 0x00ff, shift: 0 },
    ],
  },
  {
    id: "SE_VX_VY",
    mask: 0xf00f,
    pattern: 0x5000,
    parameters: [
      { type: "Register", mask: 0x0f00, shift: 2 * BYTE_SHIFT },
      { type: "Register", mask: 0x00f0, shift: BYTE_SHIFT },
    ],
  },
  {
    id: "LD_VX_BYTE",
    mask: 0xf000,
    pattern: 0x6000,
    parameters: [
      { type: "Register", mask: 0x0f00, shift: 2 * BYTE_SHIFT },
      { type: "Byte", mask: 0x00ff, shift: 0 },
    ],
  },
] as const;
