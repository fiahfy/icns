import { encode } from '@fiahfy/packbits'
import Jimp from 'jimp'

class IcnsFileHeader {
  constructor({ identifier = 'icns', bytes = 0 } = {}) {
    this.identifier = identifier
    this.bytes = bytes
  }
  get data() {
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

class IcnsImage {
  constructor({ osType = '', bytes = 0, image = null } = {}) {
    this.osType = osType
    this.bytes = bytes
    this.image = image
  }
  get data() {
    const buffer = Buffer.alloc(8)
    buffer.write(this.osType, 0, 4, 'ascii')
    buffer.writeUInt32BE(this.bytes, 4)

    const list = [buffer, this.image]
    const totalLength = list.reduce((carry, buffer) => carry + buffer.length, 0)
    return Buffer.concat(list, totalLength)
  }
  set data(buffer) {
    this.osType = buffer.toString('ascii', 0, 4)
    this.bytes = buffer.readUInt32BE(4)
    this.image = buffer.slice(8, this.bytes)
  }
  static _createARGBData(bitmap) {
    const a = []
    const r = []
    const g = []
    const b = []
    for (let y = 0; y < bitmap.height; y++) {
      for (let x = 0; x < bitmap.width; x++) {
        const pos = (y * bitmap.width + x) * bitmap.bpp
        const red = bitmap.data.slice(pos, pos + 1)
        const green = bitmap.data.slice(pos + 1, pos + 2)
        const blue = bitmap.data.slice(pos + 2, pos + 3)
        const alpha = bitmap.data.slice(pos + 3, pos + 4)
        a.push(alpha)
        r.push(red)
        g.push(green)
        b.push(blue)
      }
    }
    const list = [...a, ...r, ...g, ...b]
    const totalLength = list.reduce((carry, buf) => carry + buf.length, 0)
    const data = encode(Buffer.concat(list, totalLength), { icns: true })

    const header = Buffer.alloc(4)
    header.write('ARGB', 0, 4, 'ascii')
    return Buffer.concat([header, data], 4 + data.length)
  }
  static create(bitmap, osType, format, buffer) {
    const image = format === 'PNG' ? buffer : IcnsImage._createARGBData(bitmap)
    const bytes = 8 + image.length
    return new IcnsImage({ osType, bytes, image })
  }
}

export default class Icns {
  constructor(buffer) {
    this.fileHeader = new IcnsFileHeader()
    this.images = []
    if (buffer) {
      this.data = buffer
    }
  }
  static get supportedTypes() {
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
  static get supportedSizes() {
    return Icns.supportedTypes
      .map((type) => type.size)
      .filter((x, i, self) => self.indexOf(x) === i)
      .sort((a, b) => (a > b ? 1 : -1))
  }
  get data() {
    const list = [
      this.fileHeader.data,
      ...this.images.map((image) => image.data)
    ]
    const totalLength = list.reduce((carry, buffer) => carry + buffer.length, 0)
    return Buffer.concat(list, totalLength)
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
  _resetHeader() {
    this.fileHeader.bytes =
      this.fileHeader.data.length +
      this.images.reduce((carry, image) => carry + image.bytes, 0)
  }
  async appendImage(buffer, osType) {
    await this.insertImage(buffer, osType, this.images.length)
  }
  async insertImage(buffer, osType, index) {
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
      image.bitmap,
      osType,
      type.format,
      buffer
    )

    this._resetHeader()
  }
  removeImage(index) {
    this.images.splice(index, 1)

    this._resetHeader()
  }
}
