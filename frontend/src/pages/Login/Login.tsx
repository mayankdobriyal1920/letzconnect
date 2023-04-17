import { IonAlert, IonCol, IonContent, IonGrid, IonInput, IonItem, IonLabel, IonPage, IonRow } from '@ionic/react';
import React,{useEffect, useState} from 'react';
import './Login.css'
import { useDispatch,useSelector,RootStateOrAny } from 'react-redux';
import {signin} from '../../actions/UserAction';
import siteLogoUrl from '../../theme/images/logo2.png';
import { useHistory } from "react-router-dom";

const Login: React.FC = () => {

  const dispatch = useDispatch();
  const history = useHistory();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [iserror, setIserror] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const {error} = useSelector((state:RootStateOrAny) => state.userSignin);

  const handleLogin = () => {
    if(loginLoading) return false;
    if (!email) {
        setMessage("Please enter a valid email");
        setIserror(true);
        return;
    }
    setLoginLoading(true);
    const loginData = {
        email,
        password,
    }

    ////// calling api login service //////
    dispatch(signin(loginData));
    ////// calling api login service //////
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
      <IonContent fullscreen className="ion-padding ion-text-center">
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
              <h3>Login</h3>
            </div>
            <div className="account-form">
              <form>
                <div className="input-list">
                  <input 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email" name="email" placeholder="Email Address" required/>
                </div>
                <div className="input-list">
                <input 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password" name="pass" placeholder="Password" required/>
                </div>
                <div className="input-list">
                  <a onClick={()=>history.push('/app/forgot-password')}>Forgot Password?</a>
                </div>
                <div className="input-list">
                  <button onClick={handleLogin}
                          type="button"
                          className="button button-big account-btn btn w-100">
                        {loginLoading ? 'Wait...' : 'Login'}
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

export default Login;