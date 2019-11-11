import { IcnsFileHeader } from './icns-file-header'
import { IcnsImage } from './icns-image'

interface IconType {
  osType: string
  size: number
  format: string
}

export class Icns {
  static readonly supportedIconTypes = [
    { osType: 'is32', size: 16, format: 'RGB' },
    { osType: 's8mk', size: 16, format: 'MASK' },
    { osType: 'il32', size: 32, format: 'RGB' },
    { osType: 'l8mk', size: 32, format: 'MASK' },
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

  fileHeader = new IcnsFileHeader()
  private _images: IcnsImage[] = []

  constructor(buffer?: Buffer) {
    if (buffer) {
      this.data = buffer
    }
  }

  get images(): IcnsImage[] {
    return this._images
  }

  set images(images: IcnsImage[]) {
    this._images = images

    this.fileHeader.bytes =
      this.fileHeader.data.length +
      this.images.reduce((carry, image) => carry + image.bytes, 0)
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
      pos += image.data.length
    }
    this.images = images
  }

  appendImage(buffer: Buffer, osType: string): void {
    this.insertImage(buffer, osType, this.images.length)
  }

  insertImage(buffer: Buffer, osType: string, index: number): void {
    this.images[index] = IcnsImage.create(buffer, osType)
  }

  removeImage(index: number): void {
    this.images.splice(index, 1)
  }
}
