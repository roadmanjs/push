import {
    MessagingPayload,
    MessagingOptions,
    MessagingDevicesResponse,
} from 'firebase-admin/messaging';
import {UserDeviceModel, UserDeviceType} from '../user';
import {UserModel} from '@roadmanjs/auth';
import isEmpty from 'lodash/isEmpty';
import {log} from '@roadmanjs/logs';
import {awaitTo} from 'couchset/dist/utils';
import {configureFirebase, FirebaseProject} from '@roadmanjs/firebase-admin';
import {firebaseAndroid, firebaseIos} from '../config';

interface SendNotification {
    options?: MessagingOptions;
    payload: MessagingPayload;
    iosTokens: string[];
    androidTokens: string[];
}

export const sendNotification = async (
    args: SendNotification
): Promise<MessagingDevicesResponse[] | null> => {
    const {payload, iosTokens = [], androidTokens = []} = args;

    const response: MessagingDevicesResponse[] = [];

    const options = args.options || {
        // Required for background/quit data-only messages on iOS
        contentAvailable: true,
        // Required for background/quit data-only messages on Android
        priority: 'high',
    };

    try {
        const iosClient = await configureFirebase(firebaseIos);
        const androidClient = await configureFirebase(firebaseAndroid);

        const sendMsg = async (
            client: FirebaseProject,
            tokens: string[]
        ): Promise<MessagingDevicesResponse | null> => {
            try {
                const sentMessage = await client.messaging().sendToDevice(tokens, payload, options);

                log('messaging().sendToDevice', JSON.stringify(sentMessage));
                return sentMessage;
            } catch (error) {
                log('messaging().sendToDevice', error);
                return null;
            }
        };

        if (!isEmpty(iosTokens)) {
            const iosSent = await sendMsg(iosClient, iosTokens);
            response.push(iosSent);
        }

        if (!isEmpty(androidTokens)) {
            const androidSent = await sendMsg(androidClient, androidTokens);
            response.push(androidSent);
        }

        return response;
    } catch (error) {
        log('error sending notification', error);
        return null;
    }
};

/**
 * How to use sendNotification
 * @param owner
 * @param payload
 * @param options
 */
export const sendMessageToUser = async (
    owner: string,
    payload: MessagingPayload,
    options?: MessagingOptions
) => {
    try {
        const [errorUser, existingUser] = await awaitTo(UserModel.findById(owner));

        if (errorUser) {
            throw new Error('user not found');
        }

        if (existingUser) {
            const userDevices: UserDeviceType[] = await UserDeviceModel.pagination({
                where: {
                    owner,
                },
            });

            if (!isEmpty(userDevices)) {
                const androidTokens = userDevices
                    .filter((device) => device.clientType === 'android')
                    .map((userDevice) => userDevice.pushtoken);
                const iosTokens = userDevices
                    .filter((device) => device.clientType === 'ios')
                    .map((userDevice) => userDevice.pushtoken);

                return await sendNotification({
                    androidTokens,
                    iosTokens,
                    options,
                    payload,
                });
            }

            throw new Error('there are no user devices available');
        }
    } catch (error) {
        log('error sending message to device', error);
    }
};
