import { normalizeCart } from "./CartContext";

describe("normalizeCart utility", () => {
  test("should handle null, undefined, or non-object input gracefully", () => {
    expect(normalizeCart(null)).toEqual({});
    expect(normalizeCart(undefined)).toEqual({});
    expect(normalizeCart("not an object")).toEqual({});
    expect(normalizeCart(42)).toEqual({});
  });

  test("should clean up empty or zero-quantity cart entries", () => {
    const input = {
      "1": 0,
      "2-M": { id: 2, size: "M", quantity: 0 },
      "3-L-White": null,
    };
    expect(normalizeCart(input)).toEqual({});
  });

  test("should parse legacy raw-number-quantity format", () => {
    const input = {
      "1": 3,
      "5": "2", // stringified number
    };
    const expected = {
      "1-M-White": { id: 1, size: "M", color: "White", quantity: 3 },
      "5-M-White": { id: 5, size: "M", color: "White", quantity: 2 },
    };
    expect(normalizeCart(input)).toEqual(expected);
  });

  test("should parse incomplete object formats and supply defaults", () => {
    const input = {
      "4-S": { id: 4, size: "S", quantity: 2 },
    };
    const expected = {
      "4-S-White": { id: 4, size: "S", color: "White", quantity: 2 },
    };
    expect(normalizeCart(input)).toEqual(expected);
  });

  test("should preserve fully specified standard object format", () => {
    const input = {
      "7-XL-Blue": { id: 7, size: "XL", color: "Blue", quantity: 5 },
    };
    const expected = {
      "7-XL-Blue": { id: 7, size: "XL", color: "Blue", quantity: 5 },
    };
    expect(normalizeCart(input)).toEqual(expected);
  });

  test("should combine duplicate keys if they resolve to the same normalized key", () => {
    const input = {
      "9": 2, // resolves to 9-M-White, qty 2
      "9-M": { id: 9, size: "M", quantity: 3 }, // resolves to 9-M-White, qty 3
    };
    const expected = {
      "9-M-White": { id: 9, size: "M", color: "White", quantity: 5 },
    };
    expect(normalizeCart(input)).toEqual(expected);
  });
});
