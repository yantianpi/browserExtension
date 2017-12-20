/**
 * Created by peteryan on 2017/12/6.
 */
var settingData = {};
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
    console.log("js options loadSetting data.");
    $("#verifyUserNameFlag").val(0);
    chrome.runtime.getBackgroundPage(function (backgroundPage) {
        settingData = backgroundPage.settingData;
        // console.log(settingData);
        if(settingData.error){
            $("#contentError").html(settingData.error);
            $("#contentForm").hide();
        }else{
            // $("#contentShareDomainList").html('');
            $("#contentExclusiveDomainList").html('');
            $("#contentError").hide();
            $("#inputUserName").val(settingData.userName);
            $("#inputServerDomain").val(settingData.serverDomain);
            $("#inputMinLength").val(settingData.minLength);
            if (settingData.status) {
                $("#selectStatus").val(settingData.status);
            }
            // var shareDomainArray = settingData.shareDomainArray || [];
            // if (isArrayFn(shareDomainArray)) {
            //     var selectHtml = '';
            //     shareDomainArray.forEach(function (item,index,list) {
            //         selectHtml += '<div class="checkbox"> <label> <input type="checkbox" value="' + item.toLowerCase() + '" name="shareDomain" checked>' + item.toLowerCase() + '</label> </div>';
            //     });
            //     if (selectHtml) {
            //         $("#contentShareDomainList").html(selectHtml);
            //     }
            // } else {
            //     console.log(shareDomainArray);
            // }
            var exclusiveDomainArray = settingData.exclusiveDomainArray || [];
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
    loadSetting();

    // reload setting
    $("#buttonReload").on("click", function () {
        loadSetting();
    });

    $("#inputUserName").on("blur", function () {
        var userName = $(this).val();
        var tmpName = settingData.userName || '';
        console.log(settingData);
        if (userName != tmpName) {
            $("#verifyUserNameFlag").val(0);
            var modal = $("#oneModal");
            modal.find('.modal-title').text('UserName Verify');
            modal.find('.modal-body').html('<div>Original UserName:' + tmpName + ' Verify UserName:' + userName + '</div>Password: <input type="password" rows="5" cols="70" id="inputPassword" /><input type="hidden" name="modalType" value="userNameVerify" />');
            modal.find(".modalSubmit").val("Verify");
            $("#oneModal").modal({
                    backdrop: "static"
                }
            );
        }
    });

    // save settting
    $("#form").bind('submit', function () {
        var status = $("#selectStatus").val();
        var userName = $("#inputUserName").val();
        var verifyUserNameFlag = $("#verifyUserNameFlag").val();
        var serverDomain = $("#inputServerDomain").val();
        var minLength = $("#inputMinLength").val();
        // var shareDomainArray = jqcheck('shareDomain');
        var exclusiveDomainArray = jqcheck('exclusiveDomain');
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
            minLength : minLength,
            status : status,
            userName : userName,
            // shareDomainArray : shareDomainArray,
            exclusiveDomainArray : exclusiveDomainArray,
            verifyUserNameFlag : verifyUserNameFlag,
        };
        chrome.runtime.sendMessage(msg);
        loadSetting();
        return true;
    });

    // modal share domain
    // $("#shareDomainButton").on("click", function () {
    //     var modal = $("#oneModal");
    //     modal.find('.modal-title').text('Share Domain Add');
    //     modal.find('.modal-body').html('<textarea rows="5" cols="70" id="textareaDomain"> </textarea><input type="hidden" name="modalType" value="shareDomainAdd" />');
    //     modal.find(".modalSubmit").val("ShareSave");
    //     $("#oneModal").modal({
    //         backdrop: "static"
    //     }
    //     );
    // });

    // modal exclusive domain
    $("#exclusiveDomainButton").on("click", function () {
        var modal = $("#oneModal");
        modal.find('.modal-title').text('Exclusive Domain Add');
        modal.find('.modal-body').html('<textarea rows="5" cols="70" id="textareaDomain"> </textarea><input type="hidden" name="modalType" value="exclusiveDomainAdd" />');
        modal.find(".modalSubmit").val("Save");
        $("#oneModal").modal({
            backdrop: "static"
        });
    });

    // domain add
    $(".modalSubmit").on("click", function () {
        var type = $('input[name="modalType"]').val();
        if (type) {
            switch (type) {
                // case "shareDomainAdd":
                //     var domainArray = $("#textareaDomain").val().toLowerCase().split(",") || [];
                //     var selectHtml = "";
                //     domainArray.forEach(function (item,index,list) {
                //         var tmp = item.trim();
                //         if (tmp) {
                //             var flag = $('input[name="shareDomain"][value="' + tmp + '"]').val();
                //             if (!flag) {
                //                 selectHtml += '<div class="checkbox"> <label> <input type="checkbox" value="' + tmp + '" name="shareDomain" checked>' + tmp + '</label> </div>';
                //             }
                //         }
                //     });
                //     if (selectHtml) {
                //         $("#contentShareDomainList").prepend(selectHtml);
                //     }
                //     $("#oneModal").modal("hide");
                //     break;
                case "exclusiveDomainAdd":
                    var domainArray = $("#textareaDomain").val().toLowerCase().split(",") || [];
                    var selectHtml = "";
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
                    $("#oneModal").modal("hide");
                    break;
                case "userNameVerify":
                    var currentUserName = $("#inputUserName").val();
                    var password = $("#inputPassword").val();
                    if (!password) {
                        alert('password is empty');
                    } else {
                        var serverDomain = $("#inputServerDomain").val();
                        if (!serverDomain) {
                            alert('please setting ServerDomain');
                        } else {
                            var form = new FormData();
                            form.append("action", "userNameVerify");
                            form.append("userName", currentUserName);
                            form.append("password", password);
                            console.log("verify userName:" + currentUserName);
                            $.ajax({
                                // url:"http://mg_comm_user:mg_comm_user@" + serverDomain + ":8099/pluginDeal.php",
                                url:"http://" + serverDomain + "/pluginDeal.php",
                                type:"post",
                                data:form,
                                processData:false,
                                contentType:false,
                                dataType:"text",
                                success:function(msg){
                                    if (msg == 'success') {
                                        alert('verify successfully!');
                                        $("#verifyUserNameFlag").val(1);
                                        $("#oneModal").modal("hide");
                                    } else if (msg == 'fail') {
                                        alert('verify failed!');
                                    } else {
                                        alert('unkonw error');
                                    }
                                },
                                error:function () {
                                    alert("verify failed!please checkout ServerDomain or network");
                                }
                            });
                        }
                    }
                    break;
                default:
            }
        }
    });

});