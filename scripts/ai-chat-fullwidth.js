// ==UserScript==
// @name         人工智能网页宽屏拉满（支持DeepSeek、豆包、智谱清言）
// @namespace    http://tampermonkey.net/
// @version      2026-04-14
// @description  在宽屏显示器，或者高分辨率显示器上，网页版左右留白非常丑陋。本脚本旨在删除这些丑陋的留白
// @author       Xianglos
// @match        https://www.doubao.com/chat*
// @match        https://chat.deepseek.com/*
// @match        https://chatglm.cn/main*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    function douBaoFix() {
        // 使用更精确的选择器
        document.querySelectorAll('div.my-0.w-full.mx-auto.max-w-\\(--content-max-width\\).has-\\[\\.side-by-side-messages\\]\\:mx-0.has-\\[\\.side-by-side-messages\\]\\:max-w-full').forEach(element => {
            element.style.maxWidth = '100%';
        });
        document.querySelectorAll('div.w-full.max-w-\\[var\\(--content-max-width\\)\\].relative.mx-auto.rounded-dbx-4xl').forEach(element => {
            element.style.maxWidth = '100%';
        });
        document.querySelectorAll('div.relative.flex.flex-col.w-full.min-h-\\(--input-guidance-input-container-min-height\\).max-h-\\(--input-guidance-input-container-max-height\\).max-w-\\(--content-max-width\\)').forEach(element => {
            element.style.maxWidth = '100%';
        });
    }

    function deepSeekFix() {
        // 只处理两个新的元素类名
        document.querySelectorAll('.ds-virtual-list-items, ._871cbca').forEach(element => {
            element.style.paddingLeft = '0px';
            element.style.paddingRight = '0px';
        });
    }

    // 用于标记样式是否已注入，避免重复注入
    let glmStyleInjected = false;

    // ========== 新增：智谱清言宽屏修复 ==========
    function chatGLMFix() {
        // 【针对动态加载的优化】使用注入 <style> 的方式处理 markdown-body
        // 这样无论网页后续动态生成多少个该元素，都会自动生效，且不会因为流式输出频繁触发 DOM 遍历导致卡顿
        if (!glmStyleInjected) {
            const style = document.createElement('style');
            style.textContent = 'div[class*="markdown-body"] { max-width: 100% !important; }';
            document.head.appendChild(style);
            glmStyleInjected = true;
        }

        // 以下为只出现一次或少数几次的容器元素，保留内联样式修改即可
        // 1. class 包含 component-box-new 的 div，max-width 改为 100%
        document.querySelectorAll('div[class*="component-box-new"]').forEach(element => {
            element.style.maxWidth = '100%';
        });

        // 2. class 包含 conversation-container 的 div，max-width 改为 100%
        document.querySelectorAll('div[class*="conversation-container"]').forEach(element => {
            element.style.maxWidth = '100%';
        });

        // 3. class 包含 conversation-bottom 的 div，max-width 改为 100%
        document.querySelectorAll('div[class*="conversation-bottom"]').forEach(element => {
            element.style.maxWidth = '100%';
        });

        // 4. class 完全等于 "item conversation-item" 的 div，删除 max-width 并设为 100%
        document.querySelectorAll('div[class="item conversation-item"]').forEach(element => {
            element.style.removeProperty('max-width');
            element.style.setProperty('max-width', '100%', 'important');
        });
    }

    function handleMutation() {
        if (window.location.host.includes('doubao.com')) {
            douBaoFix();
        } else if (window.location.host.includes('deepseek.com')) {
            deepSeekFix();
        } else if (window.location.host.includes('chatglm.cn')) {
            chatGLMFix();
        }
    }

    // ========== 以下原有代码完全不变 ==========

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            handleMutation();
            const observer = new MutationObserver(handleMutation);
            observer.observe(document.body, { childList: true, subtree: true });
            let currentURL = window.location.href;
            setInterval(() => {
                if (window.location.href !== currentURL) {
                    currentURL = window.location.href;
                    setTimeout(handleMutation, 1000);
                }
            }, 500);
        });
    } else {
        handleMutation();
        const observer = new MutationObserver(handleMutation);
        observer.observe(document.body, { childList: true, subtree: true });
        let currentURL = window.location.href;
        setInterval(() => {
            if (window.location.href !== currentURL) {
                currentURL = window.location.href;
                setTimeout(handleMutation, 1000);
            }
        }, 500);
    }
})();
