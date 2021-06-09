// Constants used across multiple functions

// Max value of an opcode
// Each opcode is 4 hex digits long, and each hex digit has 2^4 possible values
export const OPCODE_MAX_VALUE = 2 ** (2 ** 4) - 1;

// Value to shift by to move 1 hex digit. Each digit is 4 bits.
export const HEX_DIGIT_SHIFT = 4;
