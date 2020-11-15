exports.handler = async (event, context) => {
  const dbConnection = require('./dbConnectionPool');

    /**
     * We have two types to be handled 
     * Notifications from SES without a configuration set
     * eventType from SES with configuraton set 
     */
    let element = event.Records[0];
    let payload = element.Sns;
    let message = null;
    let recordType = null;
    
    // This is a Notification from SES 
    if (Object.keys(payload).includes("Type")){
      message = JSON.parse(element.Sns.Message);
      recordType = message['notificationType'].toLowerCase();
    }else{
      // This is a SNS notification 
      recordType = element.Sns.eventType.toLowerCase();
      message = element.Sns;
    }
    let item = [];

    // We want to store the subject line 
    if('commonHeaders' in message.mail){
      item['subject'] = message.mail.commonHeaders.subject
    }else{
      item['subject'] = null;
    }


    // Add Items based on the message type to content field
    switch (recordType) {
      case 'bounce':
        let bounceObj = {
          reportingMTA: message.bounce.reportingMTA,
          bounceType: message.bounce.bounceType,
          bounceSubType: message.bounce.bounceSubType,
          bouncedRecipients: message.bounce.bouncedRecipients,
          timestamp: message.bounce.timestamp
        }
        item['content'] = JSON.stringify(bounceObj);
        break;
      case 'complaint':
        let complaintObj = {
          userAgent: message.complaint.userAgent,
          complainedRecipients: message.complaint.complainedRecipients,
          complaintFeedbackType: message.complaint.complaintFeedbackType,
          timestamp: message.complaint.timestamp,
          arrivalDate: message.complaint.arrivalDate
        }
        item['content'] = JSON.stringify(complaintObj);
        break;
      case 'delivery':
        let deliveryObj = {
          recipients: message.delivery.recipients,
          reportingMTA: message.delivery.reportingMTA,
          smtpResponse: message.delivery.smtpResponse,
          timestamp: message.delivery.timestamp
        }
        item['content'] = JSON.stringify(deliveryObj);
        break;
      case 'deliverydelay':
        let deliveryDelayObj = {
          delayType: message.deliveryDelay.delayType,
          expirationTime: message.deliveryDelay.expirationTime,
          delayedRecipients: message.deliveryDelay.delayedRecipients,
          timestamp: message.deliveryDelay.timestamp
        }
        item['content'] = JSON.stringify(deliveryDelayObj);
        break;
      case 'click':
        let clickObj = {
          ipAddress: message.click.ipAddress,
          link: message.click.link,
          linkTags: message.click.linkTags,
          userAgent: message.click.userAgent,
          timestamp: message.click.timestamp
        }
        item['content'] = JSON.stringify(clickObj);
        break;
      case 'open':
        let openObj = {
          ipAddress: message.open.ipAddress,
          userAgent: message.open.userAgent,
          timestamp: message.open.timestamp
        }
        item['content'] = JSON.stringify(openObj);
        break;
      case 'reject':
        let rejectObj = {
          reason: message.reject.reason
        }
        item['content'] = JSON.stringify(rejectObj);
        break;
      case 'rendering failure':
        let failureObj = {
          errorMessage: message.failure.errorMessage,
          templateName: message.failure.templateName
        }
        item['content'] = JSON.stringify(failureObj);
        break;
      case 'send':
        let sendObj = {}
        item['content'] = JSON.stringify(sendObj);
        break;

      default:
        return context.fail('Undefined Event Type');
    }

    var date = new Date(message.mail.timestamp);

    let con = await dbConnection();
    try {
      const tableName = process.env.DB_TABLE || `log_${date.toISOString().substr(0, 7).replace('-', '_')}`
      var sql = `INSERT INTO ${tableName} (messageId, sourceArn, source,sendingAccountId,subject,timestamp,content) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      var insertRecord = [message.mail.messageId, message.mail.sourceArn, message.mail.source, message.mail.sendingAccountId, item['subject'],date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0], item['content']]     
      await con.query("START TRANSACTION");
      await con.query(sql, insertRecord)  
      await con.query("COMMIT");
    } catch (error) {
      await con.query("ROLLBACK");
      context.fail(error);
    } finally {
      await con.release();
      await con.destroy();
      context.succeed();
    }
   
}