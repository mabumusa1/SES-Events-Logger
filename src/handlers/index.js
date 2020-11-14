exports.handler = (event, context) => {
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

    // Compile the general structure to be stored in the db
    let item = {
      messageId: message.mail.messageId,
      eventType: recordType,
      sourceArn: message.mail.sourceArn,
      source: message.mail.source,
      destination: JSON.stringify(message.mail.destination),
      subject: null,
      content: '',
      timestamp: message.mail.timestamp
    }
    // We want to store the subject line 
    if('commonHeaders' in message.mail){
      item.subject = message.mail.commonHeaders.subject
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
        context.fail('Undefined Event Type');
        break;
    }
    context.succeed(item);
}