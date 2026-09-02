---
author: まっす
pubDatetime: 2026-09-02T4:00:00Z
# modDatetime: 2023-12-21T09:12:47.400Z
title: WordPressの更新で「wp-contentが見つかりません」と表示されたときの対応
slug: wordpress-ftp-base-update-fix
featured: true
draft: false
tags:
  - WordPress
  - FTP
description:
  WordPressの更新時に「wp-contentが見つかりません」と表示された原因と、FTP_BASE・FTP_PLUGIN_DIRを設定して解決した手順をまとめます。
---

WordPressのプラグインを更新しようとしたところ、次のエラーが発生しました。

```text
更新失敗: WordPress のコンテンツディレクトリ (wp-content) が見つかりません。
```

最初はファイルやディレクトリのパーミッションを疑いましたが、調査したところ、今回の原因は別のところにありました。

## Table of contents

## 環境・前提

今回のWordPressは、ドキュメントルート直下ではなく、1階層下の `wp` ディレクトリに設置しています。

```text
/sample/sample/
└── wp/
    ├── wp-admin/
    ├── wp-content/
    ├── wp-includes/
    └── ...
```

WordPress本体のパスは次の状態です。

```text
/sample/sample/wp/
```

また、このサーバーではPHPからWordPressファイルへ直接書き込むことができず、WordPressの更新はFTP経由で行う必要があります。

現在使用しているFTPユーザーで接続した際の初期ディレクトリは、WordPress本体とは別の場所でした。

```text
/test/testuserA/
```

このディレクトリ内は空ですが、FTPソフトから `/sample/sample/wp/` まで移動すること自体は可能でした。

## 起こった現象

SiteGuard WP PluginをWordPress管理画面から更新しようとすると、次のエラーが発生しました。

```text
更新失敗: WordPress のコンテンツディレクトリ (wp-content) が見つかりません。
```

FTPソフトから確認すると `wp-content` は実際に存在しており、プラグインファイルにもアクセスできます。

そのため、単純に「wp-contentが存在しない」という問題ではありませんでした。

## 仮説

最初はパーミッションや所有者の問題を疑いました。

実際、WordPressが置かれていたディレクトリは、以前使用していた削除済みユーザーが所有していたため、現在利用しているユーザーへ所有者を変更しました。

しかし、それでも更新エラーは解消しませんでした。

そこで、PHPからWordPressがどのようにディレクトリを認識しているか確認しました。

確認用PHPを作成して調べたところ、次の状態でした。

```text
ABSPATH: /sample/sample/wp/
WP_CONTENT_DIR: /sample/sample/wp/wp-content
WP_PLUGIN_DIR: /sample/sample/wp/wp-content/plugins

WP_CONTENT_DIR exists: YES
WP_CONTENT_DIR readable: YES
WP_CONTENT_DIR writable: NO

WP_PLUGIN_DIR exists: YES
WP_PLUGIN_DIR readable: YES
WP_PLUGIN_DIR writable: NO

FS_METHOD: 未定義
FTP_BASE: 未定義
FTP_CONTENT_DIR: 未定義
FTP_PLUGIN_DIR: 未定義

FTP extension: YES

get_filesystem_method(): ftpext
```

ここから分かったのは、WordPress自体は `wp-content` を正常に認識しているということです。

一方で、PHPから直接書き込むことはできず、WordPressは自動的に `ftpext`、つまりFTP経由でのファイル操作を選択していました。

今回のサーバーでは、

```text
WordPress本体
/sample/sample/wp/
```

に対して、FTPログイン直後の場所が、

```text
/test/testuserA/
```

となっています。

そのため、WordPressがFTP経由でファイルを操作する際に、

```text
/sample/sample/wp/
```

がFTP上のどのディレクトリに対応しているのか、自動的に正しく判定できていないのではないかと考えました。

## 対応

`wp-config.php` に、FTP上のWordPress本体とプラグインディレクトリの場所を明示しました。

```php
define( 'FTP_BASE', '/sample/sample/wp/' );
define( 'FTP_PLUGIN_DIR', '/sample/sample/wp/wp-content/plugins/' );
```

`FTP_BASE` はWordPress本体のルートディレクトリです。

```text
/sample/sample/wp/
```

`FTP_PLUGIN_DIR` はプラグインディレクトリです。

```text
/sample/sample/wp/wp-content/plugins/
```

今回は `FS_METHOD` は指定していません。

確認結果で、

```text
get_filesystem_method(): ftpext
```

となっており、WordPress自身がFTP方式を選択できていたためです。

また、`FTP_CONTENT_DIR` についても今回は指定していません。

必要な設定だけを追加する形にしました。

## 結果

設定後、SiteGuard WP Pluginのアップデートを再度実行したところ、正常に更新できました。

さらに、そのままWordPress本体のアップデートも実行しましたが、こちらも問題なく完了しました。

最終的な設定は次の2つだけです。

```php
define( 'FTP_BASE', '/sample/sample/wp/' );
define( 'FTP_PLUGIN_DIR', '/sample/sample/wp/wp-content/plugins/' );
```

## 今回のポイント

今回のエラー、

```text
WordPress のコンテンツディレクトリ (wp-content) が見つかりません。
```

だけを見ると、`wp-content` のパーミッションや所有者に問題があるように見えます。

しかし、実際には `wp-content` は存在しており、WordPressからも読み取り可能でした。

問題だったのは、PHPから見たWordPressのパスと、FTP経由でWordPressがファイル操作するときのパスの対応関係です。

特に、

- PHPから直接WordPressファイルへ書き込めない
- WordPressの更新にFTPを使用している
- FTPログイン時の初期ディレクトリとWordPress本体の場所が異なる
- WordPressをサブディレクトリに設置している

といった環境では、`FTP_BASE` などの設定が必要になる場合があります。

同じエラーが発生した場合は、パーミッションだけを見るのではなく、WordPressが使用しているファイルシステム方式とFTP上のパスも確認した方がよさそうです。

## 補足：確認用PHPは削除する

今回の調査では、`ABSPATH` や `WP_CONTENT_DIR` などを表示する確認用PHPを一時的に設置しました。

これらの情報にはサーバー内部の絶対パスが含まれるため、調査が終わったら確認用PHPは必ず削除しておきます。
