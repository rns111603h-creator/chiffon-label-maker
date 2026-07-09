export type ProductTemplate = {
  id: string;
  name: string;
  displayName: string;
  ingredients: string[];
  allergenLine: string;
  amount: string;
  storageMethod: string;
  seller: string;
  sellerAddressLine: string;
  nutritionTitle: string;
  nutritionLines: string[];
  noteLines: string[];
};

export type PaperLayout = {
  id: string;
  name: string;
  pageWidthMm: number;
  pageHeightMm: number;
  marginLeftMm: number;
  marginTopMm: number;
  labelWidthMm: number;
  labelHeightMm: number;
  horizontalPitchMm: number;
  verticalPitchMm: number;
  columns: number;
  rows: number;
  autoFitLongText?: boolean;
};

export type LabelRect = {
  index: number;
  row: number;
  col: number;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
};

export type LabelJob = {
  product: ProductTemplate;
  expiryDate: string;
  labelCount: number;
  paperLayout: PaperLayout;
};

export type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export type LabelRenderInput = {
  product: ProductTemplate;
  expiryDate: string;
  paperLayout: PaperLayout;
  rect: LabelRect;
};
