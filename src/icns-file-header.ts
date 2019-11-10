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
