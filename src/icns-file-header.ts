export class IcnsFileHeader {
  readonly identifier: 'icns'
  readonly bytes: number

  constructor(identifier: 'icns' = 'icns', bytes = 8) {
    this.identifier = identifier
    this.bytes = bytes
  }

  /**
   * Create ICNS file header from the buffer.
   * @param buffer The ICNS file header buffer.
   */
  static from(buffer: Buffer): IcnsFileHeader {
    const identifier = buffer.toString('ascii', 0, 4) as 'icns'
    const bytes = buffer.readUInt32BE(4)
    return new IcnsFileHeader(identifier, bytes)
  }

  get data(): Buffer {
    const buffer = Buffer.alloc(8)
    buffer.write(this.identifier, 0, 4, 'ascii')
    buffer.writeUInt32BE(this.bytes, 4)
    return buffer
  }
}
