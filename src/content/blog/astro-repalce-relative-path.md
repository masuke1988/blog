---
author: Sat Naing
pubDatetime: 2024-04-22T16:00:00Z
# modDatetime: 2023-12-21T09:12:47.400Z
title: Astroで相対パスを置換
slug: astro-repalce-relative-path
featured: true
draft: false
tags:
  - docs
description:
  Astroで相対パスを置換
---

## Table of contents

## 作った経緯

Astroでサイト構築を行ない、buildした際、hrefやsrcのパスは、`/_astro/index.XXXXX.css`のような形で出力される。
今回作成したサイトは`http://sample.com/sample/`のようにサブディレクトリで公開するため、そのままのコードだとCSS,JSファイルを正常に読み込めない。
そこでパスを書き換える必要があった。

## サイト構成

サイト構成は下記の通り。最低限のものだけ記載。

```
repalce.mjs
dist
├── _astro
│   ├── XXXX.js
│   └── XXXX.css
├── en
│   ├── index.html
│   ├── member
│   │   └── index.html
│   └── topics
│       └── index.html
├── images
│   ├── home
│   │   ├── XXXX.png
│   │   └── XXXX.png
│   └── member
│       ├── XXXX.jpg
│       └── XXXX.png
├── index.html
├── about
│   └── index.html
└── topics
    └── index.html
```

## コード

コードは下記に示す。

```typescript repalce.mjs
import { writeFileSync, readFileSync } from 'fs';
import {glob} from 'glob';

const replaceInHtmlFiles = () => {
  try {
    const files = glob.sync('dist/**/*.{html,css}');
    for (const file of files) {
      // htmlファイルの読み込み
      const data = readFileSync(file, 'utf8');
      const depth = file.split('/').length - 1; 
      console.log(file, depth);
      let relativePath = './'; // デフォルトは同一ディレクトリ
      if (depth > 1) {
        // ファイルがサブディレクトリにある場合、適切な数の `../` を使用
        relativePath = '../'.repeat(depth - 1);
      }

      if(file.match(/\.css$/)) {
        const result = data.replace(/url\(\/(.*?)\)/g, `url(${relativePath}$1)`)
        writeFileSync(file, result, 'utf8');
      } else if(file.match(/\.html$/)){
        // htmlファイルの場合、相対パスを置換

        const result = data
            .replace(/href="\/(.*?)"/g, `href="${relativePath}$1"`)
            .replace(/src="\/(.*?)"/g, `src="${relativePath}$1"`)
            .replace(/srcset="\/(.*?)"/g, `srcset="${relativePath}$1"`)
          writeFileSync(file, result, 'utf8');
      }
    }

    console.log('Replace in html, css files done');
  } catch (error) {
    console.log(error);
  }
};

replaceInHtmlFiles();
```
## 使用方法

使用したいディレクトリに`replace.mjs`というファイルで作成。
`node replace.mjs` と入力して使用する。

自分はbuild時にのみ使用していたため、`package.json`の中で `"build": "astro check && astro build && node replace.mjs"`と設定し、build時に同時に処理することとした。