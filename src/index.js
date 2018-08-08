const https = require('https');
const url   = require('url');

const parse = (val) => {
  try {
    return JSON.parse(val);
  } catch (error) {
    return {text: val};
  }
};

exports.handler = function(event, context) {
  (event.Records || []).forEach(function (rec) {
    if (rec.Sns) {
      const body             = parse(rec.Sns.Message);
      const slack_req_opts   = url.parse(process.env.SLACK_WEBHOOK_URL || rec.Sns.MessageAttributes.SlackWebhookUrl.Value);
      slack_req_opts.method  = 'POST';
      slack_req_opts.headers = {'Content-Type': 'application/json'};
      
      const req = https.request(slack_req_opts, function (res) {
        if (res.statusCode === 200) {
          context.succeed('posted to slack');
        } else {
          context.fail('status code: ' + res.statusCode);
        }
      });

      req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
        context.fail(e.message);
      });

      req.write(JSON.stringify(body));
      req.end();
    }
  });
};
