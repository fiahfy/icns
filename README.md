<!-- markdownlint-disable MD024 -->

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

## API

### Class: Icns

#### static from(buffer)

Create ICNS from the icon buffer.

##### buffer

Type: `Buffer`

The ICNS icon buffer.

#### append(image)

Adds ICNS image at the end.

##### image

Type: `IcnsImage`

The ICNS Image to append.

#### insert(image, index)

Inserts ICNS image at the specified position.

##### image

Type: `IcnsImage`

The ICNS Image to insert.

##### index

Type: `number`

The position at which to insert the ICNS Image.

#### remove(index)

Removes ICNS image at the specified position.

##### index

Type: `number`

The position of the ICNS Image to remove.

#### fileHeader

Type: `IcnsFileHeader`

Return the file header on the ICNS.

#### images

Type: `IcnsImage[]`

Return the ICNS images on the ICNS.

#### data

Type: `Buffer`

Return the ICNS buffer.

### Class: IcnsImage

#### static from(buffer)

Create ICNS image from the buffer.

##### buffer

Type: `Buffer`

The ICNS image buffer.

#### static fromPNG(buffer, osType)

Create ICNS Image from the PNG image buffer.

##### buffer

Type: `Buffer`

The PNG image buffer.

##### osType

Type: `OSType`

The icon OSType.

### Class: IcnsFileHeader

#### static from(buffer)

Create ICNS file header from the buffer.

##### buffer

Type: `Buffer`

The ICNS file header buffer.

## Specifications

### Supported OSTypes

| OSType | OS Version | Size | Description                                                           |
| ------ | ---------- | ---- | --------------------------------------------------------------------- |
| is32   | 8.5        | 16   | 16×16 24-bit icon                                                     |
| il32   | 8.5        | 32   | 32x32 24-bit icon                                                     |
| ih32   | 8.5        | 48   | 48×48 24-bit icon                                                     |
| it32   | 10.0       | 128  | 128x128 24-bit icon                                                   |
| s8mk   | 8.5        | 16   | 16x16 8-bit mask                                                      |
| l8mk   | 8.5        | 32   | 32×32 8-bit mask                                                      |
| h8mk   | 8.5        | 48   | 48×48 8-bit mask                                                      |
| t8mk   | 10.0       | 128  | 128x128 8-bit mask                                                    |
| ic04   |            | 16   | 16x16 ARGB                                                            |
| ic05   |            | 32   | 32x32 ARGB                                                            |
| icp4   | 10.7       | 16   | 16x16 icon in PNG format                                              |
| icp5   | 10.7       | 32   | 32x32 icon in PNG format                                              |
| icp6   | 10.7       | 64   | 64x64 icon in PNG format                                              |
| ic07   | 10.7       | 128  | 128x128 icon in PNG format                                            |
| ic08   | 10.5       | 256  | 256×256 icon in PNG format                                            |
| ic09   | 10.5       | 512  | 512×512 icon in PNG format                                            |
| ic10   | 10.7       | 1024 | 1024×1024 in 10.7 (or 512x512@2x "retina" in 10.8) icon in PNG format |
| ic11   | 10.8       | 32   | 16x16@2x "retina" icon in PNG format                                  |
| ic12   | 10.8       | 64   | 32x32@2x "retina" icon in PNG format                                  |
| ic13   | 10.8       | 256  | 128x128@2x "retina" icon in PNG format                                |
| ic14   | 10.8       | 512  | 256x256@2x "retina" icon in PNG format                                |
