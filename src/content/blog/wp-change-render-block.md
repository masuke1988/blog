---
author: まっす
pubDatetime: 2025-06-09T7:00:00Z
title: <WordPress>レンダリングされるブロックのHTMLを変更する
slug: wp-change-render-block
featured: true
draft: false
tags:
  - WordPress
  - ブロックエディタ
description: レンダリングされるブロックのHTMLを変更する。
---

<!-- ## Table of contents -->

## 実装した経緯

`core/heading`や`core/post-title`を使用する際、デザイン上、擬似要素を使用する必要があった。
その際、デフォルトで出力されるHTMLタグに`span`タグを内包させたかった。

## 前提

今回は下記のような状態にしたかった。

- `core/heading`ブロックが `<h2>` で、かつ `$arr`にあるクラス が付いている場合のみ、出力 HTMLの中のテキスト部分を`<span class="custom-span">`～`</span>` でラップする
- `$arr`は下記の通り。

```php
$arr = [
      'is-style-h2-ttl__red',
      'is-style-h2-ttl__blue',
      'is-style-h2-ttl__green',
      'is-style-h2-ttl__yellow',
];
```
- `$arr`にあるクラスは、`functions.php`で`register_block_style`関数を使用してスタイル登録しておく。コードは下記の通り。４通り登録。

```php
function default_block_add_class() {

  wp_register_style( 'myblock-style', get_template_directory_uri() . '/assets/css/style.css' );
  
  // 見出しスタイル　赤
  register_block_style(
    'core/heading',
    array(
      "name" => "h2-ttl__red",
      "label" => "タイトル 赤",
    )
  );
  
  // 見出しスタイル　青
  register_block_style(
    'core/heading',
    array(
      "name" => "h2-ttl__blue",
      "label" => "タイトル 青",
    )
  );

  // 見出しスタイル 緑
  register_block_style(
    'core/heading',
    array(
      "name" => "h2-ttl__green",
      "label" => "タイトル 緑",
    )
  );
  
  // 見出しスタイル　黄色
  register_block_style(
    'core/heading',
    array(
      "name" => "h2-ttl__yellow",
      "label" => "タイトル 黄色",
    )
  );
}

add_action('init', 'default_block_add_class');
```


## コード

`functions.php`に下記を記述。

```php
/**
 * 「core/heading」ブロックが <h2> で、かつ arrにあるクラスが付いている場合のみ、
 * 出力 HTML の中のテキスト部分を <span class="custom-span">...</span> でラップする
 *
 * @param string $block_content  これから出力されるブロックの HTML 全体
 * @param array  $block          ブロック情報（name, attrs, innerBlocks…）
 * @return string                加工後の HTML を返す
 */
function mytheme_wrap_h2_with_span_for_special_style( $block_content, $block ) {
    
    // 登録するスタイルのクラス名を配列で定義
    $arr = [
      'is-style-h2-ttl__red',
      'is-style-h2-ttl__blue',
      'is-style-h2-ttl__green',
      'is-style-h2-ttl__yellow',
    ];

    // ブロックの名前が 'core/heading' であることを確認
    if ( isset( $block['blockName'] ) && $block['blockName'] === 'core/heading' ) {

        // 属性として className が存在するか？ かつ クラスが配列内が含まれているか?を確認
        $class_attr = isset( $block['attrs']['className'] ) ? $block['attrs']['className'] : '';
        if ( in_array( $class_attr, $arr ) !== false ) {
            // <h2> の内側にあるテキスト（子要素）を <span class="custom-span">…</span> でラップする
            //
            //    - "<h2([^>]*)>(.*?)</h2>" で <h2>～</h2> を対象にする
            //    - "(?s)" 修飾子を入れることで改行を含めた任意の文字列もマッチさせる
            $pattern  = '/<h2([^>]*)>(?s:(.*?))<\/h2>/i';
            //    - $1 に属性部分、$2 に中身（子要素やテキスト）を入れる
            $replace  = '<h2$1><span>$2</span></h2>';
            // preg_replaceで$block_contentを置換
            $block_content = preg_replace( $pattern, $replace, $block_content );
        }
    }

    return $block_content;
}

// render_block
add_filter( 'render_block', 'mytheme_wrap_h2_with_span_for_special_style', 10, 2 );

```

## ハマった箇所

正規表現は苦手。ChatGPTにお任せした。

## 終わりに

`register_block_style`関数と組み合わせると、わざわざブロックを作らなくてもスタイルを変えられるのは便利。
ただ、編集画面では変化が見えない場合もあるという大きなデメリットもあるので、注意が必要。

## 参考

https://developer.wordpress.org/reference/functions/render_block/
