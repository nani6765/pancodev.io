---
title: React Re-rendering에 대한 고찰
description: This article delves into React’s re-rendering process, focusing on the Render and Commit phases. It examines when optimization is necessary, questioning if renders without commits need attention. With insights into React’s performance costs, this guide helps developers balance efficiency and complexity in re-renders.
keywords: ["Render", "commit", "fiber", "reconciliation"]
category: react
created_at: 2024-11-07 01:06
---

# React Re-rendering에 대한 고찰

React의 경우 re-render에 대해서 많은 글을 쓰게 되는 것 같다. 이 블로그의 [첫번째 글](https://www.pancodev.io/article/react/importance-of-re-rendering-optimization)에서는 무분별한 useMemo의 남용을 경계해야 함을 작성했고, Re-rendering에 관한 가이드를 작성한 해외 아티클을 [번역](https://www.pancodev.io/article/react/react-re-renders-guide-everything-all-at-once)한 글도 작성을 했다. 사실 프론트엔드에서 React라는 도구를 바라볼 때 Tree 설계, 컴포넌트 구조 등과 더불어서 가장 많은 관심을 가지고 있는 부분이기에 더욱 신경이 쓰이게 되는 것 같다. 그러던 중 같이 일하는 개발자 분이 “프론트엔드 개발자가 (re)Render 없애려고 노력하는데, 사실 정말 중요한 건 Commit이 동반되는 랜더링의 최적화에요.” 라고 말을 해주었다. ~~충격, 리랜더링은 일단 다 최적화해야 하는 것이 아닌가?~~ 이에 React Re-rendering이 어떤 과정으로 발생하는지, 실제로 React 내부에서는 어떤 동작들을 수행하는지 확인하고자 한다.

#### React에서의 리랜더링

React에서 리랜더링이 언제 발생하는가를 놓고 보자면, 최초 랜더링을 제외하면 state의 변경에 있다. 컴포넌트에서 할당된 state가 변경이 되거나, 부모의 컴포넌트에서 state가 변경이 되어 부모 컴포넌트의 리랜더링이 발생되고 자식에게 전파되는 경우다. 그런데 모든 리랜더링이 모두 같은 동작으로 이어지지는 않는다. [리엑트에서 리랜더링은 Render와 Commit으로 구분되어 있다.](https://react.dev/learn/render-and-commit)

다양한 이유로 React에서 리랜더링이 발생(trigger)되면 첫 번째로 “**Render**” 단계에 진입한다. 이 Render단계는 초기 랜더링의 경우 `return` 구문에서 반환한 ReactNode에 대하여 [DOM 노드를 생성](https://developer.mozilla.org/ko/docs/Web/API/Document/createElement)하게 된다. 그리고 리랜더링의 경우는 초기 랜더링 이후 어떤 값이 변경이 되었는지 계산한다. 이것이 React에서 말하는 [reconciliation](https://legacy.reactjs.org/docs/reconciliation.html)이다. 여기서 중요한 점은 이 Render 단계에서는 Virtual-DOM을 이용하여 변경사항을 탐색을 할 뿐, 업데이트를 진행하지 않는다는 점이다.

두번째 단계는 “**Commit**”이다. 이 Commit 단계에서는 최초 랜더링의 경우 Render 단계에서 생성한 DOM Node를 [appendChild()](https://developer.mozilla.org/ko/docs/Web/API/Node/appendChild)를 통해 화면에 표시하는 작업을 수행한다. 리랜더링의 경우 랜더링하는 동안 계산된 차이점(= 업데이트 되어야 할 부분)을 적용하여 DOM 노드에 반영하게 된다. 즉 랜더링 결과가 이전과 동일하다면 React는 DOM을 건드리지 않는다는 뜻이다. React의 리랜더링에 필요한 비용을 Render 단계에서 수행하는 reconciliation 연산과 Commit 단계에서 수행하는 DOM update의 합이라고 정의해보자. **만약 reconciliation 연산이 매우 저렴한 가격으로 이루어진다면, 우리는 Commit을 수반하지 않는 리랜더링에 되어서는 최적화를 신경쓰지 않아도 되지 않을까?** 대표적으로는 Context에 속해있다는 이유로 Consumer가 사용하지 않는 value의 업데이트로 인한 리랜더링을 떠올려 볼 수 있을 것이다.

#### Render

위와 같은 가정을 진행하고 많은 공식문서와 아티클을 살펴보았지만 구체적으로 어느 정도의 비용이 소요되며, 어느 정도의 지분이 각 단계에서 차지하고 있음을 알려주는 정보는 찾지 못했다. ~~사실 React Tree의 규모나 컴포넌트의 복잡도에 따라 좌지우지될 수 있기에 당연한 걸지도 모른다.~~ Virtual DOM을 활용하여 빠른 연산을 수행하기에 Render보다 Commit이 더 비싸다는 의견을 찾을 수도 있었고, React에서 diff는 Tree를 순회하기 때문에 일반적으로 Commit보다 더 비싸다는 의견도 찾아볼 수 있었다. 그렇다면 [React 구현체에서 Diff가 어떠한 절차를 통해 진행되는지](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberWorkLoop.js#L2161) 간략하게 살펴보자.

```jsx
// The work loop is an extremely hot path. Tell Closure not to inline it.
/** @noinline */
function workLoopSync() {
  // Perform work without checking if we need to yield between fiber.
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(unitOfWork: Fiber): void {
  /* ... */
  const current = unitOfWork.alternate;

  let next;
  if (enableProfilerTimer && (unitOfWork.mode & ProfileMode) !== NoMode) {
    startProfilerTimer(unitOfWork);
    if (__DEV__) {
      /* ... */
    } else {
      next = beginWork(current, unitOfWork, entangledRenderLanes);
    }
    stopProfilerTimerIfRunningAndRecordDuration(unitOfWork);
  } else {
    if (__DEV__) {
      /* ... */
    } else {
      next = beginWork(current, unitOfWork, entangledRenderLanes);
    }
  }

  /* ... */
  if (next === null) {
    // If this doesn't spawn new work, complete the current work.
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;
  }
}
```

가장 먼저 `ReactFiberWorkLoop.js`에서 tree를 순회하면서 diff 작업을 수행한다. 여기서 호출되는  `performUnitOfWork` 는 [beginWork](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberBeginWork.js#L3844)를 호출하며 fiber 작업을 진행한다. 다음 작업이 없을 때까지 이는 반복되어 다음 작업이 없다면 현재 fiber 노드의 작업을 완료하는 `completeUnitOfWork` 호출하는 것으로 종료된다.

```jsx
function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
): Fiber | null {
  /* ... */

  if (current !== null) {

	  /* ... */

  } else {
    didReceiveUpdate = false;

    if (getIsHydrating() && isForkedChild(workInProgress)) {
      /* ... */
      const slotIndex = workInProgress.index;
      const numberOfForks = getForksAtLevel(workInProgress);
      pushTreeId(workInProgress, numberOfForks, slotIndex);
    }
   /* ... */
  }
```

먼저 beginWork에게 전달되는 `current` 는 trigger 발생 이전의 Fiber Tree에 대한 정보를 담고 있고, `workInProgress` 는 trigger 발생 이후 처리가 필요한 Fiber Tree의 정보를 담고 있다. `renderLanes` 는 React Lane Model의 정보이며 해당 모델은 비트마스크를 통해 랜더링의 우선순위를 정의하고 있다. 여기서 `current`가 null인 경우는 최초 랜더링을 의미한다.

최초 랜더링의 경우 동작을 살펴보자. `getIsHydrating()`는 [ReactFiberHydrationContext](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberHydrationContext.js#L714)에서 연산되는 Boolean 변수 `isHydrating`를 return하고 있다. `isHydrating` 은 hydration이 시작될 때 `true`로 설정되고 hydration 프로세스가 완료되거나 중단될 때 `false`로 설정된다. 즉, 서버사이드 렌더링된 컨텐츠를 클라이언트에서 "hydrate" 하는 과정을 추적하는데 사용되는 변수이다.

`isForkedChild` 함수는 [ReactFiberTreeContext](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberTreeContext.js#L89)에서 선언되어 있으며 현재 작업 중인 Fiber 노드(`workInProgress`)가 fork된 자식인지 확인하는 함수이다. hydration을 제외한다면 최초 랜더링의 경우 `didReceiveUpdate` 값을 `false`로 변경만 하는 것을 확인할 수 있다. `didReceiveUpdate` 는 React의 렌더링 최적화에 중요한 역할을 하는 플래그로 현재 Fiber가 렌더링 과정에서 업데이트를 받았는지 추적하는 역할을 담당한다. 해당 값은 최초 `false`로 정의되어 업데이트 변경점이 발견되면 `true` 가 할당되고, 값이 `false` 일 때 Firer 처리 과정에서 early bail out 하는 케이스를 확인할 수 있다.

```jsx
if (current !== null) {
  const oldProps = current.memoizedProps;
  const newProps = workInProgress.pendingProps;

  if (
    oldProps !== newProps ||
    hasLegacyContextChanged() ||
    (__DEV__ ? workInProgress.type !== current.type : false)
  ) {
    didReceiveUpdate = true;
  } else {
    const hasScheduledUpdateOrContext = checkScheduledUpdateOrContext(
      current,
      renderLanes
    );
    if (
      !hasScheduledUpdateOrContext &&
      (workInProgress.flags & DidCapture) === NoFlags
    ) {
      didReceiveUpdate = false;
      return attemptEarlyBailoutIfNoScheduledUpdate(
        current,
        workInProgress,
        renderLanes
      );
    }
    if ((current.flags & ForceUpdateForLegacySuspense) !== NoFlags) {
      didReceiveUpdate = true;
    } else {
      didReceiveUpdate = false;
    }
  }
} else {
  /* ... */
}
```

이제 `current` 에 값이 있는 케이스이다. `current` 에 값이 있는 경우는 3가지의 항목으로 업데이트 항목이 있는지 계산한다.

1. oldProps !== newProps
2. hasLegacyContextChanged()
   [ReactFirerContext의 hasContextChanged](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberContext.js#L113C10-L113C27) 결과값이다. 해당 로직은 Legacy Context 시스템이 비활성화된 경우 `false` 를 return, 활성화된 경우 context 작업이 수행되었는지를 추적하는 boolean 값을 반환한다.
3. (**DEV** ? workInProgress.type !== current.type : false)
   Dev모드일 경우 workInProgress type과 current의 type을 비교한다.

위 세가지 항목 중 하나의 값이라도 `true` 라면 `didReceiveUpdate` 의 값을 `true`로 할당한다. 그렇지 않다면 변경사항이 없는 것으로 추정한다. 이후 fiber에 예약된 업데이트가 있는지 확인하거나 에러 캡처 플래그의 값을 확인하거나 Legacy Suspense에 대한 처리를 진행한다. 위 과정이 모두 끝마치고 나면 `workInProgress` 의 tag에 따라 컴포넌트의 마운트 혹은 update를 진행한다. 그 과정에서 호출되는 것이 [reconcileChildren](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberBeginWork.js#L334)이다. 이 `reconcileChildren` 은 새로운 컴포넌트의 최초 마운트 작업을 진행하거나 기존 컴포넌트의 업데이트를 담당하게 된다.

```jsx
export function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,
  renderLanes: Lanes
) {
  if (current === null) {
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderLanes
    );
  } else {
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
      renderLanes
    );
  }
}
```

#### Commit

커밋 단계는 Render 단계와 비교하여 간단하다. [**ReactFiberCommitWork**](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberCommitWork.js)와 [**ReactFiberCommitEffects**](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberCommitEffects.js)를 살펴보면 되는데, **ReactFiberCommitEffects**는 **`useEffect`** 혹은 class component의 Life-cycle Hook에 관련된 처리를 담당하기에 **ReactFiberCommitWork**만 살펴보자.

```jsx
export function commitBeforeMutationEffects(
  root: FiberRoot,
  firstChild: Fiber
): boolean {
  focusedInstanceHandle = prepareForCommit(root.containerInfo);

  nextEffect = firstChild;
  commitBeforeMutationEffects_begin();

  // We no longer need to track the active instance fiber
  const shouldFire = shouldFireAfterActiveInstanceBlur;
  shouldFireAfterActiveInstanceBlur = false;
  focusedInstanceHandle = null;

  return shouldFire;
}
```

첫 번째로 DOM 변경 전 준비 작업을 담당하는 `commitBeforeMutationEffects`
이다. `focusedInstanceHandle` 의 경우 현재 DOM에 포커스된 요소를 찾는다. 이후 `nextEffect`를 첫 번째 자식으로 설정하고 `commitBeforeMutationEffects_begin()` 를 호출하는데, 여기선 삭제된 노드나 변경되는 노드의 자식노드에 대한 처리를 담당한다. 마지막으로 포커스 추적 관련 상태를 정리하고 blur 이벤트 발생 여부를 반환하는 것으로 종료된다.

```jsx
export function commitMutationEffects(
  root: FiberRoot,
  finishedWork: Fiber,
  committedLanes: Lanes
) {
  inProgressLanes = committedLanes;
  inProgressRoot = root;

  resetComponentEffectTimers();

  commitMutationEffectsOnFiber(finishedWork, root, committedLanes);

  inProgressLanes = null;
  inProgressRoot = null;
}
```

다음은 실제 DOM을 조작하는 `commitMutationEffects` 이다. 이 단계에서 사용자는 변경사항을 확인할 수 있다. 처음으로 현재 진행 중인 레인과 루트를 전역 변수에 저장한다. 이후 컴포넌트 효과를 초기화하는데 이는 프로파일링에서 사용된다. 이후 [commitMutationEffectsOnFiber](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberCommitWork.js#L1602)를 재귀적으로 호출하는데 여기서 다음과 같은 동작이 수행된다.

- DOM 노드 삽입/삭제/업데이트
- 이전 ref 값들을 null로 설정
- Life-cycle method 호출
- 이벤트 핸들러 설정

```jsx
export function commitLayoutEffects(
  finishedWork: Fiber,
  root: FiberRoot,
  committedLanes: Lanes
): void {
  inProgressLanes = committedLanes;
  inProgressRoot = root;

  resetComponentEffectTimers();

  const current = finishedWork.alternate;
  commitLayoutEffectOnFiber(root, current, finishedWork, committedLanes);

  inProgressLanes = null;
  inProgressRoot = null;
}
```

마지막으로 DOM 변경 후 효과 처리를 담당하는 `commitLayoutEffects` 이다. 여기서는 레이아웃 효과를 담당하는 [commitLayoutEffectOnFiber](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberCommitWork.js#L387)를 호출하는데 다음과 같은 동작이 수행된다.

- `useLayoutEffect` 훅의 실행
- 클래스 컴포넌트의 `componentDidMount`/`componentDidUpdate` 호출
- ref 값 할당
- focus, selection 등 DOM 관련 부가 작업

#### 결론?

블로그를 운영하면서 이번 아티클에 가장 많은 시간을 쏟았고, 지금처럼 찝찝할 수 없다. 최초 가졌던 기대는 “React에서 Commit을 동반하지 않는 Render는 최적화 대상에서 제외해도 되는가?”에 가까웠다. React에서 리랜더링 과정이 Render와 Commit으로 구분되어 있다는 것을 알기만 할 뿐, 해당 과정에서 어느정도의 자원이 소모되는지 몰랐기에 이 부분에 대한 지식을 채우고자 함도 있었다.

React의 Reconciliation에 대해서 diff 연산과 commit 작업의 일부만 살펴보았고, [(Context API의 경우 diff 연산을 수행하는 로직이 따로 있다.)](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberBeginWork.js#L3336) 각 과정에서 React가 어떻게 동작하는지를 배울 수 있었으나 처음 느꼈던 의문을 해결하지 못하였다. 결국 Render가 비싼가. Commit이 비싼가. ~~어플리케이션의 규모와 상황에 따라 다르다고 생각하고 넘어갈 수 밖에 없을 것인가.~~

진부한 결론이지만 어느 쪽의 주장이든 일리가 있다고 생각한다. 기본적으로 DOM을 직접적으로 건드리지 않는 Render가 유리하다고 생각할 수 있다. 하지만 그렇다고 Commit이 발생하지 않는 리랜더링을 무시하기에 규모가 큰 어플리케이션에서 React Tree를 모두 순회하는 것은 충분히 부담스럽게 느껴진다. 조금 더 구체적인 예시를 들어서 Context API에서 사용하지 않는 `value` 의 업데이트로 인한 Consumer의 리랜더링을 막기 위해 도입하는 여러 로직도 충분히 타당하고, 그 로직이 들어감으로 인해 프로젝트 구조가 복잡해짐을 경계하는 것도 납득할 수 있다. 결국 어떤 선택을 내리든 스스로가 납득할 수 있고, 같이 일하는 동료를 설득할 수 있는 근거가 동반되어야 한다고 생각한다. 이번 아티클에서 그 근거의 편린이라도 제공이 되었길.
