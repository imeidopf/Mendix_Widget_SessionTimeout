import { ReactNode, useEffect} from "react";
import Swal from "sweetalert2";
import Cookie from 'js-cookie';

interface SessionTimeoutProps {
    paramMinutes: number;
    paramModalDuration: number;
    paramTitle: string;
    paramMessage: string;
    paramConfirm: string;
    paramCancel: string;
    paramNavAwayLink?: string;
    isLoginPage: boolean;
}

export default function SessionTimeout({
    paramMinutes,
    paramModalDuration,
    paramTitle,
    paramMessage,
    paramConfirm,
    paramCancel,
    paramNavAwayLink,
    isLoginPage,
}: SessionTimeoutProps): ReactNode {
    let isShowingSwal:boolean = false;
    const modalDuration = paramModalDuration * 1000;
    const idleEpoch = Date.now() + paramMinutes * 60000 - paramModalDuration * 1000;
    let redirect:string = paramNavAwayLink!;
    let timerInterval: NodeJS.Timeout;
    
    useEffect(() => {
        document.cookie = "SessionTimeout_Status=Active";
        document.cookie = `SessionTimeout_IdleOn=${idleEpoch}`;
        
        const activityEvents = ["mousemove", "mousedown", "mouseup", "keydown", "keyup", "focus"];
        activityEvents.forEach(event => document.addEventListener(event, resetIdleTimer));
        const interval = setInterval(handleIdleCheck, 250);

        //If login page has this widget, redirects to last session timeout widget's redirect link
        if (isLoginPage){
            if (Cookie.get('SessionTimeout_Redirect')!){
                window.location.assign(Cookie.get('SessionTimeout_Redirect')!);
                Cookie.remove('SessionTimeout_Redirect');
            }
        }

        else {
        //Action to logout across all tabs
        const handleStorageChange = (localStorage: StorageEvent) => {
            if (localStorage.key === "SessionTimeout_Logout") {
                // @ts-ignore
                if (mx.session.isGuest()) {
                    window.location.href = "/";
                } else {
                    // @ts-ignore
                    mx.logout();
                }
            }
        };
        // Listen for logout events from other tabs
        window.addEventListener("storage", handleStorageChange);

        return () => {
            clearInterval(interval);
            activityEvents.forEach(event => document.removeEventListener(event, resetIdleTimer));
            window.removeEventListener("storage", handleStorageChange);
        };
    }
    }, [paramMinutes, paramModalDuration, paramTitle, paramMessage, paramNavAwayLink, isLoginPage]);


    function resetIdleTimer() {
        const idleEpoch = Date.now() + paramMinutes * 60000 - paramModalDuration * 1000;
        if (!isShowingSwal) {
            document.cookie = `SessionTimeout_IdleOn=${idleEpoch}`;
        }
    };

    function getCookie (cname: string): string {
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
    };

    function handleIdleCheck() {
        const now = Date.now();
        const idle = parseInt(getCookie("SessionTimeout_IdleOn"));

        if (now >= idle && !isShowingSwal) {
            document.cookie = "SessionTimeout_Status=Idle";
            isShowingSwal = true;

            Swal.fire({
                title: paramTitle,
                html: `${paramMessage}<br /><br /><p>Logging out in <b></b> seconds.</p>`,
                showConfirmButton: true,
                confirmButtonText: paramConfirm,
                showCancelButton: true,
                cancelButtonText: paramCancel,
                showCloseButton: true,
                allowOutsideClick: false,
                timer: modalDuration,
                timerProgressBar: true,
                didOpen: () => {
                    const b = Swal.getHtmlContainer()?.querySelector("b");
                    timerInterval = setInterval(() => {
                        if (b) b.textContent = Math.round(Swal.getTimerLeft()! / 1000).toString();
                    }, 100);
                },
                willClose: () => clearInterval(timerInterval)
            }).then(result => {
                if (result.dismiss !== Swal.DismissReason.timer && result.dismiss !== Swal.DismissReason.cancel) {  
                    isShowingSwal = false;
                    document.cookie = "SessionTimeout_Status=Active";
                    resetIdleTimer();
                } else {
                    Swal.fire({
                        title: 'Loading...',
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading()
                        },
                    });
                    if (paramNavAwayLink) {
                        localStorage.setItem("SessionTimeout_Redirect", paramNavAwayLink);
                    }
                    // @ts-ignore
                    if (mx.session.isGuest()) {
                        window.location.href = "/";
                    } else { 
                        Cookie.set('SessionTimeout_Redirect', redirect);
                        
                        // @ts-ignore
                        mx.logout()
                        Swal.close();
                    }
                    // Log all tabs to log out in a localStorage
                    localStorage.setItem("SessionTimeout_Logout", Date.now().toString());
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
    };
    
    return null;
}