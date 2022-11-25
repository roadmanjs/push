import {FirebaseProject, configureFirebase} from '@roadmanjs/firebase-admin';
import {
    MessagingDevicesResponse,
    MessagingOptions,
    MessagingPayload,
    MessagingTopicResponse,
} from 'firebase-admin/messaging';
import {UserDeviceModel, UserDeviceType} from '../user';
import {firebaseAndroid, firebaseIos} from '../config';

import {UserModel} from '@roadmanjs/auth';
import isEmpty from 'lodash/isEmpty';
import {log} from '@roadmanjs/logs';

export interface PushOptions {
    options?: MessagingOptions;
    payload: MessagingPayload;
}

interface SendToTopic extends PushOptions {
    topic: string;
    client: FirebaseProject;
}

export const sendToTopic = async (args: SendToTopic): Promise<MessagingTopicResponse | null> => {
    try {
        const {client, options, payload, topic} = args;
        const sentToTopic = await client.messaging().sendToTopic(topic, payload, options);

        log('messaging().sendToTopic', JSON.stringify(sentToTopic));
        return sentToTopic;
    } catch (error) {
        log('messaging().sendToTopic', error);
        return null;
    }
};

interface SendMessageToTopic extends PushOptions {
    topic: string;
}

export const sendMessageToTopic = async (
    args: SendMessageToTopic
): Promise<MessagingTopicResponse[] | null> => {
    const {payload, topic} = args;

    const response: MessagingTopicResponse[] = [];

    const options = args.options || {
        // Required for background/quit data-only messages on iOS
        contentAvailable: true,
        // Required for background/quit data-only messages on Android
        priority: 'high',
    };

    try {
        const iosClient = await configureFirebase(firebaseIos);
        const androidClient = await configureFirebase(firebaseAndroid);

        if (iosClient) {
            const iosSent = await sendToTopic({
                client: iosClient,
                options,
                payload,
                topic,
            });
            response.push(iosSent);
        }

        if (androidClient) {
            const androidSent = await sendToTopic({
                client: androidClient,
                options,
                payload,
                topic,
            });
            response.push(androidSent);
        }

        return response;
    } catch (error) {
        log('error sending notification to topic', error);
        return null;
    }
};

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
        const existingUser = await UserModel.findById(owner);

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
