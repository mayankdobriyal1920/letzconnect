import {IonAlert, IonContent, IonPage, IonToast} from '@ionic/react';
import React,{useEffect, useState} from 'react';
import './Login.css'
import { useDispatch,useSelector,RootStateOrAny } from 'react-redux';
import siteLogoUrl from '../../theme/images/logo2.png';
import {actionToSaveNewPassword, actionToSendOtpFoResetPassword} from "../../actions/UserAction";
import {useHistory} from "react-router-dom";

const ForgotPasswordPage: React.FC = () => {

    const history:any = useHistory();
    const dispatch:any = useDispatch();
    const [email, setEmail] = useState<string>('');
    const [otp, setOtp] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [loginLoading, setLoginLoading] = useState<boolean>(false);
    const [otpSend, setOtpSend] = useState<boolean>(false);
    const [otpLoading, sendOtpLoading] = useState<boolean>(false);
    const [iserror, setIserror] = useState<boolean>(false);
    const [severOtp, setSeverOtp] = useState<string>('');
    const {error} = useSelector((state:RootStateOrAny) => state.userSignin);
    const [showToast, setShowToast] = useState(false);

    const handleLogin = () => {
        if(loginLoading) return false;
        if(severOtp != otp){
            setMessage("Wrong OTP!");
            setIserror(true);
            setOtp('');
            return;
        }
        if (!email) {
            setMessage("Please enter a valid email!");
            setIserror(true);
            return;
        }
        if (!newPassword?.trim()?.length) {
            setMessage("Please enter a new password!");
            setIserror(true);
            return;
        }
        setLoginLoading(true);
        dispatch(actionToSaveNewPassword({password:newPassword,email:email}));

        setTimeout(function(){
            setLoginLoading(false);
            setShowToast(true);
            sendOtpLoading(false);
            setOtpSend(false);
            setEmail('');
            setOtp('');
            setMessage('');
            setNewPassword('');
            setLoginLoading(false);
        },2000)
    }

    const sendOtpInEmail = ()=>{
        if(otpLoading) return;
        if(email?.trim()?.length){
            sendOtpLoading(true);
            dispatch(actionToSendOtpFoResetPassword(email)).then((response:any)=>{
                if(response.success){
                    sendOtpLoading(false);
                    setOtpSend(true);
                    setSeverOtp(response.otp);
                }else{
                    setMessage('Email not exist!');
                    setOtpSend(false);
                    setIserror(true);
                    sendOtpLoading(false);
                }
            })
        }
    }

    const goToLoginPage = ()=>{
        history.replace('/app/login');
    }

    useEffect(()=>{
        if(error){
            setIserror(true);
            setMessage(error);
            setLoginLoading(false);
        }
    },[error])

    return (
        <IonPage>
            <IonContent fullscreen className="ion-text-center ionic-page-color-background">
                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message="Password changed successfully please login again by new password!"
                    duration={5000}
                />
                <IonAlert
                    isOpen={iserror}
                    onDidDismiss={() => setIserror(false)}
                    cssClass="my-custom-class"
                    header={"Error!"}
                    message={message}
                    buttons={["Dismiss"]}/>

                <div className="login-page">
                    <div className="container-login100">
                        <div className="account-content">
                            <div className="login-icon">
                                <div className="login-top-icon">
                                    <div className="inner-top-icon">
                                        <img src={siteLogoUrl} alt=""/>
                                    </div>
                                </div>
                            </div>
                            <div className="account-title">
                                <h3>Forgot Password</h3>
                            </div>
                            <div className="account-form">
                                <form>
                                    <div className="input-list">
                                        {(otpSend) ?
                                            <input
                                                value={email}
                                                type="email" name="email" placeholder="Email Address" readOnly/>
                                            :
                                            <input
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                type="email" name="email" placeholder="Email"/>
                                        }
                                        <button type="button" onClick={sendOtpInEmail} className={"send_otp_button"}>
                                            {
                                                (!otpSend) ? ((!otpLoading) ? 'SEND OTP' : 'SENDING') : ((!otpLoading) ? 'RESEND' : 'SENDING')
                                            }
                                        </button>
                                    </div>
                                    <div className="input-list">
                                        <input
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            type="number" name="otp" placeholder="OTP"/>
                                    </div>
                                    <div className="input-list">
                                        <input
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            type="text" name="otp" placeholder="New Password"/>
                                    </div>
                                    <div className="input-list">
                                        <a onClick={goToLoginPage}>Login here?</a>
                                    </div>
                                    <div className="input-list">
                                        <button onClick={handleLogin}
                                                type="button"
                                                className="button button-big account-btn btn w-100">
                                            {loginLoading ? 'Wait...' : 'Submit'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default ForgotPasswordPage;