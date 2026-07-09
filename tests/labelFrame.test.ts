import { describe, expect, it } from 'vitest';
import {
  LABEL_FRAME_HEIGHT_MM,
  LABEL_FRAME_ROW_LINES_MM,
  SELLER_FIELD_TOP_MM,
} from '../src/labelFrame';

describe('label frame geometry', () => {
  it('allocates enough seller field height for two natural lines', () => {
    expect(LABEL_FRAME_ROW_LINES_MM.at(-1)).toBe(SELLER_FIELD_TOP_MM);
    expect(LABEL_FRAME_HEIGHT_MM - SELLER_FIELD_TOP_MM).toBeCloseTo(4.2, 1);
  });
});
