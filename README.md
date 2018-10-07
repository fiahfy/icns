# @fiahfy/icns

> [Apple Icon Image format](https://en.wikipedia.org/wiki/Apple_Icon_Image_format) parser and builder.

## Installation
```
npm install @fiahfy/icns
```

## Usage
```js
import fs from 'fs'
import Icns from '@fiahfy/icns'

const buf = fs.readFileSync('input.icns')
const icns = new Icns(buf)
console.log(icns.iconImages.length) // 10
```
