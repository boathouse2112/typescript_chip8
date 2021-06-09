import { decode } from "./decode";

test("Decode CLS", () => {
  const instruction = decode(0x00e0);

  expect(instruction.id).toBe("CLS");
  expect(instruction.args).toStrictEqual([]);
});

test("Decode RET", () => {
  const instruction = decode(0x00ee);

  expect(instruction.id).toBe("RET");
  expect(instruction.args).toStrictEqual([]);
});

test("Decode JMP_ADDR", () => {
  const minArgs = decode(0x1000);
  const midArgs = decode(0x19ab);
  const maxArgs = decode(0x1fff);

  expect(
    [minArgs, midArgs, maxArgs].map((instruction) => instruction.id)
  ).toStrictEqual(Array(3).fill("JMP_ADDR"));
  expect(minArgs.args).toStrictEqual([0x000]);
  expect(midArgs.args).toStrictEqual([0x9ab]);
  expect(maxArgs.args).toStrictEqual([0xfff]);
});

test("Decode CALL_ADDR", () => {
  const minArgs = decode(0x2000);
  const midArgs = decode(0x29ab);
  const maxArgs = decode(0x2fff);

  expect(
    [minArgs, midArgs, maxArgs].map((instruction) => instruction.id)
  ).toStrictEqual(Array(3).fill("CALL_ADDR"));
  expect(minArgs.args).toStrictEqual([0x000]);
  expect(midArgs.args).toStrictEqual([0x9ab]);
  expect(maxArgs.args).toStrictEqual([0xfff]);
});

test("Decode SE_VX_BYTE", () => {
  const minArgs = decode(0x3000);
  const midArgs = decode(0x39ab);
  const maxArgs = decode(0x3fff);

  expect(
    [minArgs, midArgs, maxArgs].map((instruction) => instruction.id)
  ).toStrictEqual(Array(3).fill("SE_VX_BYTE"));
  expect(minArgs.args).toStrictEqual([0x0, 0x00]);
  expect(midArgs.args).toStrictEqual([0x9, 0xab]);
  expect(maxArgs.args).toStrictEqual([0xf, 0xff]);
});

test("Decode SNE_VX_BYTE", () => {
  const minArgs = decode(0x4000);
  const midArgs = decode(0x49ab);
  const maxArgs = decode(0x4fff);

  expect(
    [minArgs, midArgs, maxArgs].map((instruction) => instruction.id)
  ).toStrictEqual(Array(3).fill("SNE_VX_BYTE"));
  expect(minArgs.args).toStrictEqual([0x0, 0x00]);
  expect(midArgs.args).toStrictEqual([0x9, 0xab]);
  expect(maxArgs.args).toStrictEqual([0xf, 0xff]);
});

test("Decode SE_VX_VY", () => {
  const minArgs = decode(0x5000);
  const midArgs = decode(0x59a0);
  const maxArgs = decode(0x5ff0);

  expect(
    [minArgs, midArgs, maxArgs].map((instruction) => instruction.id)
  ).toStrictEqual(Array(3).fill("SE_VX_VY"));
  expect(minArgs.args).toStrictEqual([0x0, 0x0]);
  expect(midArgs.args).toStrictEqual([0x9, 0xa]);
  expect(maxArgs.args).toStrictEqual([0xf, 0xf]);
});

test("Decode LD_VX_BYTE", () => {
  const minArgs = decode(0x6000);
  const midArgs = decode(0x69ab);
  const maxArgs = decode(0x6fff);

  expect(
    [minArgs, midArgs, maxArgs].map((instruction) => instruction.id)
  ).toStrictEqual(Array(3).fill("LD_VX_BYTE"));
  expect(minArgs.args).toStrictEqual([0x0, 0x00]);
  expect(midArgs.args).toStrictEqual([0x9, 0xab]);
  expect(maxArgs.args).toStrictEqual([0xf, 0xff]);
});
