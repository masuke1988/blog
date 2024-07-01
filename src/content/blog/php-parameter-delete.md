---
author: まっす
pubDatetime: 2024-06-30T11:00:00Z
# modDatetime: 2023-12-21T09:12:47.400Z
title: <PHP>URLのパラメータを削除する
slug: php-parameter-delete
featured: true
draft: false
tags:
  - php
description: <PHP>URLのパラメータを削除する
---

<!-- ## Table of contents -->

## explode()を使用する

```php
$url = "https://sample.com/?year=2024";
$url = explode('?', $url);
echo $url[0];
// https://sample.com/
```

## strtok()を使用する

```php
$url = "https://sample.com/?year=2024";
$url = strtok($url, '?');
echo $url;
// https://sample.com/
```

いつもはexplode()を使用するけど、他の方法もあるのね。
今後のためにメモ。
