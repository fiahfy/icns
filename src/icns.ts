import Jimp from 'jimp'
import { IcnsFileHeader } from './icns-file-header'
import { IcnsImage } from './icns-image'

type OSType =
  | 'ic04'
  | 'ic05'
  | 'ic07'
  | 'ic08'
  | 'ic09'
  | 'ic10'
  | 'ic11'
  | 'ic11'
  | 'ic12'
  | 'ic13'
  | 'ic14'

type Format = 'ARGB' | 'PNG'

interface IconType {
  size: number
  format: Format
}

export class Icns {
  static readonly supportedOSTypes: OSType[] = [
    'ic04',
    'ic05',
    'ic07',
    'ic08',
    'ic09',
    'ic10',
    'ic11',
    'ic11',
    'ic12',
    'ic13',
    'ic14'
  ]
  static getIconType(osType: OSType): IconType {
    switch (osType) {
      case 'ic04':
        return { size: 16, format: 'ARGB' }
      case 'ic05':
        return { size: 32, format: 'ARGB' }
      case 'ic07':
        return { size: 128, format: 'PNG' }
      case 'ic08':
        return { size: 256, format: 'PNG' }
      case 'ic09':
        return { size: 512, format: 'PNG' }
      case 'ic10':
        return { size: 1024, format: 'PNG' }
      case 'ic11':
        return { size: 32, format: 'PNG' }
      case 'ic12':
        return { size: 64, format: 'PNG' }
      case 'ic13':
        return { size: 256, format: 'PNG' }
      case 'ic14':
        return { size: 512, format: 'PNG' }
    }
  }
  fileHeader: IcnsFileHeader
  images: IcnsImage[]
  constructor(buffer?: Buffer) {
    this.fileHeader = new IcnsFileHeader()
    this.images = []
    if (buffer) {
      this.data = buffer
    }
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
  private updateTotalBytes(): void {
    this.fileHeader.bytes =
      this.fileHeader.data.length +
      this.images.reduce((carry, image) => carry + image.bytes, 0)
  }
  async appendImage(buffer: Buffer, osType: OSType): Promise<void> {
    await this.insertImage(buffer, osType, this.images.length)
  }
  async insertImage(
    buffer: Buffer,
    osType: OSType,
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
    const supported = Icns.supportedOSTypes.includes(osType)
    if (!supported) {
      throw new TypeError('No supported osType')
    }
    const iconType = Icns.getIconType(osType)
    if (size !== iconType.size) {
      throw new TypeError(
        `Image size must be ${iconType.size}x${iconType.size} for '${osType}'`
      )
    }

    this.images[index] = IcnsImage.create(
      osType,
      iconType.format,
      buffer,
      image.bitmap
    )

    this.updateTotalBytes()
  }
  removeImage(index: number): void {
    this.images.splice(index, 1)

    this.updateTotalBytes()
  }
}
