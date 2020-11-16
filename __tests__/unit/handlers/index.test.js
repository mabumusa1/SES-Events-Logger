const glob = require('glob')
const path = require('path')

const LambdaTester = require('lambda-tester')
const loggerHandler = require('../../../src/handlers/index.js').handler
const dbConnection = require('../../../src/handlers/dbConnectionPool')

const tableName = process.env.DB_TABLE

describe('Test for default-handler', function () {
  beforeEach(async (done) => {
    const con = await dbConnection()
    try {
      await con.query(`DELETE FROM ${tableName}`)
    } catch (error) {
      await con.query('ROLLBACK')
      fail(error)
    } finally {
      await con.release()
      await con.destroy()
      done()
    }
  })
  afterEach(async (done) => {
    const con = await dbConnection()
    try {
      await con.query(`DELETE FROM ${tableName}`)
    } catch (error) {
      await con.query('ROLLBACK')
      fail(error)
    } finally {
      await con.release()
      await con.destroy()
      done()
    }
  })

  glob.sync('./__tests__/events/**/*.json').forEach(function (file) {
    it(`Verify it logs notifications ${file} `, async (done) => {
      const payload = require(path.resolve(file))
      let message = null
      let recordType = null
      const element = payload.Records[0]
      const isNotification = Object.prototype.hasOwnProperty.call(element.Sns, 'Type')
      if (isNotification) {
        message = JSON.parse(element.Sns.Message)
        recordType = message.notificationType.toLowerCase()
      } else {
        recordType = element.Sns.eventType.toLowerCase()
        message = element.Sns
      }

      // Add the record to the database
      await LambdaTester(loggerHandler)
        .event(payload)
        .expectSucceed()

      const con = await dbConnection()
      try {
        const rec = await con.query(`SELECT * FROM ${tableName} where messageId = '${message.mail.messageId}'`)
        const content = JSON.parse(rec[0].content)
        delete rec[0].content
        const Item = JSON.parse(JSON.stringify(rec[0]))
        switch (recordType) {
          case 'bounce':
            if (isNotification) {
              expect(Item).toMatchObject({
                messageId: '00000137860315fd-34208509-5b74-41f3-95c5-bounce-notification',
                sourceArn: 'arn:aws:ses:us-west-2:888888888888:identity/example.com',
                source: 'john@example.com',
                sendingAccountId: '123456789012',
                subject: 'Hello',
                timestamp: '2016-01-27T14:59:38.000Z'
              })
              expect(content).toEqual(JSON.parse('{"bounceType": "Permanent","bounceSubType": "General","bouncedRecipients":[{"emailAddress":"jane@example.com"},{"emailAddress":"richard@example.com"}],"timestamp":"2016-01-27T14:59:38.237Z"}'))              
            } else {
              expect(Item).toMatchObject({
                messageId: 'EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-bounce-configset',
                sourceArn: 'arn:aws:ses:us-east-1:123456789012:identity/sender@example.com',
                source: 'Sender Name <sender@example.com>',
                sendingAccountId: '123456789012',
                subject: 'Message sent from Amazon SES',
                timestamp: '2017-08-05T00:40:02.000Z'
              })
              expect(content).toEqual(JSON.parse('{"reportingMTA":"dsn; mta.example.com","bounceType":"Permanent","bounceSubType":"General","bouncedRecipients":[{"emailAddress":"recipient@example.com","action":"failed","status":"5.1.1","diagnosticCode":"smtp; 550 5.1.1 user unknown"}],"timestamp":"2017-08-05T00:41:02.669Z"}'))              
            }
            break
          case 'click':
            expect(Item).toMatchObject({
              messageId: 'EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-click-configset',
              sourceArn: null,
              source: 'sender@example.com',
              sendingAccountId: '123456789012',
              subject: 'Message sent from Amazon SES',
              timestamp: '2017-08-08T23:50:05.000Z'
            })
            expect(content).toEqual(JSON.parse('{"ipAddress":"192.0.2.1","link":"http://docs.aws.amazon.com/ses/latest/DeveloperGuide/send-email-smtp.html","linkTags":{"samplekey0":["samplevalue0"],"samplekey1":["samplevalue1"]},"userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36","timestamp":"2017-08-09T23:51:25.570Z"}'))              
            break
          case 'complaint':
            if (isNotification) {
              expect.objectContaining({
                messageId: '0000013786031775-163e3910-53eb-4c8e-a04a-complaint-notification',
                sourceArn: 'arn:aws:ses:us-west-2:888888888888:identity/example.com',
                source: 'john@example.com',
                sendingAccountId: '123456789012',
                subject: 'Hello',
                timestamp: '2016-01-27T14:59:38.000Z'
              })
              expect(content).toEqual(JSON.parse('{"complainedRecipients":[{"emailAddress":"richard@example.com"}],"timestamp":"2016-01-27T14:59:38.237Z"}'))
            } else {
              expect(Item).toMatchObject({
                messageId: 'EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-complaint-configset',
                sourceArn: 'arn:aws:ses:us-east-1:123456789012:identity/sender@example.com',
                source: 'Sender Name <sender@example.com>',
                sendingAccountId: '123456789012',
                subject: 'Message sent from Amazon SES',
                timestamp: '2017-08-05T00:40:01.000Z'
              })
              expect(content).toEqual(JSON.parse('{"userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36","complainedRecipients":[{"emailAddress":"recipient@example.com"}],"complaintFeedbackType":"abuse","timestamp":"2017-08-05T00:41:02.669Z","arrivalDate":"2017-08-05T00:41:02.669Z"}'))
            }
            break
          case 'delivery':
            if (isNotification) {
              expect(Item).toMatchObject({
                messageId: '0000014644fe5ef6-9a483358-9170-4cb4-a269-delivery-notification',
                sourceArn: 'arn:aws:ses:us-west-2:888888888888:identity/example.com',
                source: 'john@example.com',
                sendingAccountId: '123456789012',
                subject: 'Hello',
                timestamp: '2016-01-27T14:59:38.000Z'
              })
              expect(content).toEqual(JSON.parse('{"recipients":["jane@example.com"],"reportingMTA":"a8-70.smtp-out.amazonses.com","smtpResponse":"250 ok:  Message 64111812 accepted","timestamp":"2016-01-27T14:59:38.237Z"}'))
            } else {
              expect(Item).toMatchObject({
                messageId: 'EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-delivery-configset',
                sourceArn: 'arn:aws:ses:us-east-1:123456789012:identity/sender@example.com',
                source: 'sender@example.com',
                sendingAccountId: '123456789012',
                subject: 'Message sent from Amazon SES',
                timestamp: '2016-10-18T23:20:52.000Z'
              })
              expect(content).toEqual(JSON.parse('{"recipients":["recipient@example.com"],"reportingMTA":"mta.example.com","smtpResponse":"250 2.6.0 Message received","timestamp":"2016-10-19T23:21:04.133Z"}'))
            }
            break
          case 'deliverydelay':
            expect(Item).toMatchObject({
              messageId: 'EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-deliverydelay-configset',
              sourceArn: 'arn:aws:ses:us-east-1:123456789012:identity/sender@example.com',
              source: 'sender@example.com',
              sendingAccountId: '123456789012',
              subject: null,
              timestamp: '2020-06-16T00:15:40.000Z'
            })
            expect(content).toEqual(JSON.parse('{"delayType":"TransientCommunicationFailure","expirationTime":"2020-06-16T00:25:40.914Z","delayedRecipients":[{"emailAddress":"recipient@example.com","status":"4.4.1","diagnosticCode":"smtp; 421 4.4.1 Unable to connect to remote host"}],"timestamp":"2020-06-16T00:25:40.095Z"}'))
            break
          case 'open':
            expect(Item).toMatchObject({
              messageId: 'EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-open-configset',
              sourceArn: null,
              source: 'sender@example.com',
              sendingAccountId: '123456789012',
              subject: 'Message sent from Amazon SES',
              timestamp: '2017-08-08T21:59:49.000Z'              
            })
            expect(content).toEqual(JSON.parse('{"ipAddress":"192.0.2.1","userAgent":"Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_3 like Mac OS X) AppleWebKit/603.3.8 (KHTML, like Gecko) Mobile/14G60","timestamp":"2017-08-09T22:00:19.652Z"}'))
            break
          case 'reject':
            expect(Item).toMatchObject({
              messageId: 'EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-reject-configset',
              sourceArn: 'arn:aws:ses:us-east-1:123456789012:identity/sender@example.com',
              source: 'sender@example.com',
              sendingAccountId: '123456789012',
              subject: 'Message sent from Amazon SES',
              timestamp: '2016-10-14T17:38:15.000Z',              
            })
            expect(content).toEqual(JSON.parse('{"reason":"Bad content"}'))
            break
          case 'rendering failure':
            expect(Item).toMatchObject({
              messageId: 'EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-rendering-failure-configset',
              sourceArn: 'arn:aws:ses:us-east-1:123456789012:identity/sender@example.com',
              source: 'sender@example.com',
              sendingAccountId: '123456789012',
              subject: null,
              timestamp: '2018-01-22T18:43:06.000Z'
            })
            expect(content).toEqual(JSON.parse('{"errorMessage":"Attribute \'attributeName\' is not present in the rendering data.","templateName":"MyTemplate"}'))
            break
          case 'send':
            expect(Item).toMatchObject({
              messageId: 'EXAMPLE7c191be45-e9aedb9a-02f9-4d12-a87d-send-configset',
              sourceArn: 'arn:aws:ses:us-east-1:123456789012:identity/sender@example.com',
              source: 'sender@example.com',
              sendingAccountId: '123456789012',
              subject: 'Message sent from Amazon SES',
              timestamp: '2016-10-14T05:02:16.000Z',              
            })
            expect(content).toEqual(JSON.parse('{}'))
            break
          default:
            fail('Invalid Type of message')
            break
        }
      } catch (error) {
        fail(error)
      } finally {
        await con.release()
        await con.destroy()
        done()
      }
    })
  })
})
