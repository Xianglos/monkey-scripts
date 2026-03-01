// ==UserScript==
// @name         微博内容黑名单过滤
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  根据黑名单关键词删除微博特定的 div 及其紧随的 footer
// @author       You
// @match        https://weibo.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // ================= 配置区域 =================
    // 在这里添加你需要屏蔽的关键词
    const blacklist = [
        "广告",
        "推销",
        "兼职",
        "博彩",
        "AABB" // 你可以删除这一行，添加你自己的词
    ];
    // ===========================================

    // 目标 div 的选择器 (注意：微博的类名可能会随版本更新而变化，如果失效请检查此类名)
    const TARGET_SELECTOR = 'div._body_m3n8j_63';

    /**
     * 检查文本是否包含黑名单词汇
     * @param {string} text
     * @returns {boolean}
     */
    function isBlacklisted(text) {
        if (!text) return false;
        return blacklist.some(word => text.includes(word));
    }

    /**
     * 处理单个目标元素：检查并删除
     * @param {HTMLElement} div
     */
    function processTargetDiv(div) {
        // 确保元素还在文档中
        if (!document.body.contains(div)) return;

        // 获取文本内容 (innerText 能获取到用户可见的文本)
        const text = div.innerText;

        if (isBlacklisted(text)) {
            console.log('[微博过滤] 发现黑名单内容，正在删除...', text.substring(0, 20) + '...');

            // 1. 查找紧挨着它的下一个兄弟元素
            const nextSibling = div.nextElementSibling;

            // 2. 如果是 footer 标签，则删除它
            if (nextSibling && nextSibling.tagName === 'FOOTER') {
                nextSibling.remove();
            }

            // 3. 删除目标 div 本身
            div.remove();
        }
    }

    /**
     * 扫描并处理节点
     * @param {Node} node
     */
    function scanNode(node) {
        if (!(node instanceof Element)) return;

        // 情况 1: 节点本身就是目标 div
        if (node.matches(TARGET_SELECTOR)) {
            processTargetDiv(node);
        }

        // 情况 2: 节点内部包含目标 div (例如新加载了一整块 feed 区域)
        const targets = node.querySelectorAll(TARGET_SELECTOR);
        targets.forEach(processTargetDiv);
    }

    // ================= 初始化运行 =================

    // 1. 页面加载完成后，先处理一次现有的内容
    // 使用 setTimeout 确保 DOM 完全渲染
    setTimeout(() => {
        scanNode(document.body);
    }, 1000);

    // 2. 建立观察器，监听后续动态加载的内容
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    scanNode(node);
                });
            }
        }
    });

    // 开始观察 body 的变化
    observer.observe(document.body, {
        childList: true,
        subtree: true // 必须为 true，因为新内容通常嵌套在深层结构中
    });

    console.log('[微博过滤] 脚本已启动，黑名单长度:', blacklist.length);

})();
