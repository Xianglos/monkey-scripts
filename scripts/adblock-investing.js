// ==UserScript==
// @name         移除 Investing.com 广告拦截提示
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  自动删除 Investing.com 的广告拦截提示弹窗
// @author       You
// @match        https://*.investing.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // 定义要检测的关键文本
    const targetText = "您使用了广告拦截工具";

    // 创建 MutationObserver 监听 DOM 变化（应对动态加载）
    const observer = new MutationObserver(() => {
        removeAdBlockPopup();
    });

    // 初始执行一次
    removeAdBlockPopup();

    // 开始监听整个 body 的子节点变化
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    function removeAdBlockPopup() {
        // 查找包含目标文本的 div
        const elements = document.querySelectorAll('div');
        for (const el of elements) {
            if (el.textContent.trim().startsWith(targetText)) {
                // 找到后，向上找到最外层的容器（通常是直接子级或父级）
                let container = el.closest('div[class]'); // 尝试找带 class 的最近 div
                if (!container) container = el.parentElement;

                // 如果找到了容器且存在，就移除
                if (container && container.parentNode) {
                    console.log('[Tampermonkey] 已移除广告拦截提示');
                    container.remove();
                    break;
                }
            }
        }
    }
})();
