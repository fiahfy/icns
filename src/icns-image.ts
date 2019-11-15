import { PNG } from 'pngjs'
import { encode } from '@fiahfy/packbits'
import { Icns } from './icns'
import { OSType, Format } from './types'

export class BitmapBuilder {
  readonly png: PNG
  readonly osType: OSType
  readonly format: Format

  constructor(png: PNG, osType: OSType, format: Format) {
    this.png = png
    this.osType = osType
    this.format = format
  }

  build(): Buffer | undefined {
    switch (this.format) {
      case 'MASK':
        return this.mask
      case 'RGB':
        return this.rgb
      case 'ARGB':
        return this.argb
      default:
        return undefined
    }
  }

  private get mask(): Buffer {
    return this.getChannel(3)
  }

  private get rgb(): Buffer {
    // the "it32" data seams to be offset by 4 bytes
    // @see https://gist.github.com/raweden/1065894#file-icnsencoder-as-L63
    const offset = this.osType === 'it32' ? 4 : 0
    const header = Buffer.alloc(offset)

    return Buffer.concat([
      header,
      encode(this.getChannel(0), { format: 'icns' }),
      encode(this.getChannel(1), { format: 'icns' }),
      encode(this.getChannel(2), { format: 'icns' })
    ])
  }

  private get argb(): Buffer {
    const header = Buffer.alloc(4)
    header.write('ARGB', 0, 4, 'ascii')

    return Buffer.concat([
      header,
      encode(this.getChannel(3), { format: 'icns' }),
      encode(this.getChannel(0), { format: 'icns' }),
      encode(this.getChannel(1), { format: 'icns' }),
      encode(this.getChannel(2), { format: 'icns' })
    ])
  }

  private getChannel(index: number): Buffer {
    const data = []
    for (let i = 0; i < this.png.data.length; i += 4) {
      data.push(this.png.data.slice(index + i, index + i + 1))
    }
    return Buffer.concat(data)
  }
}

export class IcnsImage {
  readonly osType: OSType
  readonly bytes: number
  readonly image: Buffer

  constructor(osType: OSType = '', bytes = 8, image = Buffer.alloc(0)) {
    this.osType = osType
    this.bytes = bytes
    this.image = image
  }

  /**
   * Create ICNS image from the buffer.
   * @param buffer The ICNS image buffer.
   */
  static from(buffer: Buffer): IcnsImage {
    const osType = buffer.toString('ascii', 0, 4) as OSType
    const bytes = buffer.readUInt32BE(4)
    const image = buffer.slice(8, bytes)
    return new IcnsImage(osType, bytes, image)
  }

  /**
   * Create ICNS Image from the PNG image buffer.
   * @param buffer The PNG image buffer.
   * @param osType The icon OSType.
   */
  static fromPNG(buffer: Buffer, osType: OSType): IcnsImage {
    const iconType = Icns.supportedIconTypes.find(
      (iconType) => iconType.osType === osType
    )
    if (!iconType) {
      throw new TypeError('No supported osType')
    }

    const png = IcnsImage.readPNG(buffer)
    if (!png) {
      throw new TypeError('Image must be PNG format')
    }

    const width = png.width
    const height = png.height
    if (width !== height) {
      throw new TypeError('Image must be squre')
    }
    if (width !== iconType.size) {
      throw new TypeError(
        `Image size must be ${iconType.size}x${iconType.size} for '${osType}'`
      )
    }

    const image =
      iconType.format === 'PNG'
        ? buffer
        : new BitmapBuilder(png, osType, iconType.format).build()
    if (!image) {
      throw new TypeError(`Invalid format '${iconType.format}'`)
    }

    const bytes = 8 + image.length

    return new IcnsImage(osType, bytes, image)
  }

  get data(): Buffer {
    const buffer = Buffer.alloc(8)
    buffer.write(this.osType, 0, 4, 'ascii')
    buffer.writeUInt32BE(this.bytes, 4)
    return Buffer.concat([buffer, this.image])
  }

  private static readPNG(buffer: Buffer): PNG | undefined {
    try {
      return PNG.sync.read(buffer)
    } catch (e) {
      return undefined
    }
  }
}
