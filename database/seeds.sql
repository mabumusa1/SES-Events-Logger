INSERT INTO `clients` 
(id, `client_name`) 
VALUES 
(2, 'kruegermarketing'),
(3, 'realgrader'),
(4, 'lpg'),
(5, 'steercampaign');


INSERT INTO `forwarder`
(`client_id`, `arn`, `from_email`, `url`)
VALUES
(null,'arn:aws:ses:us-east-1:054748153214:identity/iabaustralia.com.au','iabaustralia.com.au', 'https://m.iabaustralia.com.au/mailer/amazon/callback'),
(2,'arn:aws:ses:us-east-1:054748153214:identity/kruegermarketing.com','kruegermarketing.com', 'https://m.kruegermarketing.com/mailer/amazon/callback'),
(null,'arn:aws:ses:us-east-1:054748153214:identity/m.mirusaustralia.com','m.mirusaustralia.com', 'https://mtc.mirusaustralia.com/mailer/amazon/callback' ),
(3,'arn:aws:ses:us-east-1:054748153214:identity/realgrader.co','realgrader.co', 'https://engage.realgrader.co/mailer/amazon/callback'),
(3,'arn:aws:ses:us-east-1:054748153214:identity/realgrader.com','realgrader.com', 'https://engage.realgrader.co/mailer/amazon/callback'),
(4,'arn:aws:ses:us-east-1:054748153214:identity/lifestyleproductiongroup.com','lifestyleproductiongroup.com', 'https://engage.lifestyleproductiongroup.com/mailer/amazon/callback'),
(5,'arn:aws:ses:us-east-1:054748153214:identity/ma2.grinder.cloud','ma2.grinder.cloud', 'https://213cdf33d6ebf3992c4d921fbf49bfaf.m.pipedream.net');
