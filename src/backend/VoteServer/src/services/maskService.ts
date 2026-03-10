import { insertMask } from "../repositories/payloadRepository";

export async function storeMask(maskData: string): Promise<void> {
  await insertMask(maskData);
  console.log("Mask submitted");
}