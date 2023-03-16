import './Header.css'; 
import {IonBackButton, IonButtons, IonHeader, IonTitle, IonToolbar} from '@ionic/react';
import menuIcon from '../../theme/images/hamburger-icon.svg';
import {useHistory} from "react-router-dom";

const SubHeader = (props:any) => {
    let history = useHistory();
    const goToThisPage = (page:any) =>{
        history.push(`/app/${page}`);
    }
return (
    <IonHeader className="sub_header_section">
        <IonToolbar>
            <IonButtons className="back_button_group" slot="start">
              <IonBackButton defaultHref="/"/>
            </IonButtons>
            <IonTitle>
              {props.title}
            </IonTitle>
            {/* <div className="search sub_header_menu">
                <a onClick={()=>goToThisPage('menu')}>
                    <img src={menuIcon} alt=""/>
                </a>
            </div> */}
        </IonToolbar>
  </IonHeader>
);
};

export default SubHeader;
      
      
      