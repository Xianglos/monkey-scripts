// ==UserScript==
// @name         人工智能网页宽屏拉满（支持DeepSeek、豆包）
// @namespace    http://tampermonkey.net/
// @version      2026-03-12
// @description  在宽屏显示器，或者高分辨率显示器上，网页版左右留白非常丑陋。本脚本旨在删除这些丑陋的留白
// @author       Xianglos
// @match        https://www.doubao.com/chat*
// @match        https://chat.deepseek.com/*
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

    function handleMutation() {
        if (window.location.host.includes('doubao.com')) {
            douBaoFix();
        } else if (window.location.host.includes('deepseek.com')) {
            deepSeekFix();
        }
    }

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
