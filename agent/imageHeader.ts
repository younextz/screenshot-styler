import { HelperError } from './contract';

function exifOrientation(segment: Buffer): number {
  if (segment.length < 14 || segment.toString('ascii', 0, 6) !== 'Exif\0\0') return 1;
  const tiff = segment.subarray(6);
  const order = tiff.toString('ascii', 0, 2);
  if (order !== 'II' && order !== 'MM') return 1;
  const short = (offset: number) => order === 'II' ? tiff.readUInt16LE(offset) : tiff.readUInt16BE(offset);
  const long = (offset: number) => order === 'II' ? tiff.readUInt32LE(offset) : tiff.readUInt32BE(offset);
  if (short(2) !== 42) return 1;
  const directory = long(4);
  if (directory > tiff.length - 2) return 1;
  const count = short(directory);
  for (let index = 0; index < count; index++) {
    const offset = directory + 2 + index * 12;
    if (offset > tiff.length - 12) break;
    if (short(offset) === 0x112 && short(offset + 2) === 3 && long(offset + 4) === 1) {
      const value = short(offset + 8);
      return value >= 1 && value <= 8 ? value : 1;
    }
  }
  return 1;
}

export function inspectImage(bytes: Buffer): { width: number; height: number; mime: string } {
  const invalid = () => new HelperError('UNSUPPORTED_IMAGE', 'Input must contain a valid PNG or JPEG image.');
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    if (bytes.length < 33 || bytes.readUInt32BE(8) !== 13 || bytes.toString('ascii', 12, 16) !== 'IHDR') throw invalid();
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), mime: 'image/png' };
  }
  if (bytes.length < 4 || bytes[0] !== 255 || bytes[1] !== 216) throw invalid();
  let offset = 2;
  let width = 0;
  let height = 0;
  let orientation = 1;
  // Only inspect bounded JPEG segments before the scan. Chromium validates the actual image later.
  while (offset < bytes.length) {
    if (bytes[offset++] !== 255) throw invalid();
    while (offset < bytes.length && bytes[offset] === 255) offset++;
    if (offset >= bytes.length) throw invalid();
    const marker = bytes[offset++];
    if (marker === 0xda || marker === 0xd9) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset > bytes.length - 2) throw invalid();
    const length = bytes.readUInt16BE(offset);
    if (length < 2 || offset + length > bytes.length) throw invalid();
    if (marker === 0xe1) orientation = exifOrientation(bytes.subarray(offset + 2, offset + length));
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      if (length < 8) throw invalid();
      height = bytes.readUInt16BE(offset + 3);
      width = bytes.readUInt16BE(offset + 5);
    }
    offset += length;
  }
  if (!width || !height) throw invalid();
  return orientation >= 5 ? { width: height, height: width, mime: 'image/jpeg' } : { width, height, mime: 'image/jpeg' };
}
