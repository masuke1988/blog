---
author: まっす
pubDatetime: 2024-10-25T00:00:00Z
# modDatetime: 2023-12-21T09:12:47.400Z
title: <WordPress>ブロックエディタで使用するブロックを限定する
slug: wp-unregister-blockv-ariation
featured: true
draft: false
tags:
  - WordPress
  - ブロックエディタ
description: WordPressのブロックエディタで、使用しないブロックを削除しておきたい場合の対処法
---

<!-- ## Table of contents -->

## 実装した経緯

使用するブロックを限定することで、納品後のメンテナンス等の手間を減らしたかった

## コード

コードは下記に示す。
今回は`core/embed`の中のYouTubeのみを許可する場合を考える。

1. functions.phpに下記を記入

```php

function allowed_block_js() {
  wp_enqueue_script(
      'mytheme-script',
      get_template_directory_uri() . '/js/unregister-block.js',
      array( 'wp-blocks', 'wp-dom-ready', 'wp-edit-post' )
  );
}
add_action('enqueue_block_editor_assets', 'allowed_block_js', 10, 2);

```
- `allowed_block_js`関数を作成し、`enqueue_block_editor_assets`フックを使用して、投稿画面のブロックエディタで実行する。
- `array( 'wp-blocks', 'wp-dom-ready', 'wp-edit-post' )`で、今回読み込む`unregister-block.js`が依存するスクリプトを読み込む先に読み込む
- 今回は、テーマディレクトリ内のjsディレクトリから`unregister-block.js`を読み込む想定

2. `unregister-block.js`を作成。

```javascript
wp.domReady(() => {
  const embedVariations = [
    'amazon-kindle',
    'animoto',
    'cloudup',
    'collegehumor',
    'crowdsignal',
    'dailymotion',
    'facebook',
    'flickr',
    'imgur',
    'instagram',
    'issuu',
    'kickstarter',
    'meetup-com',
    'mixcloud',
    'reddit',
    'reverbnation',
    'screencast',
    'scribd',
    'slideshare',
    'smugmug',
    'soundcloud',
    'speaker-deck',
    'spotify',
    'ted',
    'tiktok',
    'tumblr',
    'twitter',
    'videopress',
    'vimeo',
    'wordpress',
    'wordpress-tv',
    'bluesky',
    'pinterest',
    'wolfram-cloud',
    'pocket-casts',
    //'youtube'
  ];

  console.log(getBlockVariation('core/embed'))

  embedVariations.forEach((blockVariation) => {
    wp.blocks.unregisterBlockVariation('core/embed', blockVariation);
  });
} );


// ブロックの確認
wp.domReady(function () {
  // ブロックタイプを確認する
  console.log(wp.blocks.getBlockTypes());

  // 埋め込みブロックの種類を確認する
  console.log(wp.blocks.getBlockVariations('core/embed'));
});

```

- `wp.domReady`関数はWordPressのエディター環境で使用される関数。
- 引数にはコールバック関数を記述する。
- コールバック関数はDOMの読み込み終了後に実行される。
- `const embedVariations`で`'core/embed'`の中で削除したいブロックを記述する。
- ブロックの名前は下記のコードを記入すれば確認が可能。

```javascript
// ブロックの確認
wp.domReady(function () {
  // ブロックタイプを確認する
  console.log(wp.blocks.getBlockTypes());

  // 埋め込みブロックの種類を確認する
  console.log(wp.blocks.getBlockVariations('core/embed'));
});

```

## 終わりに

今まで`allowed_block_types_all`フックを使った方法しか使ってこなかったが、個人的にはこちらの方が扱いやすそう。


## 参考

https://zenn.dev/shimomura/articles/gutenberg-block-list
https://wordpress.stackexchange.com/questions/379612/how-to-remove-the-core-embed-blocks-in-wordpress-5-6