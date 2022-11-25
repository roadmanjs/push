import 'reflect-metadata';
import 'mocha';

import {sendMessageToTopic, sendMessageToUser} from './push.methods';

import {expect} from 'chai';
import {startCouchbase} from '@roadmanjs/couchset';

// before((done) => {
//     startCouchbase().then(() => done());
// });

describe('Push', () => {
    // it('it should send a notification to user', async () => {
    //     const userId = '99bc43ba-02ab-4394-b48b-49a39a95443c';
    //     const sentMessage = await sendMessageToUser(userId, {
    //         data: {
    //             type: 'tv',
    //         },
    //         notification: {
    //             title: 'Basic Notification',
    //             body: 'This is a basic notification sent from the server!',
    //             imageUrl: 'https://my-cdn.com/app-logo.png',
    //             sound: 'vuga_zing',
    //         },
    //     });

    //     console.log("sendMessageToUser", sentMessage)

    //     expect(sentMessage).to.be.not.empty;
    // });

    it('it should send a notification to user', async () => {
        const topic = 'Tv';
        const sentMessage = await sendMessageToTopic({
            topic,
            payload: {
                data: {
                    type: 'tv',
                },
                notification: {
                    title: 'Notification Test',
                    body: 'Notification Test',
                    // imageUrl: 'https://my-cdn.com/app-logo.png',
                    sound: 'vuga_zing',
                },
            },
        });

        console.log('sendMessageToTopic', sentMessage);

        expect(sentMessage).to.be.not.empty;
    });
});
