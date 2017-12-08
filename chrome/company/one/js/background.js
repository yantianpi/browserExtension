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
    if (localStorage.domainListString) {
        settingData.domainArray = localStorage.domainListString.toLowerCase().split(',') || [];
    } else {
        settingData.domainArray = [];
    }
    settingData.saveWay = localStorage.saveWay || 'local';
    settingData.status = localStorage.status || 'start';
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

var settingData = {};
settingData.error = "init...";
initSetting();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    type = message.type || '';
    console.log("chrome.runtime.onMessage.addListener " + type);
    switch (type) {
        case "setting-save":
            localStorage.saveWay = message.saveWay;
            localStorage.status = message.status;
            localStorage.domainListString = message.domainArray.join(",").toLowerCase();
            initSetting();
            break;
        case "scan-background-value":
            console.log(settingData);
            break;
        default:
    }
});

// https://developer.chrome.com/extensions/tabs#event-onUpdated
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    console.log("chrome.tabs.onUpdated.addListener " + tab.url);
    var tmpSetting = {};
    tmpSetting.saveWay = localStorage.saveWay || 'local';
    tmpSetting.status = localStorage.status || 'start';
    if (localStorage.domainListString) {
        tmpSetting.domainArray = localStorage.domainListString.toLowerCase().split(',') || [];
    } else {
        tmpSetting.domainArray = [];
    }
    if (tmpSetting.status == 'start') {
        var tmpDomain = getDomainFromUrl(tab.url).toLowerCase();
        if (tmpSetting.domainArray.indexOf(tmpDomain) != -1) {
            console.log("download: " + tab.url);
            fileName = "D://" + tmpDomain + "/" + currentDate('ymd') + "/" + md5(tab.url) + ".html";
            console.log(fileName);
            // https://developer.chrome.com/extensions/downloads#method-download
            chrome.downloads.download({
                url: tab.url,
                filename: fileName,
                conflictAction: 'overwrite',
                saveAs: false
            }, function () {});
        }
    }
});