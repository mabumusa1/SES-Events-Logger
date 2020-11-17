exports.handler = async (event, context) => {
  const dbConnection = require('./dbConnectionPool')
  const axios = require('axios');
  /**
     * We have two types to be handled
     * Notifications from SES without a configuration set
     * eventType from SES with configuraton set
     */
  const element = event.Records[0]
  const payload = element.Sns
  let message = null
  let recordType = null

  // This is a Notification from SES
  if (Object.keys(payload).includes('Type')) {
    message = JSON.parse(element.Sns.Message)
    recordType = message.notificationType.toLowerCase()
  } else {
    // This is a SNS notification
    recordType = element.Sns.eventType.toLowerCase()
    message = element.Sns
  }
  const item = []

  // We want to store the subject line
  if (Object.keys(message.mail).includes('commonHeaders')) {
    item.subject = message.mail.commonHeaders.subject
  } else {
    item.subject = null
  }

  // Add Items based on the message type to content field
  switch (recordType) {
    case 'bounce':
      item.content = JSON.stringify({
        reportingMTA: message.bounce.reportingMTA,
        bounceType: message.bounce.bounceType,
        bounceSubType: message.bounce.bounceSubType,
        bouncedRecipients: message.bounce.bouncedRecipients,
        timestamp: message.bounce.timestamp
      })
      break
    case 'complaint':
      item.content = JSON.stringify({
        userAgent: message.complaint.userAgent,
        complainedRecipients: message.complaint.complainedRecipients,
        complaintFeedbackType: message.complaint.complaintFeedbackType,
        timestamp: message.complaint.timestamp,
        arrivalDate: message.complaint.arrivalDate
      })
      break
    case 'delivery':
      item.content = JSON.stringify({
        recipients: message.delivery.recipients,
        reportingMTA: message.delivery.reportingMTA,
        smtpResponse: message.delivery.smtpResponse,
        timestamp: message.delivery.timestamp
      })
      break
    case 'deliverydelay':
      item.content = JSON.stringify({
        delayType: message.deliveryDelay.delayType,
        expirationTime: message.deliveryDelay.expirationTime,
        delayedRecipients: message.deliveryDelay.delayedRecipients,
        timestamp: message.deliveryDelay.timestamp
      })
      break
    case 'click':
      item.content = JSON.stringify({
        ipAddress: message.click.ipAddress,
        link: message.click.link,
        linkTags: message.click.linkTags,
        userAgent: message.click.userAgent,
        timestamp: message.click.timestamp
      })
      break
    case 'open':
      item.content = JSON.stringify({
        ipAddress: message.open.ipAddress,
        userAgent: message.open.userAgent,
        timestamp: message.open.timestamp
      })
      break
    case 'reject':
      item.content = JSON.stringify({
        reason: message.reject.reason
      })
      break
    case 'rendering failure':
      item.content = JSON.stringify({
        errorMessage: message.failure.errorMessage,
        templateName: message.failure.templateName
      })
      break
    case 'send':
      item.content = JSON.stringify({})
      break

    default:
      return context.fail('Undefined Event Type')
  }

  const date = new Date(message.mail.timestamp)

  const con = await dbConnection()
  try {
    const tableName = process.env.DB_TABLE || `log_${date.toISOString().substr(0, 7).replace('-', '_')}`
    const sql = `INSERT INTO ${tableName} (messageId, sourceArn, source,sendingAccountId,subject,timestamp,content) VALUES (?, ?, ?, ?, ?, ?, ?)`
    const insertRecord = [message.mail.messageId, message.mail.sourceArn, message.mail.source, message.mail.sendingAccountId, item.subject, date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0], item.content]
    //TODO: GET THE URL TO FORWARD TO FROM MYSQL
    await axios.post('/', element.Sns);
    await con.query('START TRANSACTION')
    await con.query(sql, insertRecord)
    await con.query('COMMIT')    
    
  } catch (error) {
    await con.query('ROLLBACK')
    context.fail(error)
  } finally {
    await con.release()
    await con.destroy()
    context.succeed()
  }
}
