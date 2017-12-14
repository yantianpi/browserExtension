/**
 * Created by peteryan on 2017/12/6.
 */
if (!String.prototype.trim){

    /*---------------------------------------
     * 清除字符串两端空格，包含换行符、制表符
     *---------------------------------------*/
    String.prototype.trim = function () {
        return this.replace(/(^[\s\n\t]+|[\s\n\t]+$)/g, "");
    }

}
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
        var data = backgroundPage.settingData;
        // console.log(data);
        if(data.error){
            $("#contentError").html(data.error);
            $("#contentForm").hide();
        }else{
            $("#contentDomainList").html('');
            $("#contentError").hide();
            $("#inputUserName").val(data.userName);
            $("#inputServerDomain").val(data.serverDomain);
            $("#selectStatus").val(data.status);
            var shareDomainArray = data.shareDomainArray || [];
            if (isArrayFn(shareDomainArray)) {
                var selectHtml = '';
                shareDomainArray.forEach(function (item,index,list) {
                    selectHtml += '<div class="checkbox"> <label> <input type="checkbox" value="' + item.toLowerCase() + '" name="shareDomain" checked>' + item.toLowerCase() + '</label> </div>';
                });
                if (selectHtml) {
                    $("#contentShareDomainList").html(selectHtml);
                }
            } else {
                console.log(shareDomainArray);
            }
            var exclusiveDomainArray = data.exclusiveDomainArray || [];
            if (isArrayFn(exclusiveDomainArray)) {
                var selectHtml = '';
                exclusiveDomainArray.forEach(function (item,index,list) {
                    selectHtml += '<div class="checkbox"> <label> <input type="checkbox" value="' + item.toLowerCase() + '" name="exclusiveDomain" checked>' + item.toLowerCase() + '</label> </div>';
                });
                if (selectHtml) {
                    $("#contentExclusiveDomainList").html(selectHtml);
                }
            } else {
                console.log(exclusiveDomainArray);
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
        var status = $("#selectStatus").val();
        var userName = $("#inputUserName").val();
        var serverDomain = $("#inputServerDomain").val();
        var shareDomainArray = jqcheck('shareDomain');
        var exclusiveDomainArray = jqcheck('exclusiveDomain');
        console.log(shareDomainArray);
        console.log(exclusiveDomainArray);
        if (userName == '') {
            alert('UserName is null');
            $("#inputUserName").focus();
            return false;
        }
        if (serverDomain == '') {
            alert('serverDomain is null');
            $("#inputServerDomain").focus();
            return false;
        }
        var msg = {
            type: "setting-save",
            serverDomain : serverDomain,
            status : status,
            userName : userName,
            shareDomainArray : shareDomainArray,
            exclusiveDomainArray : exclusiveDomainArray,
        };
        chrome.runtime.sendMessage(msg);
        loadSetting();
        return true;
    });

    // modal share domain
    $("#shareDomainButton").on("click", function () {
        var modal = $("#oneModal");
        modal.find('.modal-title').text('Share Domain Add');
        modal.find('.modal-body').html('<textarea rows="5" cols="70" id="textareaDomain"> </textarea><input type="hidden" name="modalType" value="shareDomainAdd" />');
        modal.find(".modalSubmit").val("ShareSave");
        $("#oneModal").modal({
            backdrop: "static"
        }
        );
    });

    // modal exclusive domain
    $("#exclusiveDomainButton").on("click", function () {
        var modal = $("#oneModal");
        modal.find('.modal-title').text('Exclusive Domain Add');
        modal.find('.modal-body').html('<textarea rows="5" cols="70" id="textareaDomain"> </textarea><input type="hidden" name="modalType" value="exclusiveDomainAdd" />');
        modal.find(".modalSubmit").val("ExclusiveSave");
        $("#oneModal").modal({
            backdrop: "static"
        });
    });

    // domain add
    $(".modalSubmit").on("click", function () {
        var type = $('input[name="modalType"]').val();
        var domainArray = $("#textareaDomain").val().toLowerCase().split(",") || [];
        if (domainArray && type) {
            var selectHtml = "";
            switch (type) {
                case "shareDomainAdd":
                    domainArray.forEach(function (item,index,list) {
                        var tmp = item.trim();
                        if (tmp) {
                            var flag = $('input[name="shareDomain"][value="' + tmp + '"]').val();
                            if (!flag) {
                                selectHtml += '<div class="checkbox"> <label> <input type="checkbox" value="' + tmp + '" name="shareDomain" checked>' + tmp + '</label> </div>';
                            }
                        }
                    });
                    if (selectHtml) {
                        $("#contentShareDomainList").prepend(selectHtml);
                    }
                    break;
                case "exclusiveDomainAdd":
                    domainArray.forEach(function (item,index,list) {
                        var tmp = item.trim();
                        if (tmp) {
                            var flag = $('input[name="exclusiveDomain"][value="' + tmp + '"]').val();
                            if (!flag) {
                                selectHtml += '<div class="checkbox"> <label> <input type="checkbox" value="' + tmp + '" name="exclusiveDomain" checked>' + tmp + '</label> </div>';
                            }
                        }
                    });
                    if (selectHtml) {
                        $("#contentExclusiveDomainList").prepend(selectHtml);
                    }
                    break;
                default:
            }
        }
        $("#oneModal").modal("hide");
    });

});