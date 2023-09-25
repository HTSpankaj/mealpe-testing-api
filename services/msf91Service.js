const { default: axios } = require("axios");
var msg91config = require("../configs/msg91Config");

async function sendMobileOtp(mobile, template_id) {
    try {
        const options = {
            method: 'POST',
            url: `${msg91config.config.send_mobile_otp_api}?template_id=${template_id}&otp_length=6&mobile=${mobile}`,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authkey: msg91config.config.auth_key
            },
            data: { Param1: 'value1', Param2: 'value2', Param3: 'value3' }
        };

        const response = await axios.default.request(options);

        const responseData = response.data;
        if (responseData.type === 'success') {
            console.log('OTP sent successfully');
            console.log(responseData);
            return responseData;
        } else {
            console.error('Failed to send OTP:', responseData.message);
            return response.data;
        }
    } catch (error) {
        console.error('Error sending OTP:', error.message);
        return null;
    }
}

async function verifyMobileOtp(mobile, otp) {
    try {
        const options = {
            method: 'GET',
            url: `${msg91config.config.verify_mobile_otp_api}?otp=${otp}&mobile=${mobile}`,
            headers: { accept: 'application/json', authkey: msg91config.config.auth_key }
        };

        console.log(options);

        const response = await axios.default.request(options)
        const responseData = response.data;
        
        console.log("response.data", response.data)
        if (responseData.type === 'success') {
            console.log('OTP verification successful');
            return responseData;
        } else {
            console.error('OTP verification failed:', responseData.message);
            return response.data;
        }


        // if (otp === 123456) {
        //   console.log('OTP verification successful');
        //   return {
        //     success: true,
        //     message: 'OTP verification successful'

        //   };
        // } else {
        //   console.error('OTP verification failed:');
        //   return null;
        // }
    } catch (error) {
        console.error('Error verifying OTP:', error.message);
        return null;
    }
}

async function sendEmail(email_to, email_cc, email_bcc, emailVariables, template_id) {
    //? doc url => https://docs.msg91.com/reference/send-email 
    //* email_to ex. => [{name: 'Recipient1 NAME', email: 'Recipient1 email'}]
    //* email_cc ex. => [{name: 'Recipient2 NAME', email: 'Recipient2 email'}]
    //* email_bcc ex. => [{name: 'Recipient3 NAME', email: 'Recipient3 email'}]
    //* emailVariables ex. => {name: 'Name 1'}
    //* template_id (string)
    try {
        const options = {
            method: 'POST',
            url: msg91config.config.send_email_api,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authkey: msg91config.config.auth_key
            },
            data: {
                recipients: [{ 
                    to: email_to,
                    cc: email_cc,
                    bcc: email_bcc,
                    variables: emailVariables 
                }],
                from: { name: 'Mealpe', email: '' },
                domain: 'The domain which you have registered with us. We sign DKIM with this domain.',
                template_id: template_id
            }
        };

        const response = await axios.default.request(options);
        const responseData = response.data;

        if (responseData.status === 'success') {
            console.log('Email sent successfully');
            console.log(responseData);
            return responseData;
        } else {
            console.error('Failed to send email:', responseData.message);
            return responseData;
        }
    } catch (error) {
        console.error('Error sending email:', error.message);
        return null;
    }
}

async function sendMobileSMS(mobile, template_id) {
    try {
        const options = {
            method: 'POST',
            url: msg91config.config.send_mobile_sms,
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
              authkey: msg91config.config.auth_key
            },
            data: {
              template_id: template_id,
              short_url: '1 (On) or 0 (Off)',
              recipients: [{mobiles: mobile, VAR1: 'VALUE1', VAR2: 'VALUE2'}]
            }
          };
        const response = await axios.default.request(options);

        const responseData = response.data;
        if (responseData.type === 'success') {
            console.log(responseData);
            return responseData;
        } else {
            console.error('Failed to send OTP:', responseData.message);
            return response.data;
        }
    } catch (error) {
        console.error('Error sending OTP:', error.message);
        return null;
    }
}

 function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000);
  }

module.exports = {
    sendMobileOtp,
    verifyMobileOtp,
    sendEmail,
    generateOTP,
    sendMobileSMS
}

