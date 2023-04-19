import {IonAccordion, IonAccordionGroup, IonContent, IonItem, IonLabel, IonList, IonPage} from '@ionic/react';
import SubHeader from "../../components/Header/SubHeader";
import React from "react";
const HelpAndSupportPage = () => {
    return (
        <IonPage>
            <SubHeader title={'Help And Support'}/>
            <IonContent fullscreen>
                <div className="chat-list-col pt-5">
                    <div className="container">
                        <div id="accordion" className="accordion helpsupport">

                            <IonAccordionGroup>
                                <IonAccordion>
                                    <IonItem slot={"header"}>
                                        <IonLabel> How To Make Call </IonLabel>
                                    </IonItem>
                                    <IonList slot={"content"}>
                                        <IonItem>
                                            Go to the Start Con Call section and select members from the select option then press okay,
                                            wait for 10 sec your call will be auto connected and added members can join the call from the join conference button.
                                        </IonItem>
                                    </IonList>
                                </IonAccordion>
                                <IonAccordion>
                                    <IonItem slot={"header"}>
                                        <IonLabel> How To Add User </IonLabel>
                                    </IonItem>
                                    <IonList slot={"content"}>
                                        <IonItem>
                                            Go To add user section and enter details for new user. Make sure email Id will be unique for all users.
                                        </IonItem>
                                    </IonList>
                                </IonAccordion>
                                <IonAccordion>
                                    <IonItem slot={"header"}>
                                        <IonLabel> How To See Call Log </IonLabel>
                                    </IonItem>
                                    <IonList slot={"content"}>
                                        <IonItem>
                                            Click on the call log or call transcript section click the on-call list option then you can see all call-related details with the call transcript.
                                        </IonItem>
                                    </IonList>
                                </IonAccordion>
                                <IonAccordion>
                                    <IonItem slot={"header"}>
                                        <IonLabel> How To Join Conference Call </IonLabel>
                                    </IonItem>
                                    <IonList slot={"content"}>
                                        <IonItem>
                                            When the admin will add you as a  member in call the join conference button will auto display to your screen click on the join conference button then you will auto-join on call.
                                        </IonItem>
                                    </IonList>
                                </IonAccordion>
                            </IonAccordionGroup>
                            <p style={{marginTop : "10px",fontSize:"13px"}}>for more query please feel free contact us at
                                <a href="mailto:admin@letzconnect.com">admin@letzconnect.com</a></p>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default HelpAndSupportPage;


