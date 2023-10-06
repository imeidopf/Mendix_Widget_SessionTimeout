define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",
    "SessionTimeout/lib/sweetalert2"

], function (declare, _WidgetBase, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent, Swal) {
    "use strict";

    return declare("SessionTimeout.widget.SessionTimeout", [ _WidgetBase ], {


        // Internal variables.
        _handles: null,
        _contextObj: null,

        // Configured params
        paramMinutes: "",
        paramModalDuration: "",
        paramTitle: "",
        paramMessage: "",
        paramNavAwayLink: "",

        constructor: function () {
            this._handles = [];
        },

        postCreate: function () {
            console.debug(this.id + ".postCreate");

            this._updateRendering();
        },

        update: function (obj, callback) {
            console.debug(this.id + ".update");
            
            var title = this.paramTitle;
            var message = this.paramMessage;
            var duration = this.paramModalDuration * 1000;
            var redirect = this.paramNavAwayLink;
            var minutes = this.paramMinutes;

            var dateNow = Date.now();
            var idle_epoch = dateNow + (minutes * 60000);

            document.cookie = "SessionTimeout_Status=Active";
            document.cookie = "SessionTimeout_IdleOn="+idle_epoch;
            
            var isShowingSwal = false;

            document.onmousemove = document.onmousedown = document.onmouseup = document.onkeydown = document.onkeyup = document.focus = function () {
                var dateNow = Date.now();
                var idle_epoch = dateNow + (minutes * 60000);

                if (!isShowingSwal) {
                    document.cookie = "SessionTimeout_IdleOn="+idle_epoch;
                }
            }

            const checkStatus = setInterval(function() {
                var now = Date.now();
                var idle = getCookie('SessionTimeout_IdleOn');

                if (now >= idle && !isShowingSwal) {
                    document.cookie = 'SessionTimeout_Status=Idle';
                    let timerInterval;
                    isShowingSwal = true;
                    Swal.fire({
                        title: title,
                        html: message + '<br /><br /><p>Logging out in <b></b> seconds.</p>',
                        showConfirmButton: true,
                        confirmButtonText: 'Stay Signed In',
                        showCancelButton: true,
                        cancelButtonText: 'Log Out',
                        showCloseButton: true,
                        allowOutsideClick: false,
                        timer: duration,
                        timerProgressBar: true,
                        didOpen: () => {
                            const b = Swal.getHtmlContainer().querySelector('b');
                            timerInterval = setInterval(() => {
                                b.textContent = Math.round(Swal.getTimerLeft() / 1000)
                            }, 100);
                        },
                        willClose: () => {
                            clearInterval(timerInterval);
                        }
                    }).then((result) => {
                        if (result.dismiss != Swal.DismissReason.timer && result.dismiss != Swal.DismissReason.cancel) {
                            isShowingSwal = false;
                            document.cookie = 'SessionTimeout_Status=Active';
                            var now = Date.now();
                            var idle = now + (minutes * 60000);
                            document.cookie = "SessionTimeout_IdleOn=" + idle;
                        } else {
                            if (mx.session.isGuest()) {
                                if (redirect) {
                                    window.location.href = redirect;
                                }
                            } else {
                                mx.session.logout();
                                if (redirect) {
                                    window.location.href = redirect;
                                }
                            }
                        }
                    });
                } else if (now >= idle && isShowingSwal) {
                    if (getCookie('SessionTimeout_Status') == 'Active') {
                        Swal.close();
                        isShowingSwal = false;
                    }
                } else {
                    document.cookie = 'SessionTimeout_Status=Active';
                    Swal.close();
                    isShowingSwal = false;
                }
              }, 250);

            function getCookie(cname) {
                let name = cname + "=";
                let decodedCookie = decodeURIComponent(document.cookie);
                let ca = decodedCookie.split(';');
                for(let i = 0; i < ca.length; i++) {
                  let c = ca[i];
                  while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                  }
                  if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                  }
                }
    
                return "";
            }

            this._contextObj = obj;
            this._updateRendering(callback);
        },

        _updateRendering: function (callback) {
            console.debug(this.id + "._updateRendering");

            this._executeCallback(callback, "_updateRendering");
        },

        _executeCallback: function (cb, from) {
            console.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["SessionTimeout/widget/SessionTimeout"]);
