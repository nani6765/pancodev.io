// @see https://www.npmjs.com/package/unist-util-visit#visittree-test-visitor-reverse
// @see https://unifiedjs.com/learn/guide/create-a-rehype-plugin/
import { visit } from "unist-util-visit";
import classNames from "classnames";

import type { Root, ElementContent, Text } from "hast";

type RemarkCalloutOptions = {
  prefixTrigger?: string;
  calloutClassName?: string;
  hasEmoji?: boolean;
  emoji?: string;
};

export function remarkCallout(options: RemarkCalloutOptions = {}) {
  const {
    prefixTrigger = "[!note]",
    calloutClassName = "callout",
    hasEmoji = true,
    emoji = "💡",
  } = options;

  return function (tree: Root) {
    const isCalloutElement = (element: ElementContent) =>
      element &&
      element.type === "text" &&
      element.value.startsWith(prefixTrigger);

    const makeNewClassName = (originClassName: string) =>
      classNames(originClassName, calloutClassName, { hasEmoji });

    const emojiElement: ElementContent = {
      type: "element",
      tagName: "span",
      properties: {
        class: "emoji",
      },
      children: [{ type: "text", value: emoji }],
    };

    const makeCalloutContentElement = (parentChildren: ElementContent[]) => {
      const calloutContent: ElementContent = {
        type: "element",
        tagName: "p",
        children: [...parentChildren],
      };
      return calloutContent;
    };

    visit(tree, "element", function (node) {
      if (isCalloutElement(node.children[0])) {
        const firstChild = node.children[0] as Text;
        firstChild.value = firstChild.value.replace(prefixTrigger, "");
        const originClassName = node.properties["class"];

        node.tagName = hasEmoji ? "div" : "p";
        node.properties = {
          ...node.properties,
          class: makeNewClassName(String(originClassName)),
        };

        if (hasEmoji) {
          node.children = [
            emojiElement,
            makeCalloutContentElement(node.children),
          ];
        }
      }
    });
  };
}
