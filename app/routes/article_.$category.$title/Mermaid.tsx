import { useEffect } from "react";

type Props = {
  // 아티클이 바뀔 때(네비게이션) 다시 렌더링하기 위한 key
  contentKey: string;
};

// contentHtml 안의 `<pre><code class="block language-mermaid">` 블록을
// 클라이언트에서만 mermaid SVG로 치환한다.
function Mermaid({ contentKey }: Props) {
  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      const blocks = Array.from(
        document.querySelectorAll<HTMLElement>(
          "article pre code.language-mermaid",
        ),
      );
      if (blocks.length === 0) {
        return;
      }

      const { default: mermaid } = await import("mermaid");
      // 블로그가 다크 테마(#2c2c2c)라 기본 라이트 테마는 글자/선이 묻힌다.
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "dark",
        themeVariables: {
          background: "#2c2c2c",
          textColor: "#f5f5f5",
          lineColor: "#c9c9c9",
        },
      });

      for (let index = 0; index < blocks.length; index++) {
        if (cancelled) {
          return;
        }

        const code = blocks[index];
        const pre = code.closest("pre");
        const source = code.textContent ?? "";
        if (!pre || source.trim() === "") {
          continue;
        }

        try {
          const { svg } = await mermaid.render(
            `mermaid-${contentKey}-${index}`,
            source,
          );
          if (cancelled) {
            return;
          }

          const wrapper = document.createElement("div");
          wrapper.className = "mermaid-diagram";
          wrapper.innerHTML = svg;
          pre.replaceWith(wrapper);
        } catch {
          // 렌더에 실패하면 원본 코드블록을 그대로 둔다.
        }
      }
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [contentKey]);

  return null;
}

export default Mermaid;
