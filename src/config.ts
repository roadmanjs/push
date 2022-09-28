import {FirebaseConfig} from '@roadmanjs/firebase-admin';
import {JSONDATA} from 'couchset/dist/utils';
export const FIREBASE_SA_IOS = process.env.FIREBASE_SA_IOS;
export const FIREBASE_SA_ANDROID = process.env.FIREBASE_SA_ANDROID;

const serviceAccountIos: any = JSONDATA(FIREBASE_SA_IOS || {});
const serviceAccountAndroid: any = JSONDATA(FIREBASE_SA_ANDROID || {});
export const firebaseAndroid: FirebaseConfig = {
    appOptions: serviceAccountAndroid,
    name: serviceAccountAndroid.project_id,
};
export const firebaseIos: FirebaseConfig = {
    appOptions: serviceAccountIos,
    name: serviceAccountIos.project_id,
};
