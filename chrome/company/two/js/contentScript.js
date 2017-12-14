/**
 * Created by peteryan on 2017/12/13.
 */
msg = {
    "type": "page-save",
    "currentUrl": window.location.href,
    "currentDomain": document.domain,
    "currentHtml": document.documentElement.innerHTML,
}
chrome.runtime.sendMessage(msg);