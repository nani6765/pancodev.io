---
title: 느지막한 퇴근 길
description: 요즘 어느순간부터 내 할일이 끝났다고 퇴근해버리는 하루하루가 반복되었던 것 같다.
created_at: 2024-12-01 16:10
---

이번 주 금요일 시계를 돌아보니 오후 9시, 평소의 퇴근 시간보다 3시간이 훌쩍 지나있었다. 딱히 일이 많아서 야근을 한 건 아니다. 이번 주까지 끝내기로 했던 업무는 여차저차 업무 시간에 모두 끝낼 수 있었다. 이번 주는 오랜만에 바빴던 일주일이었다. 정신없이 기능을 개발하다 보니 시간이 유독 빠르게 지나간 기분, 역시 일이 없는 것보다는 일이 많은 게 적성에 맞는 것 같다. 아무튼 퇴근하려다 사내에 참여하지 않은 다른 프로젝트가 눈에 밟혀 잠깐 코드를 읽어보았다. LLM 모델을 통해 챗봇을 개발하는 프로젝트였는데 프론트엔드 단은 next와 [ai](https://sdk.vercel.ai/getting-started)로 구성되어 있었다.

이전에 해당 프로젝트를 배포할 때 배포 스크립트만 잠깐 본 기억이 있는데, 지금은 어느 정도 궤도에 올라 사내에 먼저 오픈되어 있었다. 해당 프로젝트는 앱에서 웹앱으로 next를 불러와, 컨텍스트를 주입하여 특정 목적을 위한 LLM 챗봇을 구성하는 게 주요한 서비스였다. 이 과정에서 [assistant-ui](https://www.assistant-ui.com/)로 챗봇 UI를 구성하고, [nlux/langchain-react](https://www.npmjs.com/package/@nlux/langchain-react)를 통해 컨텍스트의 전처리 및 후처리를 진행하였는데 해당 과정에서 원하는 대로 커스텀하기 난관에 부딪혀 있었다. ~~결국 내가 한 번 봐야 할 것 같기에, 미리 본다는 느낌으로~~ 아직 자료가 많은 것도 아니고, `useVercelUseChatRuntime`를 wrapping한 `Thread`가 원하는 대로 커스텀을 지원해 주지 않았기에 오랜만에 라이브러리를 뜯어보는 시간을 가졌다.

모두가 퇴근하고 적막이 가득 채운 사무실의 환경 탓인지, 오랜만에 재밌는 장난감을 발견한 탓인지 시간이 가는 줄 모르고 코드를 살피고 테스트를 해보았고, 원하는 방향성을 위한 설계 정도는 끝마칠 수 있었다. 돌이켜보면 예전에는 업무가 다 끝나면 사내에 프로젝트를 기웃기웃하는 시간이 참 많았고, 그 때문에 야근을 한 적도 한두 번이 아니었는데. **요즘 어느 순간부터 내 할 일이 끝났다고 퇴근해 버리는 하루하루가 반복되었던 것 같다.** 퇴근 시간에는 항상 지하철에 사람이 붐벼서 회사에서부터 집까지 끼여서 움직였다. 이 시간은 아직 유흥을 즐기는 사람들이 집으로 돌아가기 이전이라 그런지 지하철은 쾌적했고, 오랜만에 자리에 앉아서 한가롭게 집에 갈 수 있었다. 예전에는 알고 있었지만 요즘은 잊고 있었던 소중한 기억이다.
