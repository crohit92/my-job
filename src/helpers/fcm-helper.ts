
import { fcmServerKey, FCMMessage } from '../models/fcm';
import { User } from '../models/user';
var FCM = require('fcm-push');
var serverKey = fcmServerKey;
var fcm = new FCM(serverKey);


export function pushToUser(user: User, message: FCMMessage) {
    return new Promise<any>((resolve, reject) => {
        if (user.token) {
            fcm.send(message, function (err, response) {
                if (err) {
                    reject({ message: 'Error Occured', error: err });
                } else {
                    resolve({ message: "Successfully sent with response: " + response });
                }
            });
        } else{
            reject({message:'User does not have a token'});
        }

    })

}