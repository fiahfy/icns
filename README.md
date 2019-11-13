# icns

![badge](https://github.com/fiahfy/icns/workflows/Node.js%20Package/badge.svg)

> [Apple Icon Image format](https://en.wikipedia.org/wiki/Apple_Icon_Image_format) parser and builder.

## Installation

```bash
npm install @fiahfy/icns
```

## Usage

### Parsing

```js
import fs from 'fs'
import { Icns } from '@fiahfy/icns'

const buf = fs.readFileSync('icon.icns')
const icns = Icns.from(buf)
const imagesAsBuffers = icns.images.map((icon) => icon.image)
```

Note that the images may be encoded in different file formats, in accordance with [Apple's _icon type_ specifications](https://en.wikipedia.org/wiki/Apple_Icon_Image_format#Icon_types).

### Building

```js
import fs from 'fs'
import { Icns, IcnsImage } from '@fiahfy/icns'

const icns = new Icns()
let buf, image

buf = fs.readFileSync('512x512.png')
image = IcnsImage.fromPNG(buf, 'ic09')
icns.append(image)

buf = fs.readFileSync('1024x1024.png')
image = IcnsImage.fromPNG(buf, 'ic10')
icns.append(image)

/* Some other PNG files */

fs.writeFileSync('icon.icns', icns.data)
```

## Specifications

### Supported OSTypes

| OSType | OS Version | Size | Description                                                           |
| ------ | ---------- | ---- | --------------------------------------------------------------------- |
| is32   | 8.5        | 16   | 16×16 24-bit icon                                                     |
| s8mk   | 8.5        | 16   | 16x16 8-bit mask                                                      |
| il32   | 8.5        | 32   | 32x32 24-bit icon                                                     |
| l8mk   | 8.5        | 32   | 32×32 8-bit mask                                                      |
| ic04   |            | 16   | 16x16 ARGB                                                            |
| ic05   |            | 32   | 32x32 ARGB                                                            |
| ic07   | 10.7       | 128  | 128x128 icon in PNG format                                            |
| ic08   | 10.5       | 256  | 256×256 icon in PNG format                                            |
| ic09   | 10.5       | 512  | 512×512 icon in PNG format                                            |
| ic10   | 10.7       | 1024 | 1024×1024 in 10.7 (or 512x512@2x "retina" in 10.8) icon in PNG format |
| ic11   | 10.8       | 32   | 16x16@2x "retina" icon in PNG format                                  |
| ic12   | 10.8       | 64   | 32x32@2x "retina" icon in PNG format                                  |
| ic13   | 10.8       | 256  | 128x128@2x "retina" icon in PNG format                                |
| ic14   | 10.8       | 512  | 256x256@2x "retina" icon in PNG format                                |
