---
author: まっす
pubDatetime: 2024-08-21T0:00:00Z
# modDatetime: 2023-12-21T09:12:47.400Z
title: <WordPress>ACFを用いたキーワード検索機能のカスタマイズ
slug: wp-custom-query
featured: true
draft: false
tags:
  - WordPress
  - SQL
description: WordPressのページ内検索機能とACFを組み合わせて検索機能を実装したが、速度が遅くなってしまったので、カスタマイズ
---

<!-- ## Table of contents -->

## カスタマイズした経緯

とあるサイトの構築で、ACFで入力したカスタムフィールドを対象とした検索機能を実装した。
当初は問題なかったが、検索時のキーワードが増えると処理速度が著しく落ちることがわかった。

## 原因

原因は`WP_Query`の`meta_query`が複雑になっていたことが原因だった。

また実装の都合上、`WP_QUery`による検索を1度に10回以上行う必要がある上、サーバーのリソースは増やせない等の事情も重なった。

## 改修前のコード（一部抜粋）

- 検索結果をグループ毎に出力したかったため、グループに関する配列$arrayを用意。
- `get_search_query()`で検索ワードを取得。スペース区切りで入力することを想定しているので、取得後、`explode`で配列に変換。
- 各検索ワードをACFで設定したカスタムフィールド毎に検索。compareはLIKE。

```php

$array = [
    "グループ名" => "group",
    ・
    ・
    ・
  ];

<?php foreach($array as $key => $field) : ?>
  <?php

    // meta_query用の配列を用意
    $meta_query = [];

    //-------- キーワード検索 --------//
  if(!empty(get_search_query()) ) {

    $str = str_replace('　', ' ', esc_html(get_search_query()), $count);
    $arr = explode(' ', $str);

    if(count($arr) > 1) {

      $meta_query_word = [
        [
          'relation' => 'AND',
        ]
      ];

      foreach($arr as $item) {

        $meta_arr = [
          [
            'relation' => 'OR',
            [
              'key' => 'title', // フィールド名の指定
              'value' => esc_html($item), // 値の指定
              'compare' => 'LIKE' // フィールド値の部分一致
            ],
            [
              'key' => 'name', // フィールド名の指定
              'value' => esc_html($item), // 値の指定
              'compare' => 'LIKE' // フィールド値の部分一致
            ],
            [
              'key' => 'name_nospace', // フィールド名の指定
              'value' => esc_html($item), // 値の指定
              'compare' => 'LIKE' // フィールド値の部分一致
            ],
            [
              'key' => 'name_kana', // フィールド名の指定
              'value' => esc_html($item), // 値の指定
              'compare' => 'LIKE' // フィールド値の部分一致
            ],
            [
              'key' => 'name_en', // フィールド名の指定
              'value' => esc_html($item), // 値の指定
              'compare' => 'LIKE' // フィールド値の部分一致
            ],
            [
              'key' => 'keyword', // フィールド名の指定
              'value' => esc_html($item), // 値の指定
              'compare' => 'LIKE' // フィールド値の部分一致
            ],
            [
              'key' => 'area', // フィールド名の指定
              'value' => esc_html($item), // 値の指定
              'compare' => 'LIKE' // フィールド値の部分一致
            ],
          ],
        ];

        $meta_query_word[0] = array_merge(
          $meta_query_word[0],
          $meta_arr,
        );
      }

      $meta_query[] = $meta_query_word;

    } else {
      $meta_query[] = [
        'relation' => 'OR',
        [
          'key' => 'title', // フィールド名の指定
          'value' => esc_html(get_search_query()), // 値の指定
          'compare' => 'LIKE' // フィールド値の部分一致
        ],
        [
          'key' => 'name', // フィールド名の指定
          'value' => esc_html(get_search_query()), // 値の指定
          'compare' => 'LIKE' // フィールド値の部分一致
        ],
        [
          'key' => 'name_nospace', // フィールド名の指定
          'value' => esc_html(get_search_query()), // 値の指定
          'compare' => 'LIKE' // フィールド値の部分一致
        ],
        [
          'key' => 'name_kana', // フィールド名の指定
          'value' => esc_html(get_search_query()), // 値の指定
          'compare' => 'LIKE' // フィールド値の部分一致
        ],
        [
          'key' => 'name_en', // フィールド名の指定
          'value' => esc_html(get_search_query()), // 値の指定
          'compare' => 'LIKE' // フィールド値の部分一致
        ],
        [
          'key' => 'keyword', // フィールド名の指定
          'value' => esc_html(get_search_query()), // 値の指定
          'compare' => 'LIKE' // フィールド値の部分一致
        ],
        [
          'key' => 'area', // フィールド名の指定
          'value' => esc_html(get_search_query()), // 値の指定
          'compare' => 'LIKE' // フィールド値の部分一致
        ],
      ];
    }
  }

    //-------- その他検索条件 --------//


    //-------- $argsに$meta_queryを設定 --------//

    $args = [
      'post_type' => 'post_type',
      'posts_per_page' => -1,
      'post_status' => 'publish',
      'meta_query' => $meta_query,
    ];

    $the_query = new WP_Query($args);

    if ($the_query->have_posts()): ?>

    //
    // 検索結果等のコンテンツがここに入ります。
    //

<?php endforeach; ?>
```

