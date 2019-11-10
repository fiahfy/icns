import { Bitmap } from 'jimp'
import { encode } from '@fiahfy/packbits'

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
        const pos = (y * bitmap.width + x) * (bitmap as any).bpp
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
