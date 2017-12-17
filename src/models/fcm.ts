export const fcmServerKey = 'AAAA8xukH7E:APA91bGd7nGv3Qf0Qt46gGFKiCbhAkmIbu_pJmeUTc42M5U2sEEC386XlFKU0DJVVfn6CDcPMwMCqwFQ8zLS7RgNGkBMUIylnxR8sX-e6K877GyuhF0QDMUvGOuxK6dcHY0sSTxMg8WB';
export class FCMMessage {
    to?: string; // required fill with device token or topics
    collapse_key?: string;
    data?: {
        [key: string]: string
    };
    notification: {
        title?: string;
        body: string;
    }
}