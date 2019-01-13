# icns

> [Apple Icon Image format](https://en.wikipedia.org/wiki/Apple_Icon_Image_format) parser and builder.

# Installation
```
npm install @fiahfy/icns --save
```

# Quick Start
## Importing
```js
import fs from 'fs'
import Icns from '@fiahfy/icns'
```
```js
const fs = require('fs'), Icns = require('@fiahfy/icns')
```

## Parsing
```js
const buf = fs.readFileSync('input.icns')
const icns = new Icns(buf)
const imagesAsBuffers = icns.images.map(icon => icon.image)
```
Note that the images may be encoded in different file formats, in accordance with [Apple's _icon type_ specifications](https://en.wikipedia.org/wiki/Apple_Icon_Image_format#Icon_types).

## Building
```js
  const output = new Icns()
  let buf, osType
  
  buf = fs.readFileSync('1024x1024.png')
  osType = 'ic10'
  await icns.appendImage(buf, osType)
  
  buf = fs.readFileSync('512x512.png')
  osType = 'ic09'
  await icns.appendImage(buf, osType)
  
  /* Some other PNG or JPEG 2000 encoded files */
  
  fs.writeFileSync('icon.icns', output.data)
```

# Specifications
## Supported OSTypes
|OSType| OS Version | Description                                                                       |
|------|------------|-----------------------------------------------------------------------------------|
|ic07  | 10.7       | 128x128 icon in JPEG 2000 or PNG format                                           |
|ic08  | 10.5       | 256×256 icon in JPEG 2000 or PNG format                                           |
|ic09  | 10.5       | 512×512 icon in JPEG 2000 or PNG format                                           |
|ic10  | 10.7       | 1024×1024 in 10.7 (or 512x512@2x "retina" in 10.8) icon in JPEG 2000 or PNG format|
|ic11  | 10.8       | 16x16@2x "retina" icon in JPEG 2000 or PNG format                                 |
|ic12  | 10.8       | 32x32@2x "retina" icon in JPEG 2000 or PNG format                                 |
|ic13  | 10.8       | 128x128@2x "retina" icon in JPEG 2000 or PNG format                               |
|ic14  | 10.8       | 256x256@2x "retina" icon in JPEG 2000 or PNG format                               |
