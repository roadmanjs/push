import 'dotenv/config';

import {RoadMan, RoadmanBuild} from '@roadmanjs/core';
import {FIREBASE_SA_ANDROID, FIREBASE_SA_IOS} from './config';

/**
 * An auth roadman using a UserType model in Couchbase and firebase-auth
 * @param RoadmanBuild
 */
export const pushRoadman: RoadMan = async (args: RoadmanBuild): Promise<RoadmanBuild> => {
    if (!FIREBASE_SA_ANDROID || !FIREBASE_SA_IOS) {
        throw new Error('Please specify FIREBASE_SA_ANDROID and FIREBASE_SA_IOS');
    }
    return args;
};

export default pushRoadman;
