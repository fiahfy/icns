import fs from 'fs'
import { IcnsImage } from '../src'

describe('IcnsImage', () => {
  describe('constructor', () => {
    it('should work', () => {
      const image = new IcnsImage()
      expect(image.osType).toBe('ic10')
      expect(image.bytes).toBe(8)
      expect(image.image.length).toBe(0)
    })
  })

  describe('from', () => {
    it('should work', () => {
      const buffer = Buffer.alloc(18)
      buffer.write('ic04', 0, 4, 'ascii')
      buffer.writeUInt32BE(18, 4)
      buffer.write('0123456789', 8, 10, 'ascii')

      const image = IcnsImage.from(buffer)
      expect(image.osType).toBe('ic04')
      expect(image.bytes).toBe(18)
      expect(image.image.length).toBe(10)
    })
  })

  describe('fromPNG', () => {
    it('should work for ic04', () => {
      const buffer = fs.readFileSync('./test/16x16.png')
      expect(() => IcnsImage.fromPNG(buffer, 'ic04')).not.toThrowError()
    })
    it('should work for is32', () => {
      const buffer = fs.readFileSync('./test/16x16.png')
      expect(() => IcnsImage.fromPNG(buffer, 'is32')).not.toThrowError()
    })
    it('should work for s8mk', () => {
      const buffer = fs.readFileSync('./test/16x16.png')
      expect(() => IcnsImage.fromPNG(buffer, 's8mk')).not.toThrowError()
    })
    it('should work for ic10', () => {
      const buffer = fs.readFileSync('./test/1024x1024.png')
      expect(() => IcnsImage.fromPNG(buffer, 'ic10')).not.toThrowError()
    })
    it('should work for ic10', () => {
      const buffer = fs.readFileSync('./test/1024x1024.png')
      expect(() => IcnsImage.fromPNG(buffer, 'ic10')).not.toThrowError()
    })
    it('should throw error if buffer is not PNG format', () => {
      const buffer = fs.readFileSync('./test/1024x1024.jpg')
      expect(() => IcnsImage.fromPNG(buffer, 'ic10')).toThrowError(TypeError)
    })
    it('should throw error if buffer is not square', () => {
      const buffer = fs.readFileSync('./test/256x128.png')
      expect(() => IcnsImage.fromPNG(buffer, 'ic10')).toThrowError(TypeError)
    })
    it('should throw error if buffer is not supported size', () => {
      const buffer = fs.readFileSync('./test/100x100.png')
      expect(() => IcnsImage.fromPNG(buffer, 'ic10')).toThrowError(TypeError)
    })
  })
})
