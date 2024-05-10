---
author: まっす
pubDatetime: 2024-05-09T12:00:00Z
# modDatetime: 2023-12-21T09:12:47.400Z
title: JavaScriptを用いた順列、組み合わせ
slug: permutation-combination
featured: true
draft: false
tags:
  - Permutation
  - Combination
description: JavaScriptを用いた順列、組み合わせ
---

## Table of contents

## 調べた経緯

配列の中から数字選ぶ際、被らないように選びたかった。
その際、「Permutation（順列）」「Combination（組み合わせ）」を知ったのでメモ。

## コード

コードは下記に示す。

### Permutation（順列）

```javascript
const permutation = (nums, k) => {
  let ans = [];
  if (nums.length < k) {
    return [];
  }
  if (k === 1) {
    for (let i = 0; i < nums.length; i++) {
      ans[i] = [nums[i]];
    }
  } else {
    for (let i = 0; i < nums.length; i++) {
      let parts = nums.slice(0);
      parts.splice(i, 1)[0];
      let row = permutation(parts, k - 1);
      for (let j = 0; j < row.length; j++) {
        ans.push([nums[i]].concat(row[j]));
      }
    }
  }
  return ans;
};

const numList = [1, 2, 3];

let arr = permutation(numList, 3);

console.log(arr);

// [
//   [ 1, 2, 3 ],
//   [ 1, 3, 2 ],
//   [ 2, 1, 3 ],
//   [ 2, 3, 1 ],
//   [ 3, 1, 2 ],
//   [ 3, 2, 1 ]
// ]
```

### Combination（組み合わせ）

```javascript
const combination = (nums, k) => {
  let ans = [];
  if (nums.length < k) {
    return [];
  }
  if (k === 1) {
    for (let i = 0; i < nums.length; i++) {
      ans[i] = [nums[i]];
    }
  } else {
    for (let i = 0; i < nums.length - k + 1; i++) {
      let row = combination(nums.slice(i + 1), k - 1);
      for (let j = 0; j < row.length; j++) {
        ans.push([nums[i]].concat(row[j]));
      }
    }
  }
  return ans;
};

const numList = [1, 2, 3];

let arr = combination(numList, 3);

console.log(arr);

// [
//   [ 1, 2 ],
//   [ 1, 3 ],
//   [ 2, 3 ]
// ]
```

## 参考

> https://tech-blog.s-yoshiki.com/entry/144
