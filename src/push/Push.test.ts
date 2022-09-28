import 'reflect-metadata';
import 'mocha';

import {expect} from 'chai';
import {startCouchbase} from '@roadmanjs/couchset';
import {sendMessageToUser} from './push.methods';

before((done) => {
    startCouchbase().then(() => done());
});

describe('Push', () => {
    it('it should send a notification to user', async () => {
        const userId = '99bc43ba-02ab-4394-b48b-49a39a95443c';
        const sentMessage = await sendMessageToUser(userId, {
            data: {
                type: 'tv',
            },
            notification: {
                title: 'Basic Notification',
                body: 'This is a basic notification sent from the server!',
                imageUrl: 'https://my-cdn.com/app-logo.png',
                sound: 'vuga_zing',
            },
        });

        expect(sentMessage).to.be.not.empty;
    });
});
