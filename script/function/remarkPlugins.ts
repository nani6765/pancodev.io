// @see https://www.npmjs.com/package/unist-util-visit#visittree-test-visitor-reverse
// @see https://unifiedjs.com/learn/guide/create-a-rehype-plugin/
import { visit } from "unist-util-visit";
import { h } from "hastscript";
import classNames from "classnames";

import type { Root, ElementContent, Text } from "hast";

type RemarkCalloutOptions = {
  prefix?: string;
  className?: string;
  hasEmoji?: boolean;
  emoji?: string;
};

export function remarkCallout(options: RemarkCalloutOptions = {}) {
  const {
    prefix = "[!note]",
    className = "callout",
    hasEmoji = true,
    emoji = "💡",
  } = options;

  return function (tree: Root) {
    const isCalloutElement = (element: ElementContent) =>
      element && element.type === "text" && element.value.startsWith(prefix);

    const makeNewClassName = (originClassName: string) =>
      classNames(originClassName, className, { hasEmoji });

    const emojiElement = h("span.emoji", [emoji]);
    const makeCalloutContentElement = (parentChildren: ElementContent[]) =>
      h("p", [
        ...parentChildren.map((child) => {
          if (child.type === "text") {
            return {
              ...child,
              value: child.value.replace(/\[break\]/g, "\n"),
            };
          }
          return child;
        }),
      ]);

    visit(tree, "element", function (node) {
      if (isCalloutElement(node.children[0])) {
        const firstChild = node.children[0] as Text;
        firstChild.value = firstChild.value.replace(prefix, "");
        const originClassName = node.properties["class"];

        node.tagName = hasEmoji ? "div" : "p";
        node.properties = {
          ...node.properties,
          class: makeNewClassName(String(originClassName ?? "")),
        };

        if (hasEmoji) {
          node.children = [
            emojiElement,
            makeCalloutContentElement(node.children),
          ];
        } else {
          node.children = [makeCalloutContentElement(node.children)];
        }
      }
    });
  };
}
