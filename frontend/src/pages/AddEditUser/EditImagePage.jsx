import {IonContent,IonPage} from '@ionic/react';

import { useDispatch, useSelector } from 'react-redux';
import SubHeader from "../../components/Header/SubHeader";

const EditImagePage = () => {
  const {userInfo} = useSelector((state) => state.userSignin);
  const dispatch = useDispatch();
  const index = 0;
  return (
    <IonPage>
      <SubHeader title={'Edit Profile'}/>
      <IonContent fullscreen>

      </IonContent>
    </IonPage>
  );
};

export default EditImagePage;


