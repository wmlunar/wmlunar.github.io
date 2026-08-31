(function () {
    'use strict';

    var metrics = ['site_pv', 'site_uv'];
    var callbackName = 'BusuanziCallback_' + Date.now().toString(36) + Math.random().toString(36).slice(2);
    var request = document.createElement('script');
    var timeoutId;

    function elementsFor(metric) {
        var container = document.getElementById('busuanzi_container_' + metric);
        return {
            container: container,
            value: document.getElementById('busuanzi_value_' + metric),
            base: Number(container && container.getAttribute('data-base')) || 0
        };
    }

    function showFallback() {
        metrics.forEach(function (metric) {
            var elements = elementsFor(metric);
            if (!elements.value || !elements.container) return;
            elements.value.textContent = '--';
            elements.container.style.display = 'inline';
        });
    }

    function cleanup() {
        window.clearTimeout(timeoutId);
        if (request.parentNode) request.parentNode.removeChild(request);
        try {
            delete window[callbackName];
        } catch (error) {
            window[callbackName] = undefined;
        }
    }

    function start() {
        var hasMetric = metrics.some(function (metric) {
            return Boolean(elementsFor(metric).value);
        });
        if (!hasMetric) return;

        window[callbackName] = function (data) {
            metrics.forEach(function (metric) {
                var elements = elementsFor(metric);
                var value = Number(data && data[metric]);
                if (!elements.value || !elements.container) return;
                elements.value.textContent = Number.isFinite(value) ? (elements.base + value).toLocaleString('zh-CN') : '--';
                elements.container.style.display = 'inline';
            });
            cleanup();
        };

        request.async = true;
        request.referrerPolicy = 'strict-origin-when-cross-origin';
        request.src = 'https://busuanzi.ibruce.info/busuanzi?jsonpCallback=' + encodeURIComponent(callbackName);
        request.onerror = function () {
            showFallback();
            cleanup();
        };
        timeoutId = window.setTimeout(function () {
            showFallback();
            cleanup();
        }, 5000);
        document.head.appendChild(request);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
}());
