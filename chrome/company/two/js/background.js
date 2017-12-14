/**
 * Created by peteryan on 2017/12/6.
 */

function getDomainFromUrl(url){
    var host = "null";
    if(typeof url == "undefined" || null == url)
        url = window.location.href;
    var regex = /.*\:\/\/([^\/]*).*/;
    var match = url.match(regex);
    if(typeof match != "undefined" && null != match)
        host = match[1];
    return host;
}

function initSetting() {
    console.log('background initSetting data:');
    if (localStorage.shareDomainString) {
        settingData.shareDomainArray = localStorage.shareDomainString.toLowerCase().split(',') || [];
    } else {
        settingData.shareDomainArray = [];
    }
    if (localStorage.exclusiveDomainString) {
        settingData.exclusiveDomainArray = localStorage.exclusiveDomainString.toLowerCase().split(',') || [];
    } else {
        settingData.exclusiveDomainArray = [];
    }
    settingData.serverDomain = localStorage.serverDomain || '';
    settingData.status = localStorage.status || 'start';
    settingData.userName = localStorage.userName || '';
    settingData.error = "";
    console.log(settingData);
}

function currentDate(type) {
    var today=new Date();
    var year = today.getFullYear();
    var month = today.getMonth();
    var day = today.getDate();
    var hour = today.getHours();
    var minute =today.getMinutes();
    month = (month >= 10) ? month : ('0' + month);
    day = (day >= 10) ? day : ('0' + day);
    hour = (hour >= 10) ? hour : ('0' + hour);
    minute = (minute >= 10) ? minute : ('0' + minute);
    var result = '';
    switch(type) {
        case "ymd":
            result = '' + year + month + day;
            break;
        case "ymdhm":
            result = '' + year + month + day + hour + minute;
            break;
        default:
    }
    return result;
}

function getDownloadIds() {
    var ids = [];
    try {
        ids = JSON.parse(localStorage.downloadIdsString);
    } catch (e) {
        localStorage.downloadIdsString = JSON.stringify(ids);
    }
    return ids;
}
function setDownloadIds(ids) {
    localStorage.downloadIdsString = JSON.stringify(ids);
}

function uploadServer(data) {
    console.info('uploading...');
    var pageUrl = data.pageUrl || '';
    var content = data.content || '';
    var pageDomain = data.pageDomain || '';
    var isShare = data.isShare;
    var userName = settingData.userName || '';
    var serverDomain = settingData.serverDomain || '';
    if (!userName) {
        var msg = {
            "type": "basic",
            "iconUrl": "icon.png",
            "title": "save error",
            "message": "don't set UserName",
            "requireInteraction": true,
        };
        chrome.notifications.create(msg);
        return;
    }
    var form = new FormData();
    form.append("action", "savePage");
    form.append("userName", userName);
    form.append("isShare", isShare);
    form.append("pageUrl", pageUrl);
    form.append("pageDomain", pageDomain);
    form.append("grabTime", currentDate("ymdhm"));
    form.append("content", content);
    console.log("save page:" + pageUrl);
    $.ajax({
        url:"http://" + serverDomain + "/scanDeal.php",
        type:"post",
        data:form,
        processData:false,
        contentType:false,
        success:function(msg){
            console.log("success..." + msg);
        },
        error:function () {
            var msg = {
                "type": "basic",
                "iconUrl": "icon.png",
                "title": "save error",
                "message": "server url:" + serverDomain,
                "requireInteraction": true,
            };
            chrome.notifications.create(msg);
        }
    });
}

var settingData = {};
settingData.error = "init...";
initSetting();

// https://developer.chrome.com/extensions/runtime#event-onMessage
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    // console.log(message);
    type = message.type || '';
    console.log("chrome.runtime.onMessage.addListener " + type);
    switch (type) {
        case "setting-save":
            console.log("setting-save");
            localStorage.serverDomain = message.serverDomain;
            localStorage.status = message.status;
            localStorage.userName = message.userName;
            localStorage.shareDomainString = message.shareDomainArray.join(",").toLowerCase();
            localStorage.exclusiveDomainString = message.exclusiveDomainArray.join(",").toLowerCase();
            initSetting();
            break;
        case "scan-background-value":
            console.log(settingData);
            break;
        case "page-save":
            console.log('page-save');
            pageSave(message);
            break;
        default:
    }
});

function pageSave(msg) {
    if (!settingData.error) {
        var status = settingData.status || "start";
        var shareDomainArray = settingData.shareDomainArray || [];
        var exclusiveDomainArray = settingData.exclusiveDomainArray || [];
        if (status == "start") {
            var tmpUrl = msg.currentUrl || '';
            var tmpDomain = msg.currentDomain || '';
            var tmpHtml = msg.currentHtml || '';
            var tmpShare = -1;
            if (shareDomainArray.indexOf(tmpDomain) != -1) {
                tmpShare = 1;
            } else if (exclusiveDomainArray.indexOf(tmpDomain) != -1) {
                tmpShare = 0;
            }
            if (tmpShare != -1) {
                var data = {
                    "pageUrl": tmpUrl,
                    "pageDomain": tmpDomain,
                    "content": tmpHtml,
                    'isShare': tmpShare,
                };
                uploadServer(data);
            }
        }
    }
}