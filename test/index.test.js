import fs from 'fs'
import Icns from '../src'

describe('icns', () => {
  describe('constructor', () => {
    test('should work', async () => {
      const icns = new Icns()
      expect(icns.iconImages.length).toBe(0)
    })

    test('should work with buffer', async () => {
      const buf = fs.readFileSync('./test/sample.icns')
      const icns = new Icns(buf)
      expect(icns.iconImages.length).toBe(10)
    })
  })

  describe('data property', () => {
    test('should work', () => {
      const icns = new Icns()
      expect(icns.data.length).toBeGreaterThan(0)
      icns.data = fs.readFileSync('./test/sample.icns')
      expect(icns.iconImages.length).toBe(10)
    })
  })

  describe('appendImage', () => {
    test('should work', async () => {
      const buf = fs.readFileSync('./test/sample.png')
      const icns = new Icns()
      expect(icns.iconImages.length).toBe(0)
      await icns.appendImage(buf, 'ic09')
      expect(icns.iconImages.length).toBe(1)
      await icns.appendImage(buf, 'ic10')
      expect(icns.iconImages.length).toBe(2)
    })

    test('should throw error if buffer is not PNG format', () => {
      const buf = fs.readFileSync('./test/sample.jpg')
      const icns = new Icns()
      expect(icns.appendImage(buf, 'ic10')).rejects.toThrowError(TypeError)
    })
  })
})
