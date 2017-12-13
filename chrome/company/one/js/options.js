/**
 * Created by peteryan on 2017/12/6.
 */
function jqcheck(name){ //jquery获取复选框值
    var chkValue =[];
    if (name != "") {
        $('input[name="' + name +'"]:checked').each(function(){
            chkValue.push($(this).val().toLowerCase());
        });
    } else {
        console.log("checkbox " + name + " is null");
    }

    return chkValue;
}

function isArrayFn(value){
    if (typeof Array.isArray === "function") {
        return Array.isArray(value);
    }else{
        return Object.prototype.toString.call(value) === "[object Array]";
    }
}

function loadSetting() {
    console.log("js options loadSetting data:");
    chrome.runtime.getBackgroundPage(function (backgroundPage) {
        data = backgroundPage.settingData;
        // console.log(data);
        // console.log(data.saveWay);
        // console.log(data.status);
        // console.log(data.domainArray);
        if(data.error){
            $("#contentError").html(data.error);
            $("#contentForm").hide();
        }else{
            $("#contentDomainList").html('');
            $("#contentError").hide();
            $("#inputUserName").val(data.userName);
            $("#selectSaveWay").val(data.saveWay);
            $("#selectStatus").val(data.status);
            domainArray = data.domainArray || [];
            if (isArrayFn(domainArray)) {
                var selectHtml = '';
                domainArray.forEach(function (item,index,list) {
                    selectHtml += '<div class="checkbox"> <label> <input type="checkbox" value="' + item.toLowerCase() + '" name="domain" checked>' + item.toLowerCase() + '</label> </div>';
                });
                if (selectHtml) {
                    $("#contentDomainList").html(selectHtml);
                }
            } else {
                console.log(domainArray);
            }
        }
    });
}
$(function () {
    var data = {};
    loadSetting();

    $("#buttonScan").on("click", function () {
        var msg = {
            type: "scan-background-value",
        };
        chrome.runtime.sendMessage(msg);
    });

    // reload setting
    $("#buttonReload").on("click", function () {
        loadSetting();
    });

    // save settting
    $("#form").bind('submit', function () {
        var saveWay = $("#selectSaveWay").val();
        var status = $("#selectStatus").val();
        var userName = $("#inputUserName").val();
        var domainArray = jqcheck('domain');
        if (userName == '') {
            alert('UserName is null');
            $("#inputUserName").focus();
            return false;
        }
        var msg = {
            type: "setting-save",
            saveWay : saveWay,
            status : status,
            userName : userName,
            domainArray : domainArray,
        };
        chrome.runtime.sendMessage(msg);
        loadSetting();
        return true;
    });

    // add domain
    $("#inputDomainButton").on("click", function () {
        var inputDomain = $("#inputDomain").val();
        inputDomain = inputDomain.toLowerCase();
        var flag = $('input[name="domain"][value="' + inputDomain + '"]').val();
        if (inputDomain && !flag) {
            var selectHtml = '<div class="checkbox"> <label> <input type="checkbox" value="' + inputDomain.toLowerCase() + '" name="domain" checked>' + inputDomain.toLowerCase() + '</label> </div>';
            $("#contentDomainList").prepend(selectHtml);
        } else {
            alert("domain " + inputDomain + " is null or is exists");
        }
        $("#inputDomain").val('');
    });
});