import { IcnsFileHeader } from './icns-file-header'
import { IcnsImage } from './icns-image'

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

  fileHeader: IcnsFileHeader
  private _images: IcnsImage[]

  constructor(fileHeader = new IcnsFileHeader(), images = []) {
    this.fileHeader = fileHeader
    this._images = images
  }

  static create(buffer: Buffer): Icns {
    const icns = new Icns()
    icns.data = buffer
    return icns
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

  /**
   * Adds ICNS image at the end.
   * @param image The ICNS Image to append.
   */
  appendImage(image: IcnsImage): void {
    this.images = [...this.images, image]
  }

  /**
   * Inserts ICNS image at the specified position.
   * @param image The ICNS Image to insert.
   * @param index The position at which to insert the ICNS Image.
   */
  insertImage(image: IcnsImage, index: number): void {
    this.images = [
      ...this.images.slice(0, index),
      image,
      ...this.images.slice(index)
    ]
  }

  /**
   * Removes ICNS image at the specified position.
   * @param index The position of the ICNS Image to remove.
   */
  removeImage(index: number): void {
    this.images = [
      ...this.images.slice(0, index),
      ...this.images.slice(index + 1)
    ]
  }

  appendPNG(buffer: Buffer, osType: string): void {
    const image = IcnsImage.createFromPNG(buffer, osType)
    this.appendImage(image)
  }

  insertPNG(buffer: Buffer, osType: string, index: number): void {
    const image = IcnsImage.createFromPNG(buffer, osType)
    this.insertImage(image, index)
  }
}
