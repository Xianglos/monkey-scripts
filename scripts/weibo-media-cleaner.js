// ==UserScript==
// @name         删除无意义的配图和视频
// @namespace    http://tampermonkey.net/
// @version      2026-03-28
// @description  针对特定用户删除视频和图片
// @author       Xianglos
// @match        https://weibo.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // 需要屏蔽视频和图片的用户列表
    const targetUsers = ["新华社", "CCTV国际时讯"];

    // 目标 div 的选择器数组 (支持多个选择器)
    const TARGET_SELECTORS = [
        'div._body_m3n8j_63',
        'div.card-wrap',
        'vue-recycle-scroller__item-view'
    ];

    // 将所有选择器组合成一个字符串，用于 querySelectorAll
    const COMBINED_SELECTOR = TARGET_SELECTORS.join(', ');

    /**
     * 检查是否为目标用户（新华社或CCTV国际时讯）
     * @param {HTMLElement} div
     * @returns {boolean}
     */
    function isTargetUser(div) {
        // 查找用户名的span元素
        const userSpan = div.querySelector('span[title]');
        if (!userSpan) return false;

        const username = userSpan.getAttribute('title');
        return targetUsers.includes(username);
    }

    /**
     * 为目标用户删除特定的视频和图片div
     * @param {HTMLElement} div
     */
    function removeVideoAndPictureForTargetUser(div) {
        if (!isTargetUser(div)) return;

        // 1. 删除class以"_videoBox"开头的所有div
        const videoBoxSelectors = [
            'div[class^="_videoBox"]',
            'div[class*=" _videoBox"]'
        ];

        videoBoxSelectors.forEach(selector => {
            const videoBoxes = div.querySelectorAll(selector);
            videoBoxes.forEach(videoBox => {
                console.log('[微博过滤] 删除视频div:', videoBox.className);
                videoBox.remove();
            });
        });

        // 2. 删除class为"picture"的div（完全匹配）
        // 注意：只删除class恰好为"picture"的div，不包括class为"woo-picture-main"等
        const pictureDivs = div.querySelectorAll('div.picture');
        pictureDivs.forEach(pictureDiv => {
            // 检查是否完全匹配"picture"类名
            const classList = pictureDiv.className.split(' ');
            if (classList.includes('picture')) {
                console.log('[微博过滤] 删除图片div:', pictureDiv.className);
                pictureDiv.remove();
            }
        });
    }

    /**
     * 处理单个目标元素：检查并删除
     * @param {HTMLElement} div
     */
    function processTargetDiv(div) {
        // 确保元素还在文档中
        if (!document.body.contains(div)) return;

        // 首先，如果是目标用户（新华社或CCTV国际时讯），删除特定的视频和图片div
        removeVideoAndPictureForTargetUser(div);
    }

    /**
     * 检查节点是否匹配任一目标选择器
     * @param {Element} node
     * @returns {boolean}
     */
    function matchesAnySelector(node) {
        return TARGET_SELECTORS.some(selector => node.matches(selector));
    }

    /**
     * 扫描并处理节点
     * @param {Node} node
     */
    function scanNode(node) {
        if (!(node instanceof Element)) return;

        // 情况 1: 节点本身就是目标 div
        if (matchesAnySelector(node)) {
            processTargetDiv(node);
        }

        // 情况 2: 节点内部包含目标 div (例如新加载了一整块 feed 区域)
        const targets = node.querySelectorAll(COMBINED_SELECTOR);
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

    console.log('[微博过滤] 目标用户:', targetUsers);

})();
