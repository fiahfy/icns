import fs from 'fs'
import { Icns } from '../src/icns'
import { IcnsFileHeader, IcnsImage } from '../src'

describe('Icns', () => {
  describe('constructor', () => {
    test('should work', () => {
      const icns = new Icns()
      expect(icns.fileHeader).toEqual(new IcnsFileHeader())
      expect(icns.images).toEqual([])
    })
  })

  describe('from', () => {
    test('should work', () => {
      const buffer = fs.readFileSync('./test/sample.icns')
      const icns = Icns.from(buffer)
      expect(icns.images.length).toBe(10)
    })
  })

  describe('set images', () => {
    test('should work', () => {
      const icns = new Icns()
      const buffer = fs.readFileSync('./test/16x16.png')
      let image: IcnsImage

      image = IcnsImage.fromPNG(buffer, 'ic04')
      icns.images = [...icns.images, image]
      expect(icns.images.length).toBe(1)

      image = IcnsImage.fromPNG(buffer, 'is32')
      icns.images = [...icns.images, image]
      expect(icns.images.length).toBe(2)

      image = IcnsImage.fromPNG(buffer, 's8mk')
      icns.images = [...icns.images, image]
      expect(icns.images.length).toBe(3)

      icns.images = []
      expect(icns.images.length).toBe(0)
    })
  })

  describe('append', () => {
    test('should work', () => {
      const icns = new Icns()
      const buffer = fs.readFileSync('./test/16x16.png')
      let image: IcnsImage

      image = IcnsImage.fromPNG(buffer, 'ic04')
      icns.append(image)
      expect(icns.images.length).toBe(1)
      expect(icns.images[0].osType).toBe('ic04')

      image = IcnsImage.fromPNG(buffer, 'is32')
      icns.append(image)
      expect(icns.images.length).toBe(2)
      expect(icns.images[0].osType).toBe('ic04')
      expect(icns.images[1].osType).toBe('is32')
    })
  })

  describe('insert', () => {
    test('should work', () => {
      const icns = new Icns()
      const buffer = fs.readFileSync('./test/16x16.png')
      let image: IcnsImage

      image = IcnsImage.fromPNG(buffer, 'ic04')
      icns.insert(image, 0)
      expect(icns.images.length).toBe(1)
      expect(icns.images[0].osType).toBe('ic04')

      image = IcnsImage.fromPNG(buffer, 'is32')
      icns.insert(image, 0)
      expect(icns.images.length).toBe(1)
      expect(icns.images[0].osType).toBe('is32')

      image = IcnsImage.fromPNG(buffer, 's8mk')
      icns.insert(image, 1)
      expect(icns.images.length).toBe(2)
      expect(icns.images[0].osType).toBe('is32')
      expect(icns.images[1].osType).toBe('s8mk')
    })
  })

  describe('remove', () => {
    test('should work', () => {
      const icns = new Icns()
      const buffer = fs.readFileSync('./test/16x16.png')

      icns.images = [
        IcnsImage.fromPNG(buffer, 'ic04'),
        IcnsImage.fromPNG(buffer, 'is32'),
        IcnsImage.fromPNG(buffer, 's8mk')
      ]
      expect(icns.images.length).toBe(3)

      icns.remove(0)
      expect(icns.images.length).toBe(2)
      expect(icns.images[0].osType).toBe('is32')
      expect(icns.images[1].osType).toBe('s8mk')
    })
  })
})
