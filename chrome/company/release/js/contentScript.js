/**
 * Created by peteryan on 2017/12/13.
 */
    msg = {
        "type": "page-save",
        "currentUrl": window.location.href,
        "currentHost": window.location.hostname,
        "currentHtml": document.documentElement.innerHTML,
    }
    chrome.runtime.sendMessage(msg);