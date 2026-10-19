---
author: まっす
pubDatetime: 2026-10-19T16:00:00Z
title: "WordPressのuser_nicenameの仕組みと変更方法"
slug: astro-repalce-relative-path
featured: true
draft: false
tags:
  - WordPress
  - user_nicename
description:
  WordPressのuser_nicenameの仕組みと変更方法
---

WordPressのログイン履歴に不審なアクセスがあり、ユーザー情報が外部から取得できないか確認した。すると、投稿のREST APIレスポンスに`user_nicename`という形で投稿者のスラッグが含まれていた。

## Table of contents

## user_loginとuser_nicenameの違い

| 項目 | 用途 |
| --- | --- |
| `user_login` | ログイン時に入力するユーザー名 |
| `user_nicename` | 投稿者URLなどに使用するスラッグ |
| `nickname` | プロフィールのニックネーム（ユーザーメタ） |
| `display_name` | サイト上の表示名 |

WordPressは通常、新規ユーザーの作成時に`user_login`をもとに`user_nicename`を生成する。
そのため両者が一致していることがある。管理画面からニックネームや表示名を変えても、`user_nicename`は変わらない。

## REST APIで確認する

外部の未認証環境から実行する。

```bash
curl -sS "https://example.com/wp-json/wp/v2/posts?_embed&per_page=1" \
  | jq '.[0]._embedded.author[] | {id, name, slug, link}'
```

出力例：

```json
{
  "id": 1,
  "name": "編集担当",
  "slug": "admin",
  "link": "https://example.com/author/admin/"
}
```

ここでの`slug`は`user_nicename`に対応する。`user_login`と同じ値ならログイン名を推測できる。ただし、数値のユーザーIDや投稿者スラッグは本来公開され得る情報であり、表示されたこと自体が認証情報の漏洩を意味するわけではない。

投稿者URLからも推測できる場合がある。

```bash
curl -sSI "https://example.com/?author=1"
```

## WP-CLIでuser_nicenameを変更する

まず現在の値を確認する。

```bash
wp user list --fields=ID,user_login,user_nicename,display_name
```

IDが`1`のユーザーの場合：

```bash
wp user update 1 --user_nicename=site-editor
```

変更後は、例えば次のようになる。

```text
user_login     = secret-admin
user_nicename  = site-editor
display_name   = 編集担当
```

`user_login`は変わらないため、従来のユーザー名でログインできる。`user_nicename`を変更すると投稿者アーカイブURLが変わるので、公開中のページやリンクがあればリダイレクトも検討する。

新規ユーザーをWP-CLIで作る場合は、作成時に`--user_nicename`を指定できる。WordPress標準の「新規ユーザーを追加」画面には通常この入力欄はない。

## セキュリティ上の位置づけ

`user_nicename`を変えることは、ログイン名の露出を減らす補助的な対策である。攻撃者がすでにログイン名を知っている場合、その知識を取り消すことはできない。強いパスワード、ログイン試行回数制限、2要素認証も併用したい。

## 参考

- [WordPress REST API: Users](https://developer.wordpress.org/rest-api/reference/users/)
- [WP-CLI: wp user update](https://developer.wordpress.org/cli/commands/user/update/)
- [WP-CLI: wp user create](https://developer.wordpress.org/cli/commands/user/create/)
