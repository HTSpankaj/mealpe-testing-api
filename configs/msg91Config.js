const config = {
    auth_key: "402858AGD4HFBwoV65042ca9P1",
    senderId:"",
    email_domain:"mealpe.org",
    email_from:"info@mealpe.org",

    //* templates
    otp_template_id: '650ab13bd6fc0535ea202243',
    email_otp_template_id:"global_otp",

    //* API
    send_mobile_otp_api: 'https://control.msg91.com/api/v5/otp',
    verify_mobile_otp_api: 'https://control.msg91.com/api/v5/otp/verify',
    send_email_api: 'https://control.msg91.com/api/v5/email/send',
    send_mobile_sms: 'https://control.msg91.com/api/v5/flow/',
};

exports.config = config;