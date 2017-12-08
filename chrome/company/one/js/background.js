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
    var scanUrl = data.scanUrl | '';
    var filePath = data.filePath | '';
    var saveWay = settingData.saveWay | '';
    var serverUrl = settingData.serverUrl | '';
    var userName = settingData.userName | '';
    //todo, to be continue, form
    return;
}

var settingData = {};
settingData.error = "init...";
initSetting();

// https://developer.chrome.com/extensions/runtime#event-onMessage
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
            // console.log("download: " + tab.url);
            var tmpdateYMD = currentDate('ymd');
            var tmpdateYMDHM = currentDate('ymdhm');
            var fileName = tmpDomain + "/" + tmpdateYMD + "/" + tmpDomain + "_" + tmpdateYMDHM + "_" + md5(tab.url) + ".html";
            // https://developer.chrome.com/extensions/downloads#method-download
            chrome.downloads.download({
                url: tab.url,
                filename: fileName,
                conflictAction: 'overwrite',
                saveAs: false
            }, function (downloadId) {
                if (downloadId == undefined) {
                    console.warn('download error, ' + chrome.runtime.lastError.message);
                } else {
                    var ids = getDownloadIds();
                    if (ids.indexOf(downloadId) >= 0) {
                        //
                    } else {
                        ids.push(downloadId);
                    }
                    setDownloadIds(ids);
                }
            });
        }
    }
});

// https://developer.chrome.com/extensions/downloads#event-onChanged
chrome.downloads.onChanged.addListener(function(delta) {
    console.log("chrome.downloads.onChanged.addListener");
    return;
    if (!delta.state || (delta.state.current != 'complete')) {
        return;
    } else {
        var ids = getDownloadIds();
        if (ids.indexOf(delta.id) < 0) {
            return;
        } else {
            ids.splice(ids.indexOf(delta.id), 1);
            setDownloadIds(ids);
            chrome.downloads.search({'id':delta.id}, function (results) {
                results.forEach(function (item,index,list) {
                    // console.log(item);
                    var filePath = item.filename;
                    var scanUrl = item.url;
                    if (settingData.saveWay == 'server') { // upload server
                        var data = {
                            'scanUrl': url,
                            'filePath': filePath,
                        };
                        uploadServer(data);
                    }
                    //remove file
                    // chrome.downloads.removeFile(item.id, function () {});
                });
            });
        }
    }
});