import { IcnsFileHeader } from './icns-file-header'
import { IcnsImage } from './icns-image'
import { OSType, Format } from './types'

export class Icns {
  static readonly supportedIconTypes: {
    osType: OSType
    size: number
    format: Format
  }[] = [
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

  private _fileHeader: IcnsFileHeader
  private _images: ReadonlyArray<IcnsImage>

  constructor(fileHeader = new IcnsFileHeader(), images: IcnsImage[] = []) {
    this._fileHeader = fileHeader
    this._images = images
  }

  /**
   * Create ICNS from the icon buffer.
   * @param buffer The ICNS icon buffer.
   */
  static from(buffer: Buffer): Icns {
    const fileHeader = IcnsFileHeader.from(buffer)

    let pos = fileHeader.data.length
    const images = []
    while (pos < fileHeader.bytes) {
      const image = IcnsImage.from(buffer.slice(pos))
      images.push(image)
      pos += image.data.length
    }

    return new Icns(fileHeader, images)
  }

  get fileHeader(): IcnsFileHeader {
    return this._fileHeader
  }

  get images(): ReadonlyArray<IcnsImage> {
    return this._images
  }

  set images(images: ReadonlyArray<IcnsImage>) {
    this._images = images

    const bytes =
      this._fileHeader.data.length +
      this._images.reduce((carry, image) => carry + image.bytes, 0)

    this._fileHeader = new IcnsFileHeader('icns', bytes)
  }

  get data(): Buffer {
    const buffers = [
      this._fileHeader.data,
      ...this._images.map((image) => image.data)
    ]
    return Buffer.concat(buffers)
  }

  /**
   * Adds ICNS image at the end.
   * @param image The ICNS Image to append.
   */
  append(image: IcnsImage): void {
    this.images = [...this.images, image]
  }

  /**
   * Inserts ICNS image at the specified position.
   * @param image The ICNS Image to insert.
   * @param index The position at which to insert the ICNS Image.
   */
  insert(image: IcnsImage, index: number): void {
    this.images = [
      ...this.images.slice(0, index),
      image,
      ...this.images.slice(index + 1)
    ]
  }

  /**
   * Removes ICNS image at the specified position.
   * @param index The position of the ICNS Image to remove.
   */
  remove(index: number): void {
    this.images = [
      ...this.images.slice(0, index),
      ...this.images.slice(index + 1)
    ]
  }
}
