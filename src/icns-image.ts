import { PNG } from 'pngjs'
import { encode } from '@fiahfy/packbits'
import { Icns } from './icns'

export class IcnsImage {
  osType: string
  bytes: number
  private _image: Buffer

  constructor(osType = '', bytes = 8, image = Buffer.alloc(0)) {
    this.osType = osType
    this.bytes = bytes
    this._image = image
  }

  get image(): Buffer {
    return this._image
  }

  set image(image) {
    this._image = image

    this.bytes = 8 + image.length
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

  static create(buffer: Buffer, osType: string): IcnsImage {
    const iconType = Icns.supportedIconTypes.find(
      (iconType) => iconType.osType === osType
    )
    if (!iconType) {
      throw new TypeError('No supported osType')
    }

    const png = IcnsImage.readPNG(buffer)
    if (!png) {
      throw new TypeError('Image must be png format')
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

    const icnsImage = new IcnsImage(osType)
    icnsImage.image = IcnsImage.getImage(png, iconType.format) || buffer
    return icnsImage
  }

  private static readPNG(buffer: Buffer): PNG | undefined {
    try {
      return PNG.sync.read(buffer)
    } catch (e) {
      return undefined
    }
  }

  private static getImage(png: PNG, format: string): Buffer | undefined {
    switch (format) {
      case 'MASK':
        return IcnsImage.getMask(png)
      case 'RGB':
        return IcnsImage.getRGB(png)
      case 'ARGB':
        return IcnsImage.getARGB(png)
      case 'PNG':
      default:
        return undefined
    }
  }

  private static getMask(png: PNG): Buffer {
    return IcnsImage.getChannel(png, 3)
  }

  private static getRGB(png: PNG): Buffer {
    return Buffer.concat([
      encode(IcnsImage.getChannel(png, 0), { format: 'icns' }),
      encode(IcnsImage.getChannel(png, 1), { format: 'icns' }),
      encode(IcnsImage.getChannel(png, 2), { format: 'icns' })
    ])
  }

  private static getARGB(png: PNG): Buffer {
    const header = Buffer.alloc(4)
    header.write('ARGB', 0, 4, 'ascii')

    return Buffer.concat([
      header,
      encode(IcnsImage.getChannel(png, 3), { format: 'icns' }),
      encode(IcnsImage.getChannel(png, 0), { format: 'icns' }),
      encode(IcnsImage.getChannel(png, 1), { format: 'icns' }),
      encode(IcnsImage.getChannel(png, 2), { format: 'icns' })
    ])
  }

  private static getChannel(png: PNG, index: number): Buffer {
    const data = []
    for (let i = 0; i < png.data.length; i += 4) {
      data.push(png.data.slice(index + i, index + i + 1))
    }
    return Buffer.concat(data)
  }
}