## 改修後

- `get_custom_search_results`関数を作成。キーワード検索のSQLを別途作成。キーワードの該当する投稿IDを返却
- 返却した投稿IDを`$args['post__in']`に代入。

```php

function get_custom_search_results($search_query) {
    global $wpdb;

    // キーワード検索のSQL部分を作成
    $str = str_replace('　', ' ', $search_query); // 全角スペースを半角スペースに変換
    $arr = explode(' ', $str); // スペースで分割

    $sql_conditions = [];
    foreach ($arr as $item) {
        $like_item = '%' . $wpdb->esc_like($item) . '%';
        $sql_conditions[] = $wpdb->prepare("
            pm.meta_value LIKE %s
        ", $like_item);
    }

    $sql_where = implode(' AND ', $sql_conditions);
    $meta_keys = "'title', 'name', 'name_nospace', 'name_kana', 'name_en', 'keyword', 'area'";

    // カスタムSQLクエリを作成
    $query = $wpdb->prepare("
        SELECT DISTINCT p.ID
        FROM {$wpdb->posts} p
        INNER JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id
        WHERE p.post_type = %s
        AND p.post_status = %s
        AND pm.meta_key IN ($meta_keys)
        AND ($sql_where)
    ", 'seeds', 'publish');

    // 結果を取得
    $post_ids = $wpdb->get_col($query);
    return $post_ids;
  }

$array = [
    "グループ名" => "group",
    ・
    ・
    ・
  ];

<?php foreach($array as $key => $field) : ?>
  <?php

    // meta_query用の配列を用意
    $meta_query = [];

    //-------- その他検索条件 --------//


    //-------- $argsに$meta_queryを設定 --------//

    $args = [
      'post_type' => 'post_type',
      'posts_per_page' => -1,
      'post_status' => 'publish',
      'meta_query' => $meta_query,
    ];

    //-------- キーワード検索 --------//

    $search_query = get_search_query();
    $search_keyword_arr = get_custom_search_results($search_query);

    if(is_array($search_keyword_arr) && !empty($search_keyword_arr)) {
      $args['post__in'] = $search_keyword_arr;
    } elseif (empty($search_keyword_arr) && !empty($search_query)) {
      // キーワード検索結果が空で、検索クエリがある場合は、結果がないと判断して空の結果を返す
      $args['post__in'] = [0]; // 存在しないIDを設定して空の結果を強制
    }

    $the_query = new WP_Query($args);

    if ($the_query->have_posts()): ?>

    //
    // 検索結果等のコンテンツがここに入ります。
    //

<?php endforeach; ?>
```

## 結果

改修前と改修後で、WP_Queryインスタンス化〜検索までの時間が1/10になった。
トータルでは処理時間が1/3となった。

## 終わりに

`WP_Query`は便利だが、今回のようなケースで使用する際はなるべく処理を分けて軽くして行うのが良さそう。
