import { IcnsFileHeader } from '../src/icns-file-header'

describe('IcnsFileHeader', () => {
  describe('constructor', () => {
    test('should work', () => {
      const header = new IcnsFileHeader()
      expect(header.identifier).toBe('icns')
      expect(header.bytes).toBe(8)
    })
  })

  describe('from', () => {
    test('should work', () => {
      const buffer = Buffer.alloc(8)
      buffer.write('icns', 0, 4, 'ascii')
      buffer.writeUInt32BE(8, 4)

      const header = IcnsFileHeader.from(buffer)
      expect(header.identifier).toBe('icns')
      expect(header.bytes).toBe(8)
    })
  })
})
