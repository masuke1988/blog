---
author: まっす
pubDatetime: 2026-06-15T0:00:00Z
# modDatetime: 2023-12-21T09:12:47.400Z
title: 【React学習9】useCallbackについて
slug: learning-react-9
featured: true
draft: false
tags:
  - React
  - TypeScript
  - 学習記録
description:
  React学習記録です。今回はuseCallbackについて学習した。
---

ReactのuseCallbackについて学習した。

## Table of contents

## useCallbackとは

`useCallback`は、依存値が変更されない限り、同じ関数オブジェクトを再利用するためのフック。
不要な関数の再生成を防ぐことで、パフォーマンスを向上させることができる。
Reactでは、コンポーネントの再レンダリングされるたびに、その中で定義した関数も新たに生成される。
`useCallback`を利用すると、依存値が変更されない限り同じ関数オブジェクトを再利用できる。
useCallbackだけでは子コンポーネントの再レンダリングは防げない。memoと組み合わせることで効果を発揮することが多い。

## useCallbackの基本的な書き方

基本的な記述方法は下記の通り。

```tsx
const handleClick = useCallback(() => {
  処理
}, []);
```

## useCallbackの役立つ場面

親コンポーネントで定義した関数を子コンポーネントに関数を渡す場合、親コンポーネントが再レンダリングされるたびに、新しい関数オブジェクトが生成される。
その結果、子コンポーネントから見るとpropsが変更されたと判断され、再レンダリングが発生する。

`useCallback`を使うことで、親コンポーネントが再レンダリングされても、依存値が変更されない限り同じ関数オブジェクトを再利用できる。

## useCallbackの使い方

簡単な実例。クリックすると、`console.log`が出力される。

```tsx
import { useCallback } from "react";

const MyComponent = () => {
  const handleClick = useCallback(() => {
    console.log("clicked");
  }, []);

  return (
    <div>
      <button onClick={handleClick}>Click me</button>
    </div>
  );
};

export default MyComponent;
```

親コンポーネントから子コンポーネントへ渡す例。

最初の読み込み時に`child render`が表示される。
`Parent Update`を押すと、再レンダリングが発生し、`Count`が更新されるが、`child render`は表示されない。
`click me`を押すと、`handleClick`が呼ばれ、`clicked`がコンソールに出力される。

親コンポーネントから子コンポーネントへ`handleClick`を渡す。
親コンポーネント側で`ChildComponent`をimportし、`onClick`に`handleClick`を渡す。

子コンポーネント側では、`memo`を使う。
`memo`はpropsが変更されていない場合、コンポーネントの再レンダーをスキップすることが可能。
上記の場合、親コンポーネントが再レンダリングされても、`useCallback`によって`handleClick`の参照が維持されるため、propsが変更されず、`memo`によって子コンポーネントの再レンダリングをスキップすることができる。


親コンポーネント
```tsx
import { useCallback, useState } from "react";
import ChildComponent from "./ChildComponent";

const ParentComponent = () => {
  const [count, setCount] = useState(0);
  const handleClick = useCallback(() => {
    console.log("clicked");
  }, []);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((prev) => prev + 1)}>Parent Update</button>
      <ChildComponent onClick={handleClick} />
    </div>
  );
};

export default ParentComponent;
```

子コンポーネント
```tsx
import { memo } from "react";

type Props = {
  onClick: () => void;
};

const ChildComponent = memo(({ onClick }: Props) => {
  console.log("child render");
  return (
    <div>
      <button onClick={onClick}>Click me</button>
    </div>
  );
});

export default ChildComponent;

```


## 注意点

軽量なコンポーネントや頻繁な更新が発生しない場合は、使用しない方が良い。
コードが煩雑になり、メンテナンスが難しくなる可能性がある。

まずは`useCallback`は使用せず実装し、子コンポーネントへ関数をpropsとして渡し、その子コンポーネントをmemo化している場合などに利用すると効果がある。

## まとめ

`useCallback`や`useMemo`を利用することで、不要な再生成や再計算を避け、パフォーマンス改善が期待できる。
ただし、不必要なところに使用するとコードが煩雑になり、メンテナンスも難しくなるので、「どこで使用するか」は状況を見て、子コンポーネントへ関数をpropsとして渡しているか、memoと組み合わせて効果があるかなどを判断する必要がある。
