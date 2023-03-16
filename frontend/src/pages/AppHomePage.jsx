import { IonContent,IonPage } from '@ionic/react';
import React from 'react';



const AppHomePage = () => {
    return (
        <IonPage>
            <IonContent fullscreen className="ion-padding ion-text-center">
                <div className={"app_blank_page_home_page"}>
                    <div className={"heading"}>App blank page</div>
                    <div className={"sub_heading"}>
                      <a href={"/app/"}>Go To The App -></a>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default AppHomePage;