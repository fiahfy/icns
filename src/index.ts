import Jimp, { Bitmap } from 'jimp'
import { encode } from '@fiahfy/packbits'

export class IcnsFileHeader {
  identifier: string
  bytes: number
  constructor(identifier = 'icns', bytes = 0) {
    this.identifier = identifier
    this.bytes = bytes
  }
  get data(): Buffer {
    const buffer = Buffer.alloc(8)
    buffer.write(this.identifier, 0, 4, 'ascii')
    buffer.writeUInt32BE(this.bytes, 4)
    return buffer
  }
  set data(buffer) {
    this.identifier = buffer.toString('ascii', 0, 4)
    this.bytes = buffer.readUInt32BE(4)
  }
}

export class IcnsImage {
  osType: string
  bytes: number
  image: Buffer
  constructor(osType = '', bytes = 0, image = Buffer.alloc(0)) {
    this.osType = osType
    this.bytes = bytes
    this.image = image
  }
  get data(): Buffer {
    const buffer = Buffer.alloc(8)
    buffer.write(this.osType, 0, 4, 'ascii')
    buffer.writeUInt32BE(this.bytes, 4)
    return Buffer.concat([buffer, this.image])
  }
  set data(buffer) {
    this.osType = buffer.toString('ascii', 0, 4)
    this.bytes = buffer.readUInt32BE(4)
    this.image = buffer.slice(8, this.bytes)
  }
  private static createARGBData(bitmap: Bitmap): Buffer {
    const alphaBufs = []
    const redBufs = []
    const greenBufs = []
    const blueBufs = []
    for (let y = 0; y < bitmap.height; y++) {
      for (let x = 0; x < bitmap.width; x++) {
        const pos = (y * bitmap.width + x) * 1 // (bitmap as any).bpp
        const red = bitmap.data.slice(pos, pos + 1)
        const green = bitmap.data.slice(pos + 1, pos + 2)
        const blue = bitmap.data.slice(pos + 2, pos + 3)
        const alpha = bitmap.data.slice(pos + 3, pos + 4)
        alphaBufs.push(alpha)
        redBufs.push(red)
        greenBufs.push(green)
        blueBufs.push(blue)
      }
    }

    const encodedAlpha = encode(Buffer.concat(alphaBufs), { format: 'icns' })
    const encodedRed = encode(Buffer.concat(redBufs), { format: 'icns' })
    const encodedGreen = encode(Buffer.concat(greenBufs), { format: 'icns' })
    const encodedBlue = encode(Buffer.concat(blueBufs), { format: 'icns' })

    const data = Buffer.concat([
      encodedAlpha,
      encodedRed,
      encodedGreen,
      encodedBlue
    ])

    const header = Buffer.alloc(4)
    header.write('ARGB', 0, 4, 'ascii')

    return Buffer.concat([header, data])
  }
  static create(
    osType: string,
    format: string,
    buffer: Buffer,
    bitmap: Bitmap
  ): IcnsImage {
    if (!['PNG', 'ARGB'].includes(format)) {
      throw new TypeError('Invalid format')
    }
    const image = format === 'PNG' ? buffer : IcnsImage.createARGBData(bitmap)
    const bytes = 8 + image.length
    return new IcnsImage(osType, bytes, image)
  }
}

export default class Icns {
  fileHeader: IcnsFileHeader
  images: IcnsImage[]
  constructor(buffer?: Buffer) {
    this.fileHeader = new IcnsFileHeader()
    this.images = []
    if (buffer) {
      this.data = buffer
    }
  }
  static get supportedTypes(): Array<{
    osType: string
    size: number
    format: string
  }> {
    return [
      { osType: 'ic04', size: 16, format: 'ARGB' },
      { osType: 'ic05', size: 32, format: 'ARGB' },
      { osType: 'ic07', size: 128, format: 'PNG' },
      { osType: 'ic08', size: 256, format: 'PNG' },
      { osType: 'ic09', size: 512, format: 'PNG' },
      { osType: 'ic10', size: 1024, format: 'PNG' },
      { osType: 'ic11', size: 32, format: 'PNG' },
      { osType: 'ic12', size: 64, format: 'PNG' },
      { osType: 'ic13', size: 256, format: 'PNG' },
      { osType: 'ic14', size: 512, format: 'PNG' }
    ]
  }
  static get supportedSizes(): number[] {
    return Icns.supportedTypes
      .map((type) => type.size)
      .filter((x, i, self) => self.indexOf(x) === i)
      .sort((a, b) => (a > b ? 1 : -1))
  }
  get data(): Buffer {
    const buffers = [
      this.fileHeader.data,
      ...this.images.map((image) => image.data)
    ]
    return Buffer.concat(buffers)
  }
  set data(buffer) {
    this.fileHeader.data = buffer

    let pos = this.fileHeader.data.length
    const images = []
    while (pos < this.fileHeader.bytes) {
      const image = new IcnsImage()
      image.data = buffer.slice(pos)
      images.push(image)
      pos += image.bytes
    }
    this.images = images
  }
  private resetHeader(): void {
    this.fileHeader.bytes =
      this.fileHeader.data.length +
      this.images.reduce((carry, image) => carry + image.bytes, 0)
  }
  async appendImage(buffer: Buffer, osType: string): Promise<void> {
    await this.insertImage(buffer, osType, this.images.length)
  }
  async insertImage(
    buffer: Buffer,
    osType: string,
    index: number
  ): Promise<void> {
    const image = await Jimp.read(buffer)
    if (image.getMIME() !== Jimp.MIME_PNG) {
      throw new TypeError('Image must be png format')
    }
    if (image.getWidth() !== image.getHeight()) {
      throw new TypeError('Image must be squre')
    }
    const size = image.getWidth()
    const type = Icns.supportedTypes.find((type) => type.osType === osType)
    if (!type) {
      throw new TypeError('No supported osType')
    }
    if (size !== type.size) {
      throw new TypeError(
        `Image size must be ${type.size}x${type.size} for '${type.osType}'`
      )
    }

    this.images[index] = IcnsImage.create(
      osType,
      type.format,
      buffer,
      image.bitmap
    )

    this.resetHeader()
  }
  removeImage(index: number): void {
    this.images.splice(index, 1)

    this.resetHeader()
  }
}