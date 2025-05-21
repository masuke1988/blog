---
author: まっす
pubDatetime: 2025-05-21T7:00:00Z
title: <WordPress>ブロックにdata属性を付与する
slug: wp-data-attribute-block
featured: true
draft: false
tags:
  - WordPress
  - ブロックエディタ
description: ブロックにdata属性を付与する設定を行う。
---

<!-- ## Table of contents -->

## 実装した経緯

WordPressのブロックはデフォルトではdata属性を付与できない。
今回はデザインの都合上、見出しブロックにdata属性を付与したかった。

## 前提

私の場合、下記のような状況で作成してます。

・テーマフォルダ内に該当のコードを記述。プラグインではありません。
・Rspackを使用しています。
・パッケージマネージャはyarnを使用

```
.
├── dist
│   ├── assets
│   │   ├── css
│   │   │   ├── editor-styles.css
│   │   │   └── main.css
│   │   ├── img
│   │   │   └── home
│   │   └── js
│   │       ├── customEditor.js
│   │       ├── editor-styles.js
│   │       └── main.js
│   ├── footer.php
│   ├── functions.php
│   ├── header.php
│   ├── index.php
│   ├── style.css
│   └── theme.json
├── index.php
├── package-lock.json
├── package.json
├── README.md
├── rspack.config.ts
├── src
│   ├── img
│   │   └── 画像フォルダ
│   ├── php
│   │   └── テーマのphpが入っているフォルダ
│   ├── scss
│   │   ├── editor-style.scss
│   │   └── style.scss
│   └── ts
│       ├── _modules
│       │   └── 各モジュール
│       ├── _utils
│       │   └── _utils.ts
│       ├── custom-editor.tsx
│       └── index.ts
├── tsconfig.json
└── yarn.lock

```

## 準備

まずは必要なパッケージをインストール

```zsh
npm install @wordpress/blocks @wordpress/hooks @wordpress/element @wordpress/components @wordpress/block-editor --save
```

WordPress 用の型定義もインストール
```zsh
npm install @types/wordpress__blocks @types/wordpress__element @types/wordpress__hooks @types/wordpress__components @types/wordpress__block-editor --save-dev
```

`tsconfig.json`を設定する
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "esModuleInterop": true,
    "moduleResolution": "node",
    "forceConsistentCasingInFileNames": true,
    "baseUrl": "./",
    "paths": {
      "@wordpress/*": ["node_modules/@wordpress/*"],
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules"]
}

```

## コード

tsxを使用。`custom-editor.tsx`に記述。

```typescript
// custom-editor.tsx

import { createHigherOrderComponent } from "@wordpress/compose";
import { addFilter, hasFilter, removeFilter } from "@wordpress/hooks";
import { Fragment } from "@wordpress/element";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, TextControl } from "@wordpress/components";
import { BlockEditProps } from "@wordpress/blocks";

/**
 * 属性の追加
 * @param settings
 * @param name
 * @returns
 */
const addDataTitleHeadingAttribute = (settings: any, name: string) => {

  // コアブロックの見出し以外は処理しない
  if (name !== "core/heading") {
    return settings;
  }

  // 属性が既に存在しない場合のみ追加
  if (!settings.attributes.dataTitleHeading) {
    settings.attributes = {
      // dataTitleHeading 属性を追加。これはdata-title-heading属性に変換される。
      ...settings.attributes,
      dataTitleHeading: {
        type: "string",
        default: "",
      },
    };
  }

  return settings;
};

addFilter(
  "blocks.registerBlockType",
  "my-theme/add-data-title-heading-attribute",
  addDataTitleHeadingAttribute
);

/**
 * ブロックエディターに dataTitleHeading 属性入力欄を追加する
 */
const headingDataTitleHeadingControl = createHigherOrderComponent(
  (BlockEdit: React.ComponentType<BlockEditProps<any>>) => (props: BlockEditProps<any>) => {
    if (props.name !== "core/heading") {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;
    const { dataTitleHeading } = attributes;

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody title="タイトルの英語" initialOpen>
            <TextControl
              label="dataTitleHeading 属性"
              value={dataTitleHeading}
              onChange={(value) => setAttributes({ dataTitleHeading: value })}
              help="data-title-heading 属性が追加されます"
            />
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  },
  "headingDataTitleHeadingControl"
);

const FILTER_NAME = "my-theme/heading-data-title-heading-control";

// 既存のフィルタを削除してから再登録（重複を防ぐ）
if (hasFilter("editor.BlockEdit", FILTER_NAME)) {
  removeFilter("editor.BlockEdit", FILTER_NAME);
}

addFilter("editor.BlockEdit", FILTER_NAME, headingDataTitleHeadingControl);


/**
 * 追加した属性を保存する
 */
const saveDataTitleHeadingAttribute = (
  props: Record<string, any>,
  blockType: Record<string, any>,
  attributes: Record<string, any>
) => {
  if (blockType.name !== "core/heading") {
    return props;
  }

  const { dataTitleHeading } = attributes;

  // 属性が存在する場合のみ保存
  if (dataTitleHeading) {
    props["data-title-heading"] = dataTitleHeading;
  }

  return props;
};

addFilter(
  "blocks.getSaveContent.extraProps",
  "my-theme/save-data-title-heading-attribute",
  saveDataTitleHeadingAttribute
);

```

## ハマった箇所

「data属性を付与する」という機能には満たしていたが、なぜか2回表示されていた。
下記を記述することで回避できた。

```typescript
const FILTER_NAME = "my-theme/heading-data-title-heading-control";

// 既存のフィルタを削除してから再登録（重複を防ぐ）
if (hasFilter("editor.BlockEdit", FILTER_NAME)) {
  removeFilter("editor.BlockEdit", FILTER_NAME);
}
```

`editor.BlockEdit`から`FILTER_NAME`を一旦削除してから、`addFilter("editor.BlockEdit", FILTER_NAME, headingDataTitleHeadingControl);`で登録を行うことでこの症状を回避できた。


## 終わりに

あまりプラグインを入れたくない派ですが、大人しくプラグインを入れたほうが良かったかな。

## 参考

https://ja.wordpress.org/plugins/attributes-for-blocks/