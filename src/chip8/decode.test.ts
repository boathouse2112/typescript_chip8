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
  const minAddress = decode(0x1000);
  const midAddress = decode(0x19ab);
  const maxAddress = decode(0x1fff);

  expect(
    [minAddress, midAddress, maxAddress].map((instruction) => instruction.id)
  ).toStrictEqual(Array(3).fill("JMP_ADDR"));
  expect(minAddress.args).toStrictEqual([0x000]);
  expect(midAddress.args).toStrictEqual([0x9ab]);
  expect(maxAddress.args).toStrictEqual([0xfff]);
});

test("Decode CALL_ADDR", () => {
  const minAddress = decode(0x2000);
  const midAddress = decode(0x29ab);
  const maxAddress = decode(0x2fff);

  expect(
    [minAddress, midAddress, maxAddress].map((instruction) => instruction.id)
  ).toStrictEqual(Array(3).fill("CALL_ADDR"));
  expect(minAddress.args).toStrictEqual([0x000]);
  expect(midAddress.args).toStrictEqual([0x9ab]);
  expect(maxAddress.args).toStrictEqual([0xfff]);
});
