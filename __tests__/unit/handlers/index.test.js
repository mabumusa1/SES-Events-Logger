var glob = require( 'glob' )
  , path = require( 'path' );

const LambdaTester = require( 'lambda-tester' );  
const loggerHandler = require('../../../src/handlers/index.js').handler;

describe('Test for default-handler', function () {
  glob.sync( './events/**/*.json' ).forEach( function( file ) {
      it(`Verify it logs notifications ${file} `, async() => {
        const payload = require( path.resolve( file ) );
        let message = null;
        let recordType = null;
        let element = payload.Records[0];
        let isNotification =  element.Sns.hasOwnProperty("Type")
        if (isNotification){
          message = JSON.parse(element.Sns.Message);
          recordType = message.notificationType.toLowerCase();
        }else{
          recordType = element.Sns.eventType.toLowerCase();
          message = element.Sns;
        }

        //Add the record to the database
        await LambdaTester( loggerHandler )
          .event( payload )
          .expectSucceed((Item) => {
            switch (recordType) {
              case 'bounce':
                if(isNotification){
                  expect(Item).toEqual({
                    content: "{\"bounceType\":\"Permanent\",\"bounceSubType\":\"General\",\"bouncedRecipients\":[{\"emailAddress\":\"jane@example.com\"},{\"emailAddress\":\"richard@example.com\"}],\"timestamp\":\"2016-01-27T14:59:38.237Z\"}",
                    destination: "[\"jane@example.com\",\"mary@example.com\",\"richard@example.com\"]",
                    eventType: "bounce",
                    messageId: "00000137860315fd-34208509-5b74-41f3-95c5-bounce-notification",
                    sourceArn: "arn:aws:ses:us-west-2:888888888888:identity/example.com",
                    "source": "john@example.com",
                    subject: "Hello",
                    timestamp: "2016-01-27T14:59:38.237Z"                        
                  });
                }else{
                  expect(Item).toEqual({
                    "content": "{\"reportingMTA\":\"dsn; mta.example.com\",\"bounceType\":\"Permanent\",\"bounceSubType\":\"General\",\"bouncedRecipients\":[{\"emailAddress\":\"recipient@example.com\",\"action\":\"failed\",\"status\":\"5.1.1\",\"diagnosticCode\":\"smtp; 550 5.1.1 user unknown\"}],\"timestamp\":\"2017-08-05T00:41:02.669Z\"}",
                    "destination": "[\"recipient@example.com\"]",
                    "eventType": "bounce",
                    "messageId": "EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-bounce-configset",
                    "source": "Sender Name <sender@example.com>",
                    "sourceArn": "arn:aws:ses:us-east-1:123456789012:identity/sender@example.com",
                    "subject": "Message sent from Amazon SES",
                    "timestamp": "2017-08-05T00:40:02.012Z"            
                  });
                }
                break;
              case 'click':
                expect(Item).toEqual({
                  "content": "{\"ipAddress\":\"192.0.2.1\",\"link\":\"http://docs.aws.amazon.com/ses/latest/DeveloperGuide/send-email-smtp.html\",\"linkTags\":{\"samplekey0\":[\"samplevalue0\"],\"samplekey1\":[\"samplevalue1\"]},\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36\",\"timestamp\":\"2017-08-09T23:51:25.570Z\"}",
                  "destination": "[\"recipient@example.com\"]",
                  "eventType": "click",
                  "messageId": "EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-click-configset",
                  "source": "sender@example.com",                  
                  "subject": "Message sent from Amazon SES",
                  "timestamp": "2017-08-09T23:50:05.795Z"
                });
                break;
              case 'complaint':
                if(isNotification){
                  expect(Item).toEqual({
                    content: "{\"complainedRecipients\":[{\"emailAddress\":\"richard@example.com\"}],\"timestamp\":\"2016-01-27T14:59:38.237Z\"}",
                    destination: "[\"jane@example.com\",\"mary@example.com\",\"richard@example.com\"]",
                    eventType: "complaint",
                    messageId: "0000013786031775-163e3910-53eb-4c8e-a04a-complaint-notification",
                    sourceArn: "arn:aws:ses:us-west-2:888888888888:identity/example.com",
                    "source": "john@example.com",
                    subject: "Hello",
                    timestamp: "2016-01-27T14:59:38.237Z"                        
                  });
                }else{
                  expect(Item).toEqual({
                    "content": "{\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36\",\"complainedRecipients\":[{\"emailAddress\":\"recipient@example.com\"}],\"complaintFeedbackType\":\"abuse\",\"timestamp\":\"2017-08-05T00:41:02.669Z\",\"arrivalDate\":\"2017-08-05T00:41:02.669Z\"}",
                    "destination": "[\"recipient@example.com\"]",
                    "eventType": "complaint",
                    "messageId": "EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-complaint-configset",
                    "sourceArn": "arn:aws:ses:us-east-1:123456789012:identity/sender@example.com",
                    "source": "Sender Name <sender@example.com>",
                    "subject": "Message sent from Amazon SES",
                    "timestamp": "2017-08-05T00:40:01.123Z"
                  });
                }
                break;
              case 'delivery':
                if(isNotification){
                  expect(Item).toEqual({
                    content: "{\"recipients\":[\"jane@example.com\"],\"reportingMTA\":\"a8-70.smtp-out.amazonses.com\",\"smtpResponse\":\"250 ok:  Message 64111812 accepted\",\"timestamp\":\"2016-01-27T14:59:38.237Z\"}",
                    destination: "[\"jane@example.com\"]",
                    eventType: "delivery",
                    messageId: "0000014644fe5ef6-9a483358-9170-4cb4-a269-delivery-notification",
                    sourceArn: "arn:aws:ses:us-west-2:888888888888:identity/example.com",
                    source: "john@example.com",
                    subject: "Hello",
                    timestamp: "2016-01-27T14:59:38.237Z"                        
                  });
                }else{
                  expect(Item).toEqual({
                    "content": "{\"recipients\":[\"recipient@example.com\"],\"reportingMTA\":\"mta.example.com\",\"smtpResponse\":\"250 2.6.0 Message received\",\"timestamp\":\"2016-10-19T23:21:04.133Z\"}",
                    "destination": "[\"recipient@example.com\"]",
                    "eventType": "delivery",
                    "messageId": "EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-delivery-configset",
                    "sourceArn": "arn:aws:ses:us-east-1:123456789012:identity/sender@example.com",
                    "source": "sender@example.com",
                    "subject": "Message sent from Amazon SES",
                    "timestamp": "2016-10-19T23:20:52.240Z"
                  });
                }
                break;
              case 'deliverydelay':
                expect(Item).toEqual({
                  "content": "{\"delayType\":\"TransientCommunicationFailure\",\"expirationTime\":\"2020-06-16T00:25:40.914Z\",\"delayedRecipients\":[{\"emailAddress\":\"recipient@example.com\",\"status\":\"4.4.1\",\"diagnosticCode\":\"smtp; 421 4.4.1 Unable to connect to remote host\"}],\"timestamp\":\"2020-06-16T00:25:40.095Z\"}",
                  "destination": "[\"recipient@example.com\"]",
                  "eventType": "deliverydelay",
                  "messageId": "EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-deliverydelay-configset",
                  "sourceArn": "arn:aws:ses:us-east-1:123456789012:identity/sender@example.com",
                  "source": "sender@example.com",
                  "subject": null,
                  "timestamp": "2020-06-16T00:15:40.641Z"
                });            
                break;
              case 'open':
                expect(Item).toEqual({
                  "content": "{\"ipAddress\":\"192.0.2.1\",\"userAgent\":\"Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_3 like Mac OS X) AppleWebKit/603.3.8 (KHTML, like Gecko) Mobile/14G60\",\"timestamp\":\"2017-08-09T22:00:19.652Z\"}",
                  "destination": "[\"recipient@example.com\"]",
                  "eventType": "open",
                  "messageId": "EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-open-configset",
                  "subject": "Message sent from Amazon SES",
                  "timestamp": "2017-08-09T21:59:49.927Z",
                  "source": "sender@example.com"                  
                });            
                break;
              case 'reject':
                expect(Item).toEqual({
                  "content": "{\"reason\":\"Bad content\"}",
                  "destination": "[\"sender@example.com\"]",
                  "eventType": "reject",
                  "messageId": "EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-reject-configset",
                  "sourceArn": "arn:aws:ses:us-east-1:123456789012:identity/sender@example.com",
                  "source": "sender@example.com",
                  "subject": "Message sent from Amazon SES",
                  "timestamp": "2016-10-14T17:38:15.211Z"
                });            
                break;
              case 'rendering failure':
                expect(Item).toEqual({
                  "content": "{\"errorMessage\":\"Attribute 'attributeName' is not present in the rendering data.\",\"templateName\":\"MyTemplate\"}",
                  "destination": "[\"recipient@example.com\"]",
                  "sourceArn": "arn:aws:ses:us-east-1:123456789012:identity/sender@example.com",
                  "source": "sender@example.com",
                  "eventType": "rendering failure",
                  "messageId": "EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-rendering-failure-configset",
                  "subject": null,
                  "timestamp": "2018-01-22T18:43:06.197Z"
                });
                break;
              case 'send':
                expect(Item).toEqual({
                  "content": "{}",
                  "destination": "[\"recipient@example.com\"]",
                  "eventType": "send",
                  "messageId": "EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-send-configset",
                  "sourceArn": "arn:aws:ses:us-east-1:123456789012:identity/sender@example.com",
                  "source": "sender@example.com",
                  "subject": "Message sent from Amazon SES",
                  "timestamp": "2016-10-14T05:02:16.645Z"
                });            
                break;
              default:
                fail('Invalid Type of message');
                break;
            }
          });
    });      
  });    
});
